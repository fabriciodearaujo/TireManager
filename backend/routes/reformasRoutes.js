const express = require('express');
const router = express.Router();
const refController = require('../controllers/reformasController');

router.post('/', refController.createReforma);
router.put('/:id/complete', refController.completeReforma);
router.get('/', refController.getAllReformas);

module.exports = router;
