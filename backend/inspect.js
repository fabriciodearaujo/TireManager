const supabase = require('./db');

async function testInsert() {
  console.log("Testing insert on 'pneus' table...");
  const testPneu = {
    serial_number: 'TEST-' + Math.random().toString(36).substring(7).toUpperCase(),
    marca: 'Bridgestone',
    medida: '295/80 R22.5',
    condicao: 'Pneu novo'
  };

  const { data, error } = await supabase
    .from('pneus')
    .insert([testPneu])
    .select();

  if (error) {
    console.error("Insert Error:", error);
  } else {
    console.log("Insert Success! Data:", data);
  }
}

testInsert();
