import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Search } from 'lucide-react';

const Historico = () => {
  const [pneuId, setPneuId] = useState('');
  const [data, setData] = useState(null);

  const handleSearch = async () => {
    try {
      const { data: pneu, error: pneuError } = await supabase
        .from('pneus')
        .select('*')
        .eq('id', pneuId)
        .single();
      
      if (pneuError || !pneu) throw pneuError;

      const { data: history, error: histError } = await supabase
        .from('movimentacoes')
        .select('*')
        .eq('pneu_id', pneuId)
        .order('data', { ascending: false });

      if (histError) throw histError;

      setData({ pneu, history });
    } catch (err) {
      alert('Pneu não encontrado');
    }
  };

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-800 mb-5">Histórico do Pneu</h2>
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 mb-5">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input type="text" value={pneuId} onChange={e => setPneuId(e.target.value)} placeholder="ID do pneu..." className="flex-1 text-sm outline-none bg-transparent text-gray-700 font-mono" />
        <button onClick={handleSearch} className="bg-brand-500 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-brand-600 transition-colors">Buscar</button>
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
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Reformas</p>
                <p className="text-lg font-semibold text-gray-800">{data.pneu.qtd_reformas}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Valor Compra</p>
                <p className="text-lg font-semibold text-gray-800">R$ {data.pneu.valor_compra}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Vida Útil</p>
                <p className="text-lg font-semibold text-brand-600">{data.pneu.vida_util_acumulada} km</p>
              </div>
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
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(mov.data).toLocaleDateH() || new Date(mov.data).toLocaleDateString()} · Km {mov.quilometragem}</p>
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

