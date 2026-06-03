const supabase = require('../db');

exports.getDashboardStats = async (req, res) => {
  try {
    const { data: pneus, error: pneusError } = await supabase
      .from('pneus')
      .select('status');
    
    if (pneusError) throw pneusError;

    const stats = {
      em_estoque: pneus.filter(p => p.status === 'estoque').length,
      instalados: pneus.filter(p => p.status === 'instalado').length,
      em_reforma: pneus.filter(p => p.status === 'reforma').length,
      descartados: pneus.filter(p => p.status === 'descartado').length,
    };
    
    // Reformas do mês
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const { data: reformas, error: refError } = await supabase
      .from('reformas')
      .select('valor')
      .gte('data_envio', startOfMonth.toISOString().split('T')[0]);

    if (refError) throw refError;

    const totalReformas = reformas.length;
    const custoTotal = reformas.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

    res.json({
      pneus: stats,
      reformasMes: {
        total: totalReformas,
        custo_total: custoTotal
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
