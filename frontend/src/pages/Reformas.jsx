import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, X } from 'lucide-react';

const Reformas = () => {
  const [reformas, setReformas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    pneu_id: '', empresa: '', valor: '', data_envio: '', data_retorno: '', numero_reforma: '', observacoes: ''
  });

  useEffect(() => {
    fetchReformas();
  }, []);

  const fetchReformas = async () => {
    try {
      const { data, error } = await supabase
        .from('reformas')
        .select('*, pneus(serial_number)')
        .order('data_envio', { ascending: false });
      
      if (error) throw error;
      setReformas(data.map(r => ({ ...r, serial_number: r.pneus?.serial_number })));
    } catch (err) {
      console.error('Error fetching reformas:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Register reform
      const { error: refError } = await supabase.from('reformas').insert([formData]);
      if (refError) throw refError;

      // 2. Update pneu status and count
      const { data: pneu } = await supabase.from('pneus').select('qtd_reformas').eq('id', formData.pneu_id).single();
      const { error: pneuError } = await supabase
        .from('pneus')
        .update({ 
          status: 'reforma', 
          qtd_reformas: (pneu?.qtd_reformas || 0) + 1 
        })
        .eq('id', formData.pneu_id);
      
      if (pneuError) throw pneuError;

      setIsModalOpen(false);
      setFormData({ pneu_id: '', empresa: '', valor: '', data_envio: '', data_retorno: '', numero_reforma: '', observacoes: '' });
      fetchReformas();
    } catch (err) {
      alert('Erro ao salvar reforma: ' + err.message);
    }
  };

  const handleComplete = async (id) => {
    try {
      const { data: reform, error: refError } = await supabase.from('reformas').select('pneu_id').eq('id', id).single();
      if (refError || !reform) throw refError;

      const { error: pneuError } = await supabase.from('pneus').update({ status: 'estoque' }).eq('id', reform.pneu_id);
      if (pneuError) throw pneuError;

      alert('Reforma concluída!');
      fetchReformas();
    } catch (err) {
      alert('Erro ao concluir reforma: ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Controle de Reformas</h2>
          <p className="text-xs text-gray-400 mt-0.5">{reformas.length} reformas registradas</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Nova reforma
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Nº série</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Reforma</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Empresa</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Envio</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Valor</th>
                <th className="px-5 py-3">Ação</th>
              </tr>
            </thead>
            <tbody>
              {reformas.map(r => (
                <tr key={r.id} className="border-b border-gray-50">
                  <td className="px-5 py-3 font-mono text-xs">{r.serial_number}</td>
                  <td className="px-5 py-3"><span className="badge badge-reform">{r.numero_reforma}ª</span></td>
                  <td className="px-5 py-3 text-gray-500">{r.empresa}</td>
                  <td className="px-5 py-3 text-gray-400">{r.data_envio}</td>
                  <td className="px-5 py-3 font-medium">R$ {r.valor}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleComplete(r.id)} className="text-green-600 hover:text-green-700 text-xs underline">Concluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <p className="font-semibold text-gray-800">Registrar reforma</p>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-gray-500">ID Pneu *</label>
                <input required type="number" value={formData.pneu_id} onChange={e => setFormData({...formData, pneu_id: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 font-mono" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500">Empresa</label>
                <input type="text" value={formData.empresa} onChange={e => setFormData({...formData, empresa: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500">Valor (R$)</label>
                <input type="number" step="0.01" value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500">Data de envio</label>
                <input type="date" value={formData.data_envio} onChange={e => setFormData({...formData, data_envio: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500">Retorno previsto</label>
                <input type="date" value={formData.data_retorno} onChange={e => setFormData({...formData, data_retorno: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400" />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-gray-500">Observações</label>
                <textarea rows="2" value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 resize-none"></textarea>
              </div>
              <div className="px-6 pb-5 flex gap-3 justify-end sm:col-span-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors">Salvar reforma</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reformas;

