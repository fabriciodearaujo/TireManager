import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CircleDot, 
  Truck, 
  ArrowLeftRight, 
  RefreshCw, 
  History, 
  FileText, 
  Menu, 
  X,
  LogOut
} from 'lucide-react';
import { supabase } from './supabaseClient';
import Dashboard from './pages/Dashboard';
import Pneus from './pages/Pneus';
import Veiculos from './pages/Veiculos';
import Movimentacoes from './pages/Movimentacoes';
import Reformas from './pages/Reformas';
import Historico from './pages/Historico';
import Relatorios from './pages/Relatorios';
import Login from './pages/Login';

const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  if (!session) return <Navigate to="/login" />;
  return children;
};

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen font-sans">
      <div 
        className={`fixed inset-0 bg-black/40 z-20 transition-opacity duration-250 lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30 flex flex-col transition-transform duration-250 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center text-white text-lg font-bold">T</div>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-none">TireManager</p>
            <p className="text-xs text-gray-400 mt-0.5">Gestão de Pneus</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="ml-auto text-gray-400 hover:text-gray-600 lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          <p className="px-5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Principal</p>
          <Link to="/" className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          
          <p className="px-5 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Cadastros</p>
          <Link to="/pneus" className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <CircleDot className="w-4 h-4" /> Pneus
          </Link>
          <Link to="/veiculos" className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Truck className="w-4 h-4" /> Veículos
          </Link>

          <p className="px-5 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Operações</p>
          <Link to="/movimentacoes" className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <ArrowLeftRight className="w-4 h-4" /> Instalações
          </Link>
          <Link to="/reformas" className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" /> Reformas
          </Link>
          <Link to="/historico" className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <History className="w-4 h-4" /> Histórico
          </Link>

          <p className="px-5 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Gestão</p>
          <Link to="/relatorios" className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <FileText className="w-4 h-4" /> Relatórios
          </Link>
        </nav>

        <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-semibold">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">{user?.email || 'Usuário'}</p>
            <button onClick={handleLogout} className="text-[10px] text-red-500 hover:underline flex items-center gap-1">
              <LogOut className="w-3 h-3" /> Sair
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
          <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 text-gray-600">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-gray-700">TireManager</h1>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs text-gray-400">
                {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
            </div>
          </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/pneus" element={<ProtectedRoute><MainLayout><Pneus /></MainLayout></ProtectedRoute>} />
        <Route path="/veiculos" element={<ProtectedRoute><MainLayout><Veiculos /></MainLayout></ProtectedRoute>} />
        <Route path="/movimentacoes" element={<ProtectedRoute><MainLayout><Movimentacoes /></MainLayout></ProtectedRoute>} />
        <Route path="/reformas" element={<ProtectedRoute><MainLayout><Reformas /></MainLayout></ProtectedRoute>} />
        <Route path="/historico" element={<ProtectedRoute><MainLayout><Historico /></MainLayout></ProtectedRoute>} />
        <Route path="/relatorios" element={<ProtectedRoute><MainLayout><Relatorios /></MainLayout></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
