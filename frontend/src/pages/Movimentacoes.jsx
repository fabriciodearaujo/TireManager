import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search, Loader2 } from 'lucide-react';

const Movimentacoes = () => {
  const [installForm, setInstallForm] = useState({ pneu_id: '', veiculo_id: '', tipo: 'instalacao', posicao: 'Dianteiro esquerdo', quilometragem: '', data: '' });
  const [removeForm, setRemoveForm] = useState({ pneu_id: '', tipo: 'remocao', quilometragem: '', motivo: 'desgaste', data: '', observacoes: '' });
  
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleSuggestions, setVehicleSuggestions] = useState([]);
  const [isSearchingVehicle, setIsSearchingVehicle] = useState(false);

  useEffect(() => {
    const handleVehicleSearch = async () => {
      if (vehicleSearch.length < 2) {
        setVehicleSuggestions([]);
        return;
      }

      setIsSearchingVehicle(true);
      try {
        const { data, error } = await supabase
          .from('veiculos')
          .select('id, placa, frota')
          .ilike('placa', `%${vehicleSearch}%`)
          .limit(10);

        if (error) throw error;
        setVehicleSuggestions(data);
      } catch (err) {
        console.error('Error searching vehicles:', err);
      } finally {
        setIsSearchingVehicle(false);
      }
    };

    const timeoutId = setTimeout(handleVehicleSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [vehicleSearch]);

  const handleInstall = async (e) => {
    e.preventDefault();
    try {
      const { data: pneu, error: pneuFetchError } = await supabase
        .from('pneus')
        .select('condicao')
        .eq('id', installForm.pneu_id)
        .single();
      
      if (pneuFetchError) throw new Error('Pneu não encontrado com este ID');

      const { error: movError } = await supabase
        .from('movimentacoes')
        .insert([{ ...installForm, data: installForm.data || new Date().toISOString() }]);
      
      if (movError) throw movError;

      let newCondition = pneu.condicao || 'Pneu novo';
      if (pneu.condicao === 'Pneu novo') {
        newCondition = 'Novo Usado';
      } else if (pneu.condicao === 'Reformado') {
        newCondition = 'Reformado Usado';
      }

      const { error: pneuError } = await supabase
        .from('pneus')
        .update({ status: 'instalado', condicao: newCondition })
        .eq('id', installForm.pneu_id);
      
      if (pneuError) throw pneuError;

      alert('Instalação registrada!');
      setInstallForm({ pneu_id: '', veiculo_id: '', tipo: 'instalacao', posicao: 'Dianteiro esquerdo', quilometragem: '', data: '' });
      setVehicleSearch('');
    } catch (err) {
      alert('Erro ao registrar instalação: ' + err.message);
    }
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    try {
      const { error: movError } = await supabase
        .from('movimentacoes')
        .insert([{ ...removeForm, data: removeForm.data || new Date().toISOString() }]);
      
      if (movError) throw movError;

      let newStatus = 'estoque';
      let newConditionUpdate = {};
      if (removeForm.motivo === 'reforma') {
        newStatus = 'reforma';
      } else if (removeForm.motivo === 'descarte') {
        newStatus = 'descartado';
        newConditionUpdate = { condicao: 'Sucata' };
      }

      const { error: pneuError } = await supabase
        .from('pneus')
        .update({ status: newStatus, ...newConditionUpdate })
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
            
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-xs text-gray-500">Veículo (Placa)</label>
              <div className="relative">
                <input 
                  required 
                  type="text" 
                  value={vehicleSearch} 
                  onChange={e => setVehicleSearch(e.target.value.toUpperCase())} 
                  placeholder="Ex: ABC-1D23" 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 uppercase font-mono" 
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {isSearchingVehicle ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin" /> : <Search className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {vehicleSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
                  {vehicleSuggestions.map(v => (
                    <button 
                      key={v.id} 
                      type="button"
                      onClick={() => {
                        setInstallForm({...installForm, veiculo_id: v.id});
                        setVehicleSearch(v.placa);
                        setVehicleSuggestions([]);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-50 last:border-none flex justify-between"
                    >
                      <span className="font-bold">{v.placa}</span>
                      <span className="text-gray-400">{v.frota || 'S/ Frota'}</span>
                    </button>
                  ))}
                </div>
              )}
              {installForm.veiculo_id && (
                <p className="text-[10px] text-green-600 font-medium">Veículo selecionada ✓</p>
              )}
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
