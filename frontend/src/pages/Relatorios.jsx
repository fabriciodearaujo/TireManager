import React from 'react';

const Relatorios = () => {
  const reports = [
    { title: 'Estoque atual', desc: 'Pneus por status, marca e medida', icon: '📊', color: 'bg-blue-100 text-blue-600' },
    { title: 'Custos por veículo', desc: 'Gasto total de pneus por frota', icon: '🚚', color: 'bg-violet-100 text-violet-600' },
    { title: 'Reformas por período', desc: 'Quantidade, custo e empresas', icon: '🔄', color: 'bg-amber-100 text-amber-600' },
    { title: 'Custo por km', desc: 'Eficiência e rentabilidade de cada pneu', icon: '💰', color: 'bg-green-100 text-green-600' },
    { title: 'Pneus críticos', desc: 'Próximos do limite de vida útil', icon: '⚠️', color: 'bg-red-100 text-red-500' },
    { title: 'Histórico completo', desc: 'Toda a vida útil de cada pneu', icon: '📅', color: 'bg-gray-100 text-gray-600' },
  ];

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-800 mb-5">Relatórios Gerenciais</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer group">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:opacity-80 transition-opacity ${r.color}`}>
              <span className="text-lg">{r.icon}</span>
            </div>
            <p className="text-sm font-medium text-gray-800 mb-1">{r.title}</p>
            <p className="text-xs text-gray-400">{r.desc}</p>
            <p className="text-xs text-brand-500 mt-3 font-medium">Gerar relatório →</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Relatorios;
