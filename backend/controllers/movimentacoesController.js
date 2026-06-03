const supabase = require('../db');

exports.registerMovimentacao = async (req, res) => {
  const { pneu_id, veiculo_id, tipo, posicao, quilometragem, motivo, observacoes } = req.body;
  try {
    // 1. Register movement
    const { error: movError } = await supabase
      .from('movimentacoes')
      .insert([{ pneu_id, veiculo_id, tipo, posicao, quilometragem, motivo, observacoes }]);
    
    if (movError) throw movError;

    // 2. Determine new status
    let newStatus = 'estoque';
    if (tipo === 'instalacao') {
      newStatus = 'instalado';
    } else if (tipo === 'remocao') {
      if (motivo === 'reforma') newStatus = 'reforma';
      else if (motivo === 'descarte') newStatus = 'descartado';
      else newStatus = 'estoque';
    }

    // 3. Update pneu status
    const { error: pneuError } = await supabase
      .from('pneus')
      .update({ status: newStatus })
      .eq('id', pneu_id);
    
    if (pneuError) throw pneuError;

    res.status(201).json({ message: 'Movimentação registrada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllMovimentacoes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('movimentacoes')
      .select(`
        *,
        pneus(serial_number),
        veiculos(placa)
      `)
      .order('data', { ascending: false });
    
    if (error) throw error;
    
    // Flatten the response to match previous API structure
    const formattedData = data.map(m => ({
      ...m,
      serial_number: m.pneus?.serial_number,
      placa: m.veiculos?.placa
    }));
    
    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
