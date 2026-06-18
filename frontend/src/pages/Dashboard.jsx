import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { AlertCircle as AlertIcon, Clock as ClockIcon } from 'lucide-react';

const MOV_TYPE_LABELS = {
  instalacao: 'Instalação',
  remocao: 'Remoção',
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentMovs, setRecentMovs] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingMovs, setLoadingMovs] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error: rpcError } = await supabase.rpc('get_dashboard_stats');
        if (rpcError) throw rpcError;
        
        if (!data || data.length === 0) {
          throw new Error('Nenhum dado retornado do servidor');
        }

        const s = data[0];
        setStats({
          pneus: {
            em_estoque: s.em_estoque || 0,
            instalados: s.instalados || 0,
            em_reforma: s.em_reforma || 0,
            descartados: s.descartados || 0,
          },
          reformasMes: {
            total: s.reformas_mes_total || 0,
            custo_total: s.reformas_mes_custo || 0
          }
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.message);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchMovs = async () => {
      setLoadingMovs(true);
      try {
        const { data, error: movError } = await supabase
          .from('movimentacoes')
          .select('*, pneus(serial_number), veiculos(placa)')
          .order('data', { ascending: false })
          .limit(5);
        
        if (movError) throw movError;
        setRecentMovs(data.map(m => ({
          ...m,
          serial_number: m.pneus?.serial_number,
          placa: m.veiculos?.placa
        })));
      } catch (err) {
        console.error('Error fetching movs:', err);
      } finally {
        setLoadingMovs(false);
      }
    };

    fetchStats();
    fetchMovs();
  }, []);

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-4">
      <AlertIcon className="w-12 h-12 text-red-500 mb-3" />
      <p className="text-gray-800 font-medium">Erro ao carregar dados</p>
      <p className="text-sm text-gray-500 mb-4">{error}</p>
      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm">Tentar novamente</button>
    </div>
  );

  if (loadingStats) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      <span className="ml-3 text-gray-500">Carregando dados...</span>
    </div>
  );

  if (!stats) return null;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stat-card border-brand-500">
          <p className="text-xs text-gray-400 mb-1">Em estoque</p>
          <p className="text-2xl font-semibold text-brand-600">{stats.pneus.em_estoque}</p>
          <p className="text-xs text-gray-400 mt-1">prontos para uso</p>
        </div>
        <div className="stat-card border-green-500">
          <p className="text-xs text-gray-400 mb-1">Instalados</p>
          <p className="text-2xl font-semibold text-green-600">{stats.pneus.instalados}</p>
          <p className="text-xs text-gray-400 mt-1">em operação</p>
        </div>
        <div className="stat-card border-amber-500">
          <p className="text-xs text-gray-400 mb-1">Em reforma</p>
          <p className="text-2xl font-semibold text-amber-600">{stats.pneus.em_reforma}</p>
          <p className="text-xs text-gray-400 mt-1">aguardando retorno</p>
        </div>
        <div className="stat-card border-red-400">
          <p className="text-xs text-gray-400 mb-1">Descartados</p>
          <p className="text-2xl font-semibold text-red-500">{stats.pneus.descartados}</p>
          <p className="text-xs text-gray-400 mt-1">no acumulado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-700">Reformas no mês</p>
            <span className="text-xs text-gray-400">{new Date().toLocaleString('pt-BR', { month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-semibold text-violet-600">{stats.reformasMes.total}</span>
            <span className="text-sm text-gray-400">reformas · <strong className="text-gray-600">R$ {stats.reformasMes.custo_total}</strong></span>
          </div>
          <div className="text-xs text-gray-400 italic">Dados consolidados do mês atual.</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm font-medium text-gray-700 mb-4">Alertas Rápidos</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <AlertIcon className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">Verificar pneus críticos</p>
                <p className="text-xs text-amber-600 mt-0.5">Alguns pneus podem estar próximos do limite.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <ClockIcon className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Reformas pendentes</p>
                <p className="text-xs text-blue-600 mt-0.5">Verificar prazos de retorno.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Últimas movimentações</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Pneu</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Veículo</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Data</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
               <tbody>
                 {loadingMovs ? (
                   <tr><td colSpan="4" className="px-5 py-8 text-center text-gray-400 text-xs">Carregando movimentações...</td></tr>
                 ) : recentMovs.length > 0 ? (
                   recentMovs.map((mov) => (
                     <tr key={mov.id} className="border-b border-gray-50">
                       <td className="px-5 py-3 font-mono text-xs text-gray-600">{mov.serial_number}</td>
                       <td className="px-5 py-3 font-medium">{mov.placa || '—'}</td>
                       <td className="px-5 py-3 text-gray-400">{new Date(mov.data).toLocaleDateString()}</td>
                       <td className="px-5 py-3">
                         <span className={`badge ${mov.tipo === 'instalacao' ? 'badge-installed' : 'badge-reform'}`}>
                           {MOV_TYPE_LABELS[mov.tipo] || mov.tipo}
                         </span>
                       </td>
                     </tr>
                   ))
                 ) : (
                   <tr><td colSpan="4" className="px-5 py-8 text-center text-gray-400 text-xs">Nenhuma movimentação recente encontrada.</td></tr>
                 )}
               </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;




