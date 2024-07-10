const express = require('express');
const router = express.Router();
const birthDataController = require('../controllers/birthDataController');

router.get('/', birthDataController.getAllBirthData);
router.get('/update', birthDataController.updateBirthData);

module.exports = router;
