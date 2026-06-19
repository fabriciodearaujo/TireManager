import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, X, Trash2, Search, Loader2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';

const Reformas = () => {
  const toast = useToast();
  const [reformas, setReformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [formData, setFormData] = useState({
    pneu_id: '', empresa: '', valor: '', data_envio: '', data_retorno: '', numero_reforma: '', observacoes: ''
  });
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Tire Search (Reform)
  const [pneuSearch, setPneuSearch] = useState('');
  const [pneuSuggestions, setPneuSuggestions] = useState([]);
  const [isSearchingPneu, setIsSearchingPneu] = useState(false);
  const [selectedPneu, setSelectedPneu] = useState(null);

  const paginatedReformas = reformas.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    fetchReformas();
  }, []);

  // Pneu Search Effect
  useEffect(() => {
    const handlePneuSearch = async () => {
      if (pneuSearch.length < 2) {
        setPneuSuggestions([]);
        return;
      }
      setIsSearchingPneu(true);
      try {
        const { data, error } = await supabase
          .from('pneus')
          .select('id, serial_number, marca, status')
          .ilike('serial_number', `%${pneuSearch}%`)
          .limit(10);
        if (error) throw error;
        setPneuSuggestions(data);
      } catch (err) {
        console.error('Error searching pneus:', err);
      } finally {
        setIsSearchingPneu(false);
      }
    };
    const timeoutId = setTimeout(handlePneuSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [pneuSearch]);

  const fetchReformas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reformas')
        .select('*, pneus(serial_number)')
        .order('data_envio', { ascending: false });
      
      if (error) throw error;
      setReformas(data.map(r => ({ ...r, serial_number: r.pneus?.serial_number })));
    } catch (err) {
      console.error('Error fetching reformas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pneu_id) {
      toast('Selecione um pneu válido da lista de sugestões.', 'error');
      return;
    }
    setIsModalOpen(false);
    try {
      const { data: pneuAtual } = await supabase.from('pneus').select('condicao').eq('id', formData.pneu_id).single();

      const payload = {
        ...formData,
        valor: formData.valor ? Number(formData.valor) : null,
        numero_reforma: formData.numero_reforma ? Number(formData.numero_reforma) : null,
        empresa: formData.empresa || null,
        observacoes: formData.observacoes || null,
        condicao_antes: pneuAtual?.condicao || null,
      };
      const { data: refData, error: refError } = await supabase.from('reformas').insert([payload]).select('*, pneus(serial_number)');
      if (refError) throw refError;

      // 2. Update pneu status and count
      const { data: pneu } = await supabase.from('pneus').select('qtd_reformas, condicao').eq('id', formData.pneu_id).single();
      const { error: pneuError } = await supabase
        .from('pneus')
        .update({ 
          status: 'reforma'
        })
        .eq('id', formData.pneu_id);
      
      if (pneuError) throw pneuError;

      setFormData({ pneu_id: '', empresa: '', valor: '', data_envio: '', data_retorno: '', numero_reforma: '', observacoes: '' });
      setPneuSearch('');
      setSelectedPneu(null);
      setPage(1);
      const { data: freshList } = await supabase.from('reformas').select('*, pneus(serial_number)').order('data_envio', { ascending: false });
      if (freshList) setReformas(freshList.map(r => ({ ...r, serial_number: r.pneus?.serial_number })));
    } catch (err) {
      toast('Erro ao salvar reforma: ' + err.message, 'error');
    }
  };

  const handleComplete = async (id) => {
    try {
      const { data: reform, error: refError } = await supabase.from('reformas').select('pneu_id').eq('id', id).single();
      if (refError || !reform) throw refError;

      // Verify tire is actually in reforma status before completing
      const { data: pneuCheck, error: checkError } = await supabase.from('pneus').select('status, condicao, qtd_reformas').eq('id', reform.pneu_id).single();
      if (checkError || !pneuCheck) throw new Error('Pneu não encontrado');
      if (pneuCheck.status !== 'reforma') throw new Error('Este pneu não está em reforma');

      const { error: pneuError } = await supabase
        .from('pneus')
        .update({ status: 'estoque', condicao: 'Reformado', qtd_reformas: (pneuCheck.qtd_reformas || 0) + 1 })
        .eq('id', reform.pneu_id);
      
      if (pneuError) throw pneuError;

      toast('Reforma concluída!', 'success');
      setPage(1);
      fetchReformas();
    } catch (err) {
      toast('Erro ao concluir reforma: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    setDeleteTarget(null);
    try {
      const { data: reform } = await supabase.from('reformas').select('pneu_id, condicao_antes').eq('id', id).single();
      if (reform) {
        const { data: pneu } = await supabase.from('pneus').select('status, qtd_reformas').eq('id', reform.pneu_id).single();
        const update = {};
        if (pneu && pneu.status === 'reforma') {
          update.status = 'estoque';
          update.qtd_reformas = Math.max(0, (pneu.qtd_reformas || 0) - 1);
          if (reform.condicao_antes) update.condicao = reform.condicao_antes;
        }
        if (Object.keys(update).length > 0) {
          await supabase.from('pneus').update(update).eq('id', reform.pneu_id);
        }
      }
      const { error } = await supabase.from('reformas').delete().eq('id', id);
      if (error) throw error;
      toast('Reforma excluída.', 'success');
      setPage(1);
      fetchReformas();
    } catch (err) {
      toast('Erro ao excluir reforma: ' + err.message, 'error');
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
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-5 py-3"><div className="skeleton h-4 w-20"></div></td>
                    <td className="px-5 py-3"><div className="skeleton h-4 w-8"></div></td>
                    <td className="px-5 py-3"><div className="skeleton h-4 w-16"></div></td>
                    <td className="px-5 py-3"><div className="skeleton h-4 w-20"></div></td>
                    <td className="px-5 py-3"><div className="skeleton h-4 w-14"></div></td>
                    <td className="px-5 py-3"><div className="skeleton h-4 w-12"></div></td>
                  </tr>
                ))
              ) : reformas.length > 0 ? paginatedReformas.map(r => (
                <tr key={r.id} className="border-b border-gray-50">
                  <td className="px-5 py-3 font-mono text-xs">{r.serial_number}</td>
                  <td className="px-5 py-3"><span className="badge badge-reform">{r.numero_reforma}ª</span></td>
                  <td className="px-5 py-3 text-gray-500">{r.empresa}</td>
                  <td className="px-5 py-3 text-gray-400">{r.data_envio}</td>
                  <td className="px-5 py-3 font-medium">R$ {r.valor}</td>
                  <td className="px-5 py-3 flex items-center gap-3">
                    <button onClick={() => handleComplete(r.id)} className="text-green-600 hover:text-green-700 text-xs underline">Concluir</button>
                    <button onClick={() => setDeleteTarget(r.id)} className="text-red-400 hover:text-red-600 transition-colors" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="px-5 py-8 text-center text-gray-400 text-xs">Nenhuma reforma encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination current={page} total={reformas.length} pageSize={pageSize} onChange={p => setPage(p)} />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir reforma"
        message="Tem certeza que deseja excluir esta reforma? Esta ação não pode ser desfeita."
        onConfirm={() => handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 modal-overlay">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg modal-content">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <p className="font-semibold text-gray-800">Registrar reforma</p>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 sm:col-span-2 relative">
                <label className="text-xs text-gray-500">Pneu (Nº Série) *</label>
                <div className="relative">
                  <input 
                    required 
                    type="text" 
                    value={pneuSearch} 
                    onChange={e => setPneuSearch(e.target.value)} 
                    placeholder="Ex: PN-001" 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 font-mono" 
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {isSearchingPneu ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin" /> : <Search className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
                {pneuSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
                    {pneuSuggestions.map(p => (
                      <button 
                        key={p.id} 
                        type="button"
                        onClick={() => {
                          setFormData({...formData, pneu_id: p.id});
                          setPneuSearch(p.serial_number);
                          setSelectedPneu(p);
                          setPneuSuggestions([]);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-50 last:border-none flex justify-between"
                      >
                        <span className="font-mono font-bold">{p.serial_number}</span>
                        <span className="text-gray-400">{p.marca}</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedPneu && (
                  <div className="text-[10px] flex items-center justify-between mt-1">
                    <span className="text-green-600 font-medium">Pneu selecionado ✓</span>
                    <span className="text-gray-500">Status atual: <strong className="text-brand-600">{selectedPneu.status}</strong></span>
                  </div>
                )}
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
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500">Nº da reforma</label>
                <input type="number" value={formData.numero_reforma} onChange={e => setFormData({...formData, numero_reforma: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400" />
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

