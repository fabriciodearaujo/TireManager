const express = require('express');
const router = express.Router();
const pneusController = require('../controllers/pneusController');

router.get('/', pneusController.getAllPneus);
router.get('/:id', pneusController.getPneuById);
router.post('/', pneusController.createPneu);
router.put('/:id', pneusController.updatePneu);

module.exports = router;
