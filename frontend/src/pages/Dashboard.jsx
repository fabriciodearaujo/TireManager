import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Package, Wrench, RefreshCw, Trash2, AlertCircle as AlertIcon, Clock as ClockIcon } from 'lucide-react';
import { Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import CountUp from '../components/CountUp';

const MOV_TYPE_LABELS = {
  instalacao: 'Instalação',
  remocao: 'Remoção',
};

const cards = [
  { key: 'em_estoque', label: 'Em estoque', icon: Package, gradient: 'from-blue-500 to-blue-600', suffix: 'prontos para uso' },
  { key: 'instalados', label: 'Instalados', icon: Wrench, gradient: 'from-green-500 to-green-600', suffix: 'em operação' },
  { key: 'em_reforma', label: 'Em reforma', icon: RefreshCw, gradient: 'from-amber-500 to-amber-600', suffix: 'aguardando retorno' },
  { key: 'descartados', label: 'Descartados', icon: Trash2, gradient: 'from-red-500 to-red-600', suffix: 'no acumulado' },
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentMovs, setRecentMovs] = useState([]);
  const [movementsByMonth, setMovementsByMonth] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingMovs, setLoadingMovs] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error: rpcError } = await supabase.rpc('get_dashboard_stats');
        if (rpcError) throw rpcError;
        if (!data || data.length === 0) throw new Error('Nenhum dado retornado do servidor');

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

    const fetchMovementsByMonth = async () => {
      try {
        const { data, error } = await supabase
          .from('movimentacoes')
          .select('data, tipo');

        if (error) throw error;

        const monthCount = {};
        data.forEach(m => {
          const date = new Date(m.data);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!monthCount[key]) monthCount[key] = { mes: key, instalações: 0, remoções: 0 };
          if (m.tipo === 'instalacao') monthCount[key].instalações++;
          else monthCount[key].remoções++;
        });

        setMovementsByMonth(Object.values(monthCount).slice(-6));
      } catch (err) {
        console.error('Error fetching monthly movements:', err);
      }
    };

    fetchStats();
    fetchMovs();
    fetchMovementsByMonth();
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((_, i) => (
        <div key={i} className="rounded-xl p-5 shadow-sm bg-gray-200 skeleton h-32"></div>
      ))}
    </div>
  );

  if (!stats) return null;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(c => {
          const Icon = c.icon;
          const value = stats.pneus[c.key];
          return (
            <div key={c.key} className={`relative rounded-xl p-5 shadow-sm bg-gradient-to-br ${c.gradient} text-white overflow-hidden`}>
              <Icon className="absolute right-3 top-3 w-10 h-10 text-white/20" />
              <p className="text-xs text-white/70 mb-1">{c.label}</p>
              <p className="text-2xl font-bold">
                <CountUp end={value} duration={800} />
              </p>
              <p className="text-[10px] text-white/50 mt-1">{c.suffix}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-700">Reformas no mês</p>
            <span className="text-xs text-gray-400">{new Date().toLocaleString('pt-BR', { month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-semibold text-violet-600"><CountUp end={stats.reformasMes.total} duration={800} /></span>
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

      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-4">Movimentações por mês</p>
        {movementsByMonth.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={movementsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="instalações" fill="#0d68d8" radius={[4, 4, 0, 0]} name="Instalações" />
              <Bar dataKey="remoções" fill="#d97706" radius={[4, 4, 0, 0]} name="Remoções" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">Nenhuma movimentação registrada</div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700">Últimas movimentações</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Pneu</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Veículo</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Data</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {loadingMovs ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="px-5 py-4"><div className="skeleton h-4 w-24"></div></td>
                      <td className="px-5 py-4"><div className="skeleton h-4 w-16"></div></td>
                      <td className="px-5 py-4"><div className="skeleton h-4 w-20"></div></td>
                      <td className="px-5 py-4"><div className="skeleton h-4 w-14"></div></td>
                    </tr>
                  ))
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
                  <tr><td colSpan="4" className="px-5 py-8 text-center text-gray-400 text-xs">Nenhuma movimentação encontrada.</td></tr>
                )}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
