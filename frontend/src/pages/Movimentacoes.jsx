import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Movimentacoes = () => {
  const [installForm, setInstallForm] = useState({ pneu_id: '', veiculo_id: '', tipo: 'instalacao', posicao: 'Dianteiro esquerdo', quilometragem: '', data: '' });
  const [removeForm, setRemoveForm] = useState({ pneu_id: '', tipo: 'remocao', quilometragem: '', motivo: 'desgaste', data: '', observacoes: '' });

  const handleInstall = async (e) => {
    e.preventDefault();
    try {
      // 1. Register installation
      const { error: movError } = await supabase
        .from('movimentacoes')
        .insert([{ ...installForm, data: installForm.data || new Date().toISOString() }]);
      
      if (movError) throw movError;

      // 2. Update pneu status
      const { error: pneuError } = await supabase
        .from('pneus')
        .update({ status: 'instalado' })
        .eq('id', installForm.pneu_id);
      
      if (pneuError) throw pneuError;

      alert('Instalação registrada!');
      setInstallForm({ pneu_id: '', veiculo_id: '', tipo: 'instalacao', posicao: 'Dianteiro esquerdo', quilometragem: '', data: '' });
    } catch (err) {
      alert('Erro ao registrar instalação: ' + err.message);
    }
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    try {
      // 1. Register removal
      const { error: movError } = await supabase
        .from('movimentacoes')
        .insert([{ ...removeForm, data: removeForm.data || new Date().toISOString() }]);
      
      if (movError) throw movError;

      // 2. Determine status
      let newStatus = 'estoque';
      if (removeForm.motivo === 'reforma') newStatus = 'reforma';
      else if (removeForm.motivo === 'descarte') newStatus = 'descartado';

      // 3. Update pneu status
      const { error: pneuError } = await supabase
        .from('pneus')
        .update({ status: newStatus })
        .eq('id', removeForm.pneu_id);
      
      if (pneuError) throw pneuError;

      alert('Remoção registrada!');
      setRemoveForm({ pneu_id: '', tipo: 'remocao', quilometragem: '', motivo: 'desgaste', data: '', observacoes: '' });
    } catch (err) {
      alert('Erro ao registrar remoção: ' + err.message);
    }
  };

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-800 mb-5">Instalações e Remoções</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-600">↓</div>
            <p className="text-sm font-medium text-gray-700">Registrar instalação</p>
          </div>
          <form onSubmit={handleInstall} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500">ID Pneu</label>
              <input required type="number" value={installForm.pneu_id} onChange={e => setInstallForm({...installForm, pneu_id: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 font-mono" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500">ID Veículo</label>
              <input required type="number" value={installForm.veiculo_id} onChange={e => setInstallForm({...installForm, veiculo_id: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500">Posição</label>
              <select value={installForm.posicao} onChange={e => setInstallForm({...installForm, posicao: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white">
                <option>Dianteiro esquerdo</option>
                <option>Dianteiro direito</option>
                <option>Tração E. externo</option>
                <option>Tração D. externo</option>
                <option>Tração E. interno</option>
                <option>Tração D. interno</option>
                <option>Reboque</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500">Quilometragem</label>
              <input required type="number" value={installForm.quilometragem} onChange={e => setInstallForm({...installForm, quilometragem: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400" />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs text-gray-500">Data de instalação</label>
              <input required type="date" value={installForm.data} onChange={e => setInstallForm({...installForm, data: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400" />
            </div>
            <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors">Registrar instalação</button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">↑</div>
            <p className="text-sm font-medium text-gray-700">Registrar remoção</p>
          </div>
          <form onSubmit={handleRemove} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500">ID Pneu</label>
              <input required type="number" value={removeForm.pneu_id} onChange={e => setRemoveForm({...removeForm, pneu_id: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 font-mono" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500">Quilometragem</label>
              <input required type="number" value={removeForm.quilometragem} onChange={e => setRemoveForm({...removeForm, quilometragem: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500">Motivo</label>
              <select value={removeForm.motivo} onChange={e => setRemoveForm({...removeForm, motivo: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white">
                <option value="desgaste">Desgaste normal</option>
                <option value="furo">Furo / avaria</option>
                <option value="reforma">Envio para reforma</option>
                <option value="preventiva">Troca preventiva</option>
                <option value="descarte">Descarte</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500">Data de remoção</label>
              <input required type="date" value={removeForm.data} onChange={e => setRemoveForm({...removeForm, data: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400" />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs text-gray-500">Observações</label>
              <textarea rows="2" value={removeForm.observacoes} onChange={e => setRemoveForm({...removeForm, observacoes: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 resize-none"></textarea>
            </div>
            <button className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm py-2.5 rounded-lg transition-colors">Registrar remoção</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Movimentacoes;

