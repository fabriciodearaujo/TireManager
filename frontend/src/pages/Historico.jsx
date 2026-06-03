import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Search } from 'lucide-react';

const Historico = () => {
  const [pneuId, setPneuId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // 1. Busca dados do pneu
      const { data: pneu, error: pneuError } = await supabase
        .from('pneus')
        .select('*')
        .eq('id', pneuId)
        .single();
      
      if (pneuError || !pneu) throw pneuError;

      // 2. Busca movimentações
      const { data: history, error: histError } = await supabase
        .from('movimentacoes')
        .select('*')
        .eq('pneu_id', pneuId)
        .order('data', { ascending: false });

      if (histError) throw histError;

      // 3. Busca todas as reformas para calcular o custo total
      const { data: reformas, error: refError } = await supabase
        .from('reformas')
        .select('valor')
        .eq('pneu_id', pneuId);

      if (refError) throw refError;

      // Cálculos Financeiros
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
      alert('Pneu não encontrado ou erro na busca');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-800 mb-5">Histórico do Pneu</h2>
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 mb-5">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input type="text" value={pneuId} onChange={e => setPneuId(e.target.value)} placeholder="ID do pneu..." className="flex-1 text-sm outline-none bg-transparent text-gray-700 font-mono" />
        <button onClick={handleSearch} disabled={loading} className="bg-brand-500 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-brand-600 transition-colors disabled:opacity-50">
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {data && (
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
              <div className="flex justify-between text-xs"><span className="text-gray-400">Data de compra</span><span className="text-gray-600">{data.pneu.data_compra || '—'}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-400">Valor de compra</span><span className="text-gray-600">R$ {data.pneu.valor_compra || '0,00'}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-400">Gasto com reformas</span><span className="text-gray-600">R$ {data.metrics.totalReformasCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-400">Reformas realizadas</span><span className="text-gray-600 font-medium">{data.pneu.qtd_reformas}×</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm font-medium text-gray-700 mb-4">Linha do tempo</p>
            <div className="space-y-0">
              {data.history.map((mov, idx) => (
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
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historico;

