import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Download, ArrowLeft, Loader2, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Relatorios = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const reports = [
    { id: 'estoque', title: 'Estoque atual', desc: 'Pneus por status, marca e medida', icon: '📊', color: 'bg-blue-100 text-blue-600' },
    { id: 'custos_veiculo', title: 'Custos por veículo', desc: 'Gasto total de pneus por frota', icon: '🚚', color: 'bg-violet-100 text-violet-600' },
    { id: 'reformas', title: 'Reformas por período', desc: 'Quantidade, custo e empresas', icon: '🔄', color: 'bg-amber-100 text-amber-600' },
    { id: 'custo_km', title: 'Custo por km', desc: 'Eficiência e rentabilidade de cada pneu', icon: '💰', color: 'bg-green-100 text-green-600' },
    { id: 'criticos', title: 'Pneus críticos', desc: 'Próximos do limite de vida útil', icon: '⚠️', color: 'bg-red-100 text-red-500' },
    { id: 'historico', title: 'Histórico completo', desc: 'Toda a vida útil de cada pneu', icon: '📅', color: 'bg-gray-100 text-gray-600' },
  ];

  const exportToCSV = (data, filename) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => `"${val}"`).join(',')
    ).join('\\n');
    
    const csvContent = `data:text/csv;charset=utf-8,${headers}\\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (data, title) => {
    if (data.length === 0) return;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 28);
    
    const headers = [Object.keys(data[0])];
    const rows = data.map(row => Object.values(row));
    
    doc.autoTable({
      startY: 35,
      head: headers,
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }, // Brand color (blue)
    });
    
    doc.save(`${title.toLowerCase().replace(/ /g, '_')}.pdf`);
  };

  const fetchReportData = async (reportId) => {
    setLoading(true);
    try {
      let data = [];
      switch (reportId) {
        case 'estoque':
          const { data: pneus } = await supabase.from('pneus').select('*');
          data = pneus.map(p => ({
            'Série': p.serial_number,
            'Marca': p.marca,
            'Medida': p.medida,
            'Status': p.status,
            'Condição': p.condicao
          }));
          break;
        case 'custos_veiculo':
          const { data: veiculos } = await supabase.from('veiculos').select('id, placa, frota');
          const vehicleCosts = [];
          for (const v of veiculos) {
            const { data: movs } = await supabase.from('movimentacoes').select('pneu_id').eq('veiculo_id', v.id);
            const pneuIds = movs.map(m => m.pneu_id);
            const { data: ps } = await supabase.from('pneus').select('valor_compra').in('id', pneuIds);
            const total = ps.reduce((acc, p) => acc + (parseFloat(p.valor_compra) || 0), 0);
            vehicleCosts.push({ 'Placa': v.placa, 'Frota': v.frota || 'S/ Frota', 'Custo Total': total });
          }
          data = vehicleCosts;
          break;
        case 'reformas':
          const { data: refs } = await supabase.from('reformas').select('*');
          data = refs.map(r => ({
            'Pneu ID': r.pneu_id,
            'Empresa': r.empresa,
            'Valor': r.valor,
            'Data Envio': r.data_envio,
            'Data Retorno': r.data_retorno
          }));
          break;
        case 'custo_km':
          const { data: pneusKm } = await supabase.from('pneus').select('*, reformas(valor)');
          data = pneusKm.map(p => {
            const costReformas = (p.reformas || []).reduce((acc, r) => acc + (parseFloat(r.valor) || 0), 0);
            const totalCost = (parseFloat(p.valor_compra) || 0) + costReformas;
            const km = p.vida_util_acumulada || 0;
            return {
              'Série': p.serial_number,
              'Custo Total': totalCost,
              'Km': km,
              'Custo/Km': km > 0 ? (totalCost / km).toFixed(3) : '0.000'
            };
          });
          break;
        case 'criticos':
          const { data: crit } = await supabase.from('pneus').select('*').gt('vida_util_acumulada', 50000);
          data = crit.map(p => ({
            'Série': p.serial_number,
            'Km': p.vida_util_acumulada,
            'Status': p.status
          }));
          break;
        case 'historico':
          const { data: hist } = await supabase.from('movimentacoes').select('*, pneus(serial_number), veiculos(placa)');
          data = hist.map(m => ({
            'Data': m.data,
            'Série': m.pneus?.serial_number,
            'Placa': m.veiculos?.placa,
            'Tipo': m.tipo,
            'Km': m.quilometragem
          }));
          break;
      }
      setReportData(data);
    } catch (err) {
      console.error('Error fetching report:', err);
      alert('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedReport) {
      fetchReportData(selectedReport);
    }
  }, [selectedReport]);

  if (selectedReport) {
    const report = reports.find(r => r.id === selectedReport);
    return (
      <div>
        <button 
          onClick={() => { setSelectedReport(null); setReportData([]); }}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar aos relatórios
        </button>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{report.title}</h2>
            <p className="text-sm text-gray-400">{report.desc}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => exportToCSV(reportData, `relatorio_${report.id}`)}
              disabled={loading || reportData.length === 0}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:bg-gray-300"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
            <button 
              onClick={() => exportToPDF(reportData, report.title)}
              disabled={loading || reportData.length === 0}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:bg-gray-300"
            >
              <FileText className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <span className="ml-3 text-gray-500">Gerando dados...</span>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {reportData.length > 0 && Object.keys(reportData[0]).map(key => (
                      <th key={key} className="px-5 py-3 font-medium text-gray-500 uppercase text-xs">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.length > 0 ? (
                    reportData.map((row, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-5 py-3 text-gray-600">{val}</td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="px-5 py-10 text-center text-gray-400">Nenhum dado encontrado para este relatório.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-800 mb-5">Relatórios Gerenciais</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r, i) => (
          <div 
            key={i} 
            onClick={() => setSelectedReport(r.id)}
            className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer group"
          >
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
