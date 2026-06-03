const supabase = require('../db');

exports.createReforma = async (req, res) => {
  const { pneu_id, empresa, valor, data_envio, data_retorno, numero_reforma, observacoes } = req.body;
  try {
    // 1. Create reform record
    const { data, error: refError } = await supabase
      .from('reformas')
      .insert([{ pneu_id, empresa, valor, data_envio, data_retorno, numero_reforma, observacoes }])
      .select()
      .single();
    
    if (refError) throw refError;

    // 2. Update pneu status and count
    // Note: Supabase doesn't have an atomic 'increment' in the JS client, 
    // so we fetch first or use a DB function. For now, we'll fetch.
    const { data: pneu } = await supabase
      .from('pneus')
      .select('qtd_reformas')
      .eq('id', pneu_id)
      .single();

    const { error: pneuError } = await supabase
      .from('pneus')
      .update({ 
        status: 'reforma', 
        qtd_reformas: (pneu?.qtd_reformas || 0) + 1 
      })
      .eq('id', pneu_id);

    if (pneuError) throw pneuError;

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.completeReforma = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Get pneu_id from reform
    const { data: reform, error: refError } = await supabase
      .from('reformas')
      .select('pneu_id')
      .eq('id', id)
      .single();
    
    if (refError || !reform) return res.status(404).json({ error: 'Reforma not found' });
    
    // 2. Update pneu status to estoque
    const { error: pneuError } = await supabase
      .from('pneus')
      .update({ status: 'estoque' })
      .eq('id', reform.pneu_id);
    
    if (pneuError) throw pneuError;

    res.json({ message: 'Reforma concluída e pneu retornou ao estoque' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllReformas = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reformas')
      .select(`
        *,
        pneus(serial_number)
      `)
      .order('data_envio', { ascending: false });
    
    if (error) throw error;
    
    const formattedData = data.map(r => ({
      ...r,
      serial_number: r.pneus?.serial_number
    }));
    
    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
