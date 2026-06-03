const express = require('express');
const router = express.Router();
const veiculosController = require('../controllers/veiculosController');

router.get('/', veiculosController.getAllVeiculos);
router.post('/', veiculosController.createVeiculo);
router.get('/:id/pneus', veiculosController.getVeiculoPneus);

module.exports = router;
