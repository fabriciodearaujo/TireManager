import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search as SearchIcon, Loader2 as LoaderIcon } from 'lucide-react';

const Movimentacoes = () => {
  // Forms
  const [installForm, setInstallForm] = useState({ pneu_id: '', veiculo_id: '', tipo: 'instalacao', posicao: 'Dianteiro esquerdo', quilometragem: '', data: '' });
  const [removeForm, setRemoveForm] = useState({ pneu_id: '', veiculo_id: '', tipo: 'remocao', quilometragem: '', motivo: 'desgaste', data: '', observacoes: '' });
  
  // Vehicle Search (Installation)
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleSuggestions, setVehicleSuggestions] = useState([]);
  const [isSearchingVehicle, setIsSearchingVehicle] = useState(false);

  // Vehicle Search (Removal)
  const [vehicleSearchRemove, setVehicleSearchRemove] = useState('');
  const [vehicleSuggestionsRemove, setVehicleSuggestionsRemove] = useState([]);
  const [isSearchingVehicleRemove, setIsSearchingVehicleRemove] = useState(false);

  // Pneu Search (Installation)
  const [pneuSearchInstall, setPneuSearchInstall] = useState('');
  const [pneuSuggestionsInstall, setPneuSuggestionsInstall] = useState([]);
  const [isSearchingPneuInstall, setIsSearchingPneuInstall] = useState(false);
  const [selectedPneuInstall, setSelectedPneuInstall] = useState(null);

  // Pneu Search (Removal)
  const [pneuSearchRemove, setPneuSearchRemove] = useState('');
  const [pneuSuggestionsRemove, setPneuSuggestionsRemove] = useState([]);
  const [isSearchingPneuRemove, setIsSearchingPneuRemove] = useState(false);
  const [selectedPneuRemove, setSelectedPneuRemove] = useState(null);

  // 1. Vehicle Search Effect
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

  // 2. Vehicle Search Effect (Removal)
  useEffect(() => {
    const handleVehicleSearchRemove = async () => {
      if (vehicleSearchRemove.length < 2) {
        setVehicleSuggestionsRemove([]);
        return;
      }
      setIsSearchingVehicleRemove(true);
      try {
        const { data, error } = await supabase
          .from('veiculos')
          .select('id, placa, frota')
          .ilike('placa', `%${vehicleSearchRemove}%`)
          .limit(10);
        if (error) throw error;
        setVehicleSuggestionsRemove(data);
      } catch (err) {
        console.error('Error searching vehicles for removal:', err);
      } finally {
        setIsSearchingVehicleRemove(false);
      }
    };
    const timeoutId = setTimeout(handleVehicleSearchRemove, 300);
    return () => clearTimeout(timeoutId);
  }, [vehicleSearchRemove]);

  // 3. Pneu Search Effect (Installation) - Filter only in stock/new tires
  useEffect(() => {
    const handlePneuSearchInstall = async () => {
      if (pneuSearchInstall.length < 2) {
        setPneuSuggestionsInstall([]);
        return;
      }
      setIsSearchingPneuInstall(true);
      try {
        const { data, error } = await supabase
          .from('pneus')
          .select('id, serial_number, marca, condicao, status')
          .or("status.eq.estoque,status.eq.novo")
          .ilike('serial_number', `%${pneuSearchInstall}%`)
          .limit(10);
        if (error) throw error;
        setPneuSuggestionsInstall(data);
      } catch (err) {
        console.error('Error searching pneus for install:', err);
      } finally {
        setIsSearchingPneuInstall(false);
      }
    };
    const timeoutId = setTimeout(handlePneuSearchInstall, 300);
    return () => clearTimeout(timeoutId);
  }, [pneuSearchInstall]);

  // 3. Pneu Search Effect (Removal) - Filter only installed tires
  useEffect(() => {
    const handlePneuSearchRemove = async () => {
      if (pneuSearchRemove.length < 2) {
        setPneuSuggestionsRemove([]);
        return;
      }
      setIsSearchingPneuRemove(true);
      try {
        const { data, error } = await supabase
          .from('pneus')
          .select('id, serial_number, marca, condicao, status')
          .eq('status', 'instalado')
          .ilike('serial_number', `%${pneuSearchRemove}%`)
          .limit(10);
        if (error) throw error;
        setPneuSuggestionsRemove(data);
      } catch (err) {
        console.error('Error searching pneus for removal:', err);
      } finally {
        setIsSearchingPneuRemove(false);
      }
    };
    const timeoutId = setTimeout(handlePneuSearchRemove, 300);
    return () => clearTimeout(timeoutId);
  }, [pneuSearchRemove]);

  const handleInstall = async (e) => {
    e.preventDefault();
    if (!installForm.pneu_id || !installForm.veiculo_id) {
      alert('Selecione um pneu e um veículo válidos da lista de sugestões.');
      return;
    }

    try {
      // 1. Fetch current pneu condition
      const { data: pneu, error: pneuFetchError } = await supabase
        .from('pneus')
        .select('condicao')
        .eq('id', installForm.pneu_id)
        .single();
      
      if (pneuFetchError) throw new Error('Pneu não encontrado');

      // 2. Register installation
      const { error: movError } = await supabase
        .from('movimentacoes')
        .insert([{ ...installForm, data: installForm.data || new Date().toISOString() }]);
      
      if (movError) throw movError;

      // 3. Determine new condition
      let newCondition = pneu.condicao || 'Pneu novo';
      if (pneu.condicao === 'Pneu novo') {
        newCondition = 'Novo Usado';
      } else if (pneu.condicao === 'Reformado') {
        newCondition = 'Reformado Usado';
      }

      // 4. Update pneu status and condition
      const { error: pneuError } = await supabase
        .from('pneus')
        .update({ status: 'instalado', condicao: newCondition })
        .eq('id', installForm.pneu_id);
      
      if (pneuError) throw pneuError;

      alert('Instalação registrada com sucesso!');
      setInstallForm({ pneu_id: '', veiculo_id: '', tipo: 'instalacao', posicao: 'Dianteiro esquerdo', quilometragem: '', data: '' });
      setVehicleSearch('');
      setPneuSearchInstall('');
      setSelectedPneuInstall(null);
    } catch (err) {
      alert('Erro ao registrar instalação: ' + err.message);
    }
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    if (!removeForm.pneu_id || !removeForm.veiculo_id) {
      alert('Selecione um pneu e um veículo válidos da lista de sugestões.');
      return;
    }

    try {
      // 1. Register removal
      const { error: movError } = await supabase
        .from('movimentacoes')
        .insert([{ ...removeForm, data: removeForm.data || new Date().toISOString() }]);
      
      if (movError) throw movError;

      // 2. Determine status and condition
      let newStatus = 'estoque';
      let newConditionUpdate = {};
      if (removeForm.motivo === 'reforma') {
        newStatus = 'reforma';
      } else if (removeForm.motivo === 'descarte') {
        newStatus = 'descartado';
        newConditionUpdate = { condicao: 'Sucata' };
      }

      // 3. Update pneu status and condition
      const { error: pneuError } = await supabase
        .from('pneus')
        .update({ status: newStatus, ...newConditionUpdate })
        .eq('id', removeForm.pneu_id);
      
      if (pneuError) throw pneuError;

      alert('Remoção registrada com sucesso!');
      setRemoveForm({ pneu_id: '', veiculo_id: '', tipo: 'remocao', quilometragem: '', motivo: 'desgaste', data: '', observacoes: '' });
      setPneuSearchRemove('');
      setVehicleSearchRemove('');
      setSelectedPneuRemove(null);
    } catch (err) {
      alert('Erro ao registrar remoção: ' + err.message);
    }
  };

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-800 mb-5">Instalações e Remoções</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* ==================== REGISTRAR INSTALAÇÃO ==================== */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-600">↓</div>
            <p className="text-sm font-medium text-gray-700">Registrar instalação</p>
          </div>
          
          <form onSubmit={handleInstall} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Campo: Nº de Série do Pneu */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-xs text-gray-500">Pneu (Nº Série)</label>
              <div className="relative">
                <input 
                  required 
                  type="text" 
                  value={pneuSearchInstall} 
                  onChange={e => setPneuSearchInstall(e.target.value)} 
                  placeholder="Ex: PN-001" 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 font-mono" 
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {isSearchingPneuInstall ? <LoaderIcon className="w-4 h-4 text-gray-400 animate-spin" /> : <SearchIcon className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {pneuSuggestionsInstall.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
                  {pneuSuggestionsInstall.map(p => (
                    <button 
                      key={p.id} 
                      type="button"
                      onClick={() => {
                        setInstallForm({...installForm, pneu_id: p.id});
                        setPneuSearchInstall(p.serial_number);
                        setSelectedPneuInstall(p);
                        setPneuSuggestionsInstall([]);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-50 last:border-none flex justify-between"
                    >
                      <span className="font-mono font-bold">{p.serial_number}</span>
                      <span className="text-gray-400">{p.marca}</span>
                    </button>
                  ))}
                </div>
              )}
              {selectedPneuInstall && (
                <div className="text-[10px] flex items-center justify-between mt-1">
                  <span className="text-green-600 font-medium">Pneu selecionado ✓</span>
                  <span className="text-gray-500">Condição: <strong className="text-brand-600">{selectedPneuInstall.condicao || 'Pneu novo'}</strong></span>
                </div>
              )}
            </div>
            
            {/* Campo: Veículo (Placa) */}
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
                  {isSearchingVehicle ? <LoaderIcon className="w-4 h-4 text-gray-400 animate-spin" /> : <SearchIcon className="w-4 h-4 text-gray-400" />}
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
                <p className="text-[10px] text-green-600 font-medium mt-1">Veículo selecionado ✓</p>
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

        {/* ==================== REGISTRAR REMOÇÃO ==================== */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">↑</div>
            <p className="text-sm font-medium text-gray-700">Registrar remoção</p>
          </div>
          
          <form onSubmit={handleRemove} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Campo: Nº de Série do Pneu (Remoção) */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-xs text-gray-500">Pneu (Nº Série)</label>
              <div className="relative">
                <input 
                  required 
                  type="text" 
                  value={pneuSearchRemove} 
                  onChange={e => setPneuSearchRemove(e.target.value)} 
                  placeholder="Ex: PN-001" 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 font-mono" 
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {isSearchingPneuRemove ? <LoaderIcon className="w-4 h-4 text-gray-400 animate-spin" /> : <SearchIcon className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {pneuSuggestionsRemove.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
                  {pneuSuggestionsRemove.map(p => (
                    <button 
                      key={p.id} 
                      type="button"
                      onClick={() => {
                        setRemoveForm({...removeForm, pneu_id: p.id});
                        setPneuSearchRemove(p.serial_number);
                        setSelectedPneuRemove(p);
                        setPneuSuggestionsRemove([]);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-50 last:border-none flex justify-between"
                    >
                      <span className="font-mono font-bold">{p.serial_number}</span>
                      <span className="text-gray-400">{p.marca}</span>
                    </button>
                  ))}
                </div>
              )}
               {selectedPneuRemove && (
                 <div className="text-[10px] flex items-center justify-between mt-1">
                   <span className="text-green-600 font-medium">Pneu selecionado ✓</span>
                   <span className="text-gray-500">Condição: <strong className="text-amber-600">{selectedPneuRemove.condicao || 'Instalado'}</strong></span>
                 </div>
               )}
             </div>
             
             {/* Campo: Veículo (Placa) - Remoção */}
             <div className="flex flex-col gap-1.5 relative">
               <label className="text-xs text-gray-500">Veículo (Placa)</label>
               <div className="relative">
                 <input 
                   required 
                   type="text" 
                   value={vehicleSearchRemove} 
                   onChange={e => setVehicleSearchRemove(e.target.value.toUpperCase())} 
                   placeholder="Ex: ABC-1D23" 
                   className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 uppercase font-mono" 
                 />
                 <div className="absolute right-2 top-1/2 -translate-y-1/2">
                   {isSearchingVehicleRemove ? <LoaderIcon className="w-4 h-4 text-gray-400 animate-spin" /> : <SearchIcon className="w-4 h-4 text-gray-400" />}
                 </div>
               </div>
               {vehicleSuggestionsRemove.length > 0 && (
                 <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
                   {vehicleSuggestionsRemove.map(v => (
                     <button 
                       key={v.id} 
                       type="button"
                       onClick={() => {
                         setRemoveForm({...removeForm, veiculo_id: v.id});
                         setVehicleSearchRemove(v.placa);
                         setVehicleSuggestionsRemove([]);
                       }}
                       className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-50 last:border-none flex justify-between"
                     >
                       <span className="font-bold">{v.placa}</span>
                       <span className="text-gray-400">{v.frota || 'S/ Frota'}</span>
                     </button>
                   ))}
                 </div>
               )}
               {removeForm.veiculo_id && (
                 <p className="text-[10px] text-green-600 font-medium mt-1">Veículo selecionado ✓</p>
               )}
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
