const express = require('express');
const router = express.Router();
const movController = require('../controllers/movimentacoesController');

router.post('/', movController.registerMovimentacao);
router.get('/', movController.getAllMovimentacoes);

module.exports = router;
