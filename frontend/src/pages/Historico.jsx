import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Search, Loader2 } from 'lucide-react';
import { useToast } from '../components/Toast';

const Historico = () => {
  const [searchParams] = useSearchParams();
  const serialParam = searchParams.get('serial');
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState(serialParam || '');
  const [suggestions, setSuggestions] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!serialParam);
  const [isSearching, setIsSearching] = useState(false);

  // Auto-load from URL param on mount
  useEffect(() => {
    if (serialParam) {
      const loadFromSerial = async () => {
        try {
          const { data: pneus, error } = await supabase
            .from('pneus')
            .select('id')
            .ilike('serial_number', serialParam)
            .limit(1);
          
          if (error) throw error;
          if (pneus && pneus.length > 0) {
            loadPneuHistory(pneus[0].id);
          }
        } catch (err) {
          console.error('Error auto-loading history:', err);
          setLoading(false);
        }
      };
      loadFromSerial();
    }
  }, []);

  useEffect(() => {
    const handleSearchSuggestions = async () => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data: results, error } = await supabase
          .from('pneus')
          .select('id, serial_number, marca')
          .or(`serial_number.ilike.%${searchTerm}%,id.eq.${searchTerm}`)
          .limit(10);

        if (error) throw error;
        setSuggestions(results);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(handleSearchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadPneuHistory = async (id) => {
    setLoading(true);
    setSearchTerm('');
    setSuggestions([]);
    try {
      const { data: pneu, error: pneuError } = await supabase
        .from('pneus')
        .select('*')
        .eq('id', id)
        .single();
      
      if (pneuError || !pneu) throw pneuError;

      const { data: history, error: histError } = await supabase
        .from('movimentacoes')
        .select('*')
        .eq('pneu_id', id)
        .order('data', { ascending: false });

      if (histError) throw histError;

      const { data: reformas, error: refError } = await supabase
        .from('reformas')
        .select('valor')
        .eq('pneu_id', id);

      if (refError) throw refError;

      const totalReformasCost = reformas.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);
      const totalCost = (parseFloat(pneu.valor_compra) || 0) + totalReformasCost;
      const totalKm = pneu.vida_util_acumulada || 0;
      const costPerKm = totalKm > 0 ? (totalCost / totalKm) : 0;

      setData({ 
        pneu, 
        history, 
        metrics: {
          totalCost,
          totalKm,
          costPerKm,
          totalReformasCost
        }
      });
    } catch (err) {
      toast('Erro ao carregar histórico do pneu', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-800 mb-5">Histórico do Pneu</h2>
      
      <div className="relative mb-5">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input 
            type="text" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            placeholder="Busque por Nº de Série ou ID do pneu..." 
            className="flex-1 text-sm outline-none bg-transparent text-gray-700 font-mono" 
          />
          {isSearching && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
        </div>

        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map(p => (
              <button 
                key={p.id} 
                onClick={() => loadPneuHistory(p.id)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-none flex justify-between items-center"
              >
                <span className="font-mono font-medium">{p.serial_number}</span>
                <span className="text-xs text-gray-400">{p.marca}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <span className="ml-3 text-gray-500">Buscando histórico...</span>
        </div>
      )}

      {!loading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-mono text-sm font-medium text-gray-800">{data.pneu.serial_number}</p>
                <p className="text-xs text-gray-400 mt-0.5">{data.pneu.marca} · {data.pneu.medida} · DOT {data.pneu.dot}</p>
              </div>
              <span className={`badge badge-${data.pneu.status}`}>{data.pneu.status}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Km rodados</p>
                <p className="text-lg font-semibold text-gray-800">{data.metrics.totalKm.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Custo total</p>
                <p className="text-lg font-semibold text-gray-800">R$ {data.metrics.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Custo/km</p>
                <p className="text-lg font-semibold text-brand-600">R$ {data.metrics.costPerKm.toLocaleString('pt-BR', { minimumFractionDigits: 3 })}</p>
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-4">
              <div className="flex justify-between text-xs"><span className="text-gray-400">Descrição / Condição</span><span className="text-gray-600 font-semibold">{data.pneu.condicao || 'Pneu novo'}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-400">Data de compra</span><span className="text-gray-600">{data.pneu.data_compra || '—'}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-400">Valor de compra</span><span className="text-gray-600">R$ {data.pneu.valor_compra || '0,00'}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-400">Gasto com reformas</span><span className="text-gray-600">R$ {data.metrics.totalReformasCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-400">Reformas realizadas</span><span className="text-gray-600 font-medium">{data.pneu.qtd_reformas}×</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm font-medium text-gray-700 mb-4">Linha do tempo</p>
            <div className="space-y-0">
              {data.history.length > 0 ? (
                data.history.map((mov, idx) => (
                  <div key={mov.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs ${mov.tipo === 'instalacao' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                        {mov.tipo === 'instalacao' ? '↓' : '↑'}
                      </div>
                      {idx !== data.history.length - 1 && <div className="w-px flex-1 bg-gray-100 my-1"></div>}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-gray-700">{mov.tipo === 'instalacao' ? `Instalado` : `Removido`}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(mov.data).toLocaleDateString()} · Km {mov.quilometragem}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400 text-sm">Nenhuma movimentação registrada.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {!data && !loading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-dashed border-gray-200">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Digite o número de série ou ID do pneu para visualizar o histórico detalhado.</p>
        </div>
      )}
    </div>
  );
};

export default Historico;


