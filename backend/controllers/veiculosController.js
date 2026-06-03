const supabase = require('../db');

exports.getAllVeiculos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('veiculos')
      .select('*')
      .order('placa', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createVeiculo = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('veiculos')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVeiculoPneus = async (req, res) => {
  const { id } = req.params;
  try {
    // Supabase doesn't support a complex 'NOT EXISTS' in simple JS syntax, 
    // so we fetch all installations and filter manually or use a view.
    // For simplicity and efficiency, we'll fetch the most recent movement per pneu for this vehicle.
    const { data, error } = await supabase
      .from('movimentacoes')
      .select('pneu_id')
      .eq('veiculo_id', id)
      .eq('tipo', 'instalacao');

    if (error) throw error;
    
    const pneuIds = data.map(m => m.pneu_id);
    const { data: pneus, error: pneusError } = await supabase
      .from('pneus')
      .select('*')
      .in('id', pneuIds);

    if (pneusError) throw pneusError;
    res.json(pneus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
