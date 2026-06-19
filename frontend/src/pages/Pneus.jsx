import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Plus, Search, X, Trash2, Pencil } from 'lucide-react';
import { useToast } from '../components/Toast';
import Pagination from '../components/Pagination';
import Tooltip from '../components/Tooltip';
import ConfirmDialog from '../components/ConfirmDialog';

const Pneus = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [pneus, setPneus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => { setPage(1); }, [searchTerm]);
  const [formData, setFormData] = useState({
    serial_number: '', marca: '', modelo: '', medida: '', dot: '', data_compra: '', valor_compra: '', condicao: 'Pneu novo'
  });

  useEffect(() => {
    fetchPneus();
  }, []);

  const filteredPneus = pneus.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.serial_number.toLowerCase().includes(term) ||
      p.marca.toLowerCase().includes(term) ||
      p.medida.toLowerCase().includes(term)
    );
  });
  const paginatedPneus = filteredPneus.slice((page - 1) * pageSize, page * pageSize);

  const openEdit = (pneu) => {
    setFormData({
      serial_number: pneu.serial_number,
      marca: pneu.marca,
      modelo: pneu.modelo || '',
      medida: pneu.medida,
      dot: pneu.dot || '',
      data_compra: pneu.data_compra || '',
      valor_compra: pneu.valor_compra || '',
      condicao: pneu.condicao || 'Pneu novo',
      status: pneu.status || 'estoque',
    });
    setEditingId(pneu.id);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setFormData({ serial_number: '', marca: '', modelo: '', medida: '', dot: '', data_compra: '', valor_compra: '', condicao: 'Pneu novo', status: 'estoque' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const fetchPneus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pneus')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPneus(data);
    } catch (err) {
      console.error('Error fetching pneus:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsModalOpen(false);
    try {
      const payload = {
        ...formData,
        data_compra: formData.data_compra || null,
        valor_compra: formData.valor_compra ? Number(formData.valor_compra) : null,
        modelo: formData.modelo || null,
        dot: formData.dot || null,
      };

      if (editingId) {
        const updatePayload = { ...payload };
        if (updatePayload.condicao === 'Pneu novo' || updatePayload.condicao === 'Novo Usado') {
          updatePayload.qtd_reformas = 0;
        }
        const { error } = await supabase.from('pneus').update(updatePayload).eq('id', editingId);
        if (error) throw error;
        toast('Pneu atualizado com sucesso!', 'success');
      } else {
        const { data, error } = await supabase.from('pneus').insert([payload]).select();
        if (error) throw error;
        toast('Pneu cadastrado com sucesso!', 'success');
      }

      setEditingId(null);
      setFormData({ serial_number: '', marca: '', modelo: '', medida: '', dot: '', data_compra: '', valor_compra: '', condicao: 'Pneu novo', status: 'estoque' });
      setPage(1);
      const { data: freshList } = await supabase.from('pneus').select('*').order('created_at', { ascending: false });
      if (freshList) { setPneus(freshList); setRefreshKey(k => k + 1); }
    } catch (err) {
      toast('Erro ao salvar pneu: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    setDeleteTarget(null);
    try {
      const { error } = await supabase.from('pneus').delete().eq('id', id);
      if (error) throw error;
      toast('Pneu excluído.', 'success');
      setPage(1);
      const { data: freshList } = await supabase.from('pneus').select('*').order('created_at', { ascending: false });
      if (freshList) { setPneus(freshList); setRefreshKey(k => k + 1); }
    } catch (err) {
      toast('Erro ao excluir pneu: ' + err.message, 'error');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Cadastro de Pneus</h2>
          <p className="text-xs text-gray-400 mt-0.5">{pneus.length} pneus no sistema</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Novo pneu
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 mb-4">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por série, marca ou medida…" className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden" key={refreshKey}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Nº série</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Marca</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Medida</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Descrição</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Reformas</th>
                <th className="px-5 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-5 py-3"><div className="skeleton h-4 w-20"></div></td>
                    <td className="px-5 py-3"><div className="skeleton h-4 w-16"></div></td>
                    <td className="px-5 py-3"><div className="skeleton h-4 w-14"></div></td>
                    <td className="px-5 py-3"><div className="skeleton h-4 w-24"></div></td>
                    <td className="px-5 py-3"><div className="skeleton h-4 w-12"></div></td>
                    <td className="px-5 py-3"><div className="skeleton h-4 w-8"></div></td>
                    <td className="px-5 py-3"><div className="skeleton h-4 w-12"></div></td>
                  </tr>
                ))
              ) : filteredPneus.length > 0 ? paginatedPneus.map(p => (
                <tr key={p.id} className="border-b border-gray-50">
                  <td className="px-5 py-3 font-mono text-xs">{p.serial_number}</td>
                  <td className="px-5 py-3 font-medium text-gray-700">{p.marca}</td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">{p.medida}</td>
                  <td className="px-5 py-3">
                    <Tooltip text={`Condição: ${p.condicao || 'Pneu novo'} · DOT: ${p.dot || '—'}`}>
                    <span className={`badge ${
                      p.condicao === 'Pneu novo' ? 'badge-new' :
                      p.condicao === 'Novo Usado' ? 'badge-stock' :
                      p.condicao === 'Reformado' ? 'badge-reform' :
                      p.condicao === 'Reformado Usado' ? 'badge-installed' :
                      'badge-discard'
                    }`}>
                      {p.condicao || 'Pneu novo'}
                    </span>
                    </Tooltip>
                  </td>
                  <td className="px-5 py-3">
                    <Tooltip text={`Status: ${p.status} · ${p.qtd_reformas} reforma(s)`}>
                    <span className={`badge badge-${p.status}`}>{p.status}</span>
                    </Tooltip>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{p.qtd_reformas}×</td>
                  <td className="px-5 py-3 flex items-center gap-3">
                    <button onClick={() => navigate(`/historico?serial=${p.serial_number}`)} className="text-brand-500 hover:text-brand-600 text-xs underline">Histórico</button>
                    <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-brand-600 transition-colors" title="Editar">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(p.id)} className="text-red-400 hover:text-red-600 transition-colors" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="px-5 py-8 text-center text-gray-400 text-xs">Nenhum pneu encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination current={page} total={filteredPneus.length} pageSize={pageSize} onChange={p => setPage(p)} />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 modal-overlay">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg modal-content">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <p className="font-semibold text-gray-800">{editingId ? 'Editar pneu' : 'Novo pneu'}</p>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-gray-500">Número de série *</label>
                <input required type="text" value={formData.serial_number} onChange={e => setFormData({...formData, serial_number: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 font-mono" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500">Marca *</label>
                <select required value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 bg-white">
                  <option value="">Selecione…</option>
                  <option>Bridgestone</option>
                  <option>Michelin</option>
                  <option>Goodyear</option>
                  <option>Pirelli</option>
                  <option>Outra</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500">Medida *</label>
                <input required type="text" value={formData.medida} onChange={e => setFormData({...formData, medida: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 font-mono" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500">Modelo</label>
                <input type="text" value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500">DOT</label>
                <input type="text" value={formData.dot} onChange={e => setFormData({...formData, dot: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 font-mono" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500">Data de compra</label>
                <input type="date" value={formData.data_compra} onChange={e => setFormData({...formData, data_compra: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500">Valor de compra (R$)</label>
                <input type="number" step="0.01" value={formData.valor_compra} onChange={e => setFormData({...formData, valor_compra: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400" />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-gray-500">Descrição / Condição *</label>
                <select required value={formData.condicao} onChange={e => setFormData({...formData, condicao: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 bg-white">
                  <option>Pneu novo</option>
                  <option>Novo Usado</option>
                  <option>Reformado</option>
                  <option>Reformado Usado</option>
                  <option>Sucata</option>
                </select>
              </div>
              <div className="px-6 pb-5 flex gap-3 justify-end sm:col-span-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors">{editingId ? 'Atualizar pneu' : 'Salvar pneu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir pneu"
        message="Tem certeza que deseja excluir este pneu? Esta ação não pode ser desfeita."
        onConfirm={() => handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Pneus;



