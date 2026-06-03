const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pneusRoutes = require('./routes/pneusRoutes');
const veiculosRoutes = require('./routes/veiculosRoutes');
const movimentacoesRoutes = require('./routes/movimentacoesRoutes');
const reformasRoutes = require('./routes/reformasRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pneus', pneusRoutes);
app.use('/api/veiculos', veiculosRoutes);
app.use('/api/movimentacoes', movimentacoesRoutes);
app.use('/api/reformas', reformasRoutes);

app.get('/', (req, res) => {
  res.send('TireManager API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
