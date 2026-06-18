import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Search, X, Trash2 } from 'lucide-react';

const Veiculos = () => {
  const [veiculos, setVeiculos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pneuModal, setPneuModal] = useState(null);
  const [pneuList, setPneuList] = useState([]);
  const [loadingPneus, setLoadingPneus] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    placa: '', frota: '', tipo: 'Cavalo + semirreboque', ano: '', centro_custo: ''
  });

  useEffect(() => {
    fetchVeiculos();
  }, []);

  const filteredVeiculos = veiculos.filter(v => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      v.placa.toLowerCase().includes(term) ||
      (v.frota && v.frota.toLowerCase().includes(term))
    );
  });

  const fetchVeiculos = async () => {
    try {
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .order('placa', { ascending: true });
      
      if (error) throw error;
      setVeiculos(data);
    } catch (err) {
      console.error('Error fetching veiculos:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('veiculos').insert([formData]);
      if (error) throw error;
      
      setIsModalOpen(false);
      setFormData({ placa: '', frota: '', tipo: 'Cavalo + semirreboque', ano: '', centro_custo: '' });
      fetchVeiculos();
    } catch (err) {
      alert('Erro ao salvar veículo: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.')) {
      return;
    }
    try {
      const { error } = await supabase.from('veiculos').delete().eq('id', id);
      if (error) throw error;
      fetchVeiculos();
    } catch (err) {
      alert('Erro ao excluir veículo: ' + err.message);
    }
  };

  const handleViewPneus = async (veiculo) => {
    setPneuModal(veiculo);
    setPneuList([]);
    setLoadingPneus(true);
    try {
      const { data, error } = await supabase
        .from('movimentacoes')
        .select('*, pneus(serial_number, marca, medida, condicao)')
        .eq('veiculo_id', veiculo.id)
        .eq('tipo', 'instalacao')
        .order('data', { ascending: false });
      
      if (error) throw error;

      // Get unique pneus installed on this vehicle (last install per pneu)
      const pneuMap = new Map();
      data.forEach(m => {
        if (!pneuMap.has(m.pneu_id)) {
          pneuMap.set(m.pneu_id, {
            serial_number: m.pneus?.serial_number,
            marca: m.pneus?.marca,
            medida: m.pneus?.medida,
            condicao: m.pneus?.condicao,
            data_instalacao: m.data,
            posicao: m.posicao
          });
        }
      });
      setPneuList(Array.from(pneuMap.values()));
    } catch (err) {
      console.error('Error fetching pneus for vehicle:', err);
      alert('Erro ao carregar pneus do veículo');
    } finally {
      setLoadingPneus(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Cadastro de Veículos</h2>
          <p className="text-xs text-gray-400 mt-0.5">{veiculos.length} veículos cadastrados</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Novo veículo
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 mb-4">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por placa ou frota…" className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Placa</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Frota</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Tipo</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Ano</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Centro de custo</th>
                <th className="px-5 py-3"></th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredVeiculos.map(v => (
                <tr key={v.id} className="border-b border-gray-50">
                  <td className="px-5 py-3 font-semibold tracking-wide uppercase">{v.placa}</td>
                  <td className="px-5 py-3 text-gray-500">{v.frota}</td>
                  <td className="px-5 py-3 text-gray-500">{v.tipo}</td>
                  <td className="px-5 py-3 text-gray-400">{v.ano}</td>
                  <td className="px-5 py-3 text-gray-400">{v.centro_custo}</td>
                  <td className="px-5 py-3"><button onClick={() => handleViewPneus(v)} className="text-brand-500 hover:text-brand-600 text-xs underline">Ver pneus</button></td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleDelete(v.id)} className="text-red-400 hover:text-red-600 transition-colors" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
              <p className="font-semibold text-gray-800">Novo veículo</p>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500">Placa *</label>
                <input required type="text" value={formData.placa} onChange={e => setFormData({...formData, placa: e.target.value.toUpperCase()})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 uppercase font-mono" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500">Frota / Número</label>
                <input type="text" value={formData.frota} onChange={e => setFormData({...formData, frota: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500">Tipo de veículo</label>
                <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 bg-white">
                  <option>Cavalo + semirreboque</option>
                  <option>Caminhão truck</option>
                  <option>Caminhão toco</option>
                  <option>Carreta frigorífica</option>
                  <option>Utilitário</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500">Ano</label>
                <input type="text" value={formData.ano} onChange={e => setFormData({...formData, ano: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400" />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-gray-500">Centro de custo</label>
                <input type="text" value={formData.centro_custo} onChange={e => setFormData({...formData, centro_custo: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400" />
              </div>
              <div className="px-6 pb-5 flex gap-3 justify-end sm:col-span-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors">Salvar veículo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pneuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-800">Pneus do veículo</p>
                <p className="text-xs text-gray-400">{pneuModal.placa} · {pneuModal.frota || 'S/ Frota'}</p>
              </div>
              <button onClick={() => setPneuModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              {loadingPneus ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
                  <span className="ml-2 text-sm text-gray-400">Carregando...</span>
                </div>
              ) : pneuList.length > 0 ? (
                <div className="space-y-2">
                  {pneuList.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-mono font-medium text-gray-800">{p.serial_number}</p>
                        <p className="text-xs text-gray-400">{p.marca} · {p.medida}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium text-brand-600">{p.condicao || '—'}</span>
                        {p.posicao && <p className="text-[10px] text-gray-400 mt-0.5">{p.posicao}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400 text-sm">Nenhum pneu instalado neste veículo.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Veiculos;

