const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/**
 * GET /api/cities
 * Retrieves city data from JSON file
 */
router.get('/cities', (req, res) => {
    fs.readFile(path.join(__dirname, '..', 'data', 'se.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading city data');
            return;
        }
        res.json(JSON.parse(data));
    });
});

module.exports = router;
