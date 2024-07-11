const express = require('express');
const router = express.Router();
const path = require('path');

/**
 * GET /api/municipalities
 * Retrieves GeoJSON data for Swedish municipalities
 */
router.get('/municipalities', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'data', 'swedish_municipalities.geojson'));
});

module.exports = router;
