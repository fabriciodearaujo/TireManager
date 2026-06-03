const supabase = require('../db');

exports.getAllPneus = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pneus')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPneuById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: pneu, error: pneuError } = await supabase
      .from('pneus')
      .select('*')
      .eq('id', id)
      .single();
    
    if (pneuError || !pneu) return res.status(404).json({ error: 'Pneu not found' });
    
    const { data: history, error: histError } = await supabase
      .from('movimentacoes')
      .select('*')
      .eq('pneu_id', id)
      .order('data', { ascending: false });

    const { data: reformas, error: refError } = await supabase
      .from('reformas')
      .select('*')
      .eq('pneu_id', id)
      .order('data_envio', { ascending: false });

    if (histError || refError) throw histError || refError;
    
    res.json({
      pneu: pneu,
      history: history,
      reformas: reformas
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPneu = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pneus')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePneu = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('pneus')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
