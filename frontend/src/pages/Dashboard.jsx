import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Package, Wrench, RefreshCw, Trash2, AlertCircle as AlertIcon, Clock as ClockIcon, AlertTriangle, TrendingDown } from 'lucide-react';
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
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentMovs, setRecentMovs] = useState([]);
  const [movementsByMonth, setMovementsByMonth] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingMovs, setLoadingMovs] = useState(true);
  const [error, setError] = useState(null);
  const [alertas, setAlertas] = useState({ reformasPendentes: 0, pneusCriticos: 0, estoqueBaixo: 0, reformasAtrasadas: 0 });
  const [reformasMes, setReformasMes] = useState({ total: 0, custo_total: 0 });

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
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.message);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchAlertas = async () => {
      try {
        const now = new Date().toISOString().split('T')[0];
        const { data: todosPneus } = await supabase.from('pneus').select('id, status, qtd_reformas');
        if (!todosPneus) return;
        const pendentes = todosPneus.filter(p => p.status === 'reforma').length;
        const criticos = todosPneus.filter(p => p.status !== 'descartado' && p.status !== 'reforma' && p.qtd_reformas >= 2).length;
        const estoque = todosPneus.filter(p => p.status === 'estoque').length;
        const { data: refsAtrasadas } = await supabase.from('reformas').select('pneu_id').lt('data_retorno', now);
        let atrasadas = 0;
        if (refsAtrasadas && refsAtrasadas.length > 0) {
          const idsAtrasados = [...new Set(refsAtrasadas.map(r => r.pneu_id))];
          atrasadas = todosPneus.filter(p => idsAtrasados.includes(p.id) && p.status === 'reforma').length;
        }
        setAlertas({
          reformasPendentes: pendentes,
          pneusCriticos: criticos,
          estoqueBaixo: Math.max(0, 10 - estoque),
          reformasAtrasadas: atrasadas,
        });
      } catch (err) {
        console.error('Error fetching alertas:', err);
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

    const fetchReformasMes = async () => {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('reformas')
          .select('valor')
          .gte('data_envio', startOfMonth);
        if (error) throw error;
        const total = data ? data.length : 0;
        const custo_total = data ? data.reduce((sum, r) => sum + (Number(r.valor) || 0), 0) : 0;
        setReformasMes({ total, custo_total });
      } catch (err) {
        console.error('Error fetching reformas do mês:', err);
      }
    };

    fetchStats();
    fetchAlertas();
    fetchReformasMes();
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

  const alertItems = [
    {
      id: 'reformas',
      icon: ClockIcon,
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-800',
      descColor: 'text-amber-600',
      title: 'Reformas pendentes',
      desc: `${alertas.reformasPendentes} pneu(s) aguardando retorno da reformadora.`,
      count: alertas.reformasPendentes,
      link: '/reformas',
    },
    {
      id: 'criticos',
      icon: AlertTriangle,
      bg: 'bg-red-50',
      border: 'border-red-100',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      descColor: 'text-red-600',
      title: 'Pneus críticos',
      desc: `${alertas.pneusCriticos} pneu(s) com 2+ reformas — avalie necessidade de substituição.`,
      count: alertas.pneusCriticos,
      link: '/pneus',
    },
    {
      id: 'atrasadas',
      icon: TrendingDown,
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      iconColor: 'text-orange-600',
      titleColor: 'text-orange-800',
      descColor: 'text-orange-600',
      title: 'Reformas em atraso',
      desc: `${alertas.reformasAtrasadas} reforma(s) com data de retorno vencida.`,
      count: alertas.reformasAtrasadas,
      link: '/reformas',
    },
    {
      id: 'estoque',
      icon: Package,
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      descColor: 'text-blue-600',
      title: 'Estoque baixo',
      desc: alertas.estoqueBaixo > 0
        ? `Apenas ${stats.pneus.em_estoque} pneu(s) em estoque — ideal mínimo 10.`
        : `${stats.pneus.em_estoque} pneu(s) em estoque — nível adequado.`,
      count: stats.pneus.em_estoque,
      link: '/pneus',
    },
  ];

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
        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-700">Alertas Rápidos</p>
          </div>
          <div className="space-y-2 flex-1">
            {alertItems.map(a => {
              const Icon = a.icon;
              return (
                <button
                  key={a.id}
                  onClick={() => navigate(a.link)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg border ${a.bg} ${a.border} hover:opacity-80 transition-opacity text-left`}
                >
                  <Icon className={`w-4 h-4 ${a.iconColor} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${a.titleColor}`}>{a.title}</p>
                      {a.count > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${a.bg} ${a.iconColor} border ${a.border}`}>
                          {a.count}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${a.descColor} mt-0.5`}>{a.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">Reformas no mês</p>
            <span className="text-xs text-gray-400">{new Date().toLocaleString('pt-BR', { month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-semibold text-violet-600"><CountUp end={reformasMes.total} duration={800} /></span>
            <span className="text-sm text-gray-400">reformas · <strong className="text-gray-600">R$ {reformasMes.custo_total.toFixed(2)}</strong></span>
          </div>
          <div className="mt-auto space-y-2 text-xs text-gray-400">
            <div className="flex justify-between py-1.5 px-3 bg-gray-50 rounded-lg">
              <span>Custo médio por reforma</span>
              <span className="font-medium text-gray-700">R$ {reformasMes.total > 0 ? (reformasMes.custo_total / reformasMes.total).toFixed(2) : '0,00'}</span>
            </div>
            {alertas.reformasPendentes > 0 && (
              <div className="flex justify-between py-1.5 px-3 bg-amber-50 rounded-lg border border-amber-100">
                <span className="text-amber-700">Aguardando retorno</span>
                <span className="font-medium text-amber-700">{alertas.reformasPendentes} pneu(s)</span>
              </div>
            )}
            {alertas.reformasAtrasadas > 0 && (
              <div className="flex justify-between py-1.5 px-3 bg-red-50 rounded-lg border border-red-100">
                <span className="text-red-700">Com prazo vencido</span>
                <span className="font-medium text-red-700">{alertas.reformasAtrasadas} reforma(s)</span>
              </div>
            )}
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
