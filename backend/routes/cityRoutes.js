const express = require('express');
const router = express.Router();
const config = require('../config/config');
const fs = require('fs');
const path = require('path');

/**
 * @swagger
 * tags:
 *   name: Cities
 *   description: City data management
 */

/**
 * @swagger
 * /api/cities:
 *   get:
 *     summary: Retrieve city data from JSON file
 *     tags: [Cities]
 *     responses:
 *       200:
 *         description: A list of cities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/City'
 *       500:
 *         description: Error reading city data
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

/**
 * @swagger
 * components:
 *   schemas:
 *     City:
 *       type: object
 *       required:
 *         - city
 *         - lat
 *         - lng
 *         - country
 *         - iso2
 *         - admin_name
 *         - capital
 *         - population
 *         - population_proper
 *       properties:
 *         city:
 *           type: string
 *           description: The name of the city
 *         lat:
 *           type: string
 *           description: Latitude of the city
 *         lng:
 *           type: string
 *           description: Longitude of the city
 *         country:
 *           type: string
 *           description: Country name
 *         iso2:
 *           type: string
 *           description: ISO 2 country code
 *         admin_name:
 *           type: string
 *           description: Administrative area name
 *         capital:
 *           type: string
 *           description: Capital status
 *         population:
 *           type: string
 *           description: Total population
 *         population_proper:
 *           type: string
 *           description: Population within city limits
 */

module.exports = router;
