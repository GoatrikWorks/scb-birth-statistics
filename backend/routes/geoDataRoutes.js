const express = require('express');
const router = express.Router();
const config = require('../config/config');
const path = require('path');

/**
 * @swagger
 * tags:
 *   name: Geo Data
 *   description: Geographical data management
 */

/**
 * @swagger
 * /api/municipalities:
 *   get:
 *     summary: Retrieve GeoJSON data for Swedish municipalities
 *     tags: [Geo Data]
 *     responses:
 *       200:
 *         description: GeoJSON data for Swedish municipalities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: GeoJSON object
 *       500:
 *         description: Server error
 */
router.get('/municipalities', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'data', 'swedish_municipalities.geojson'));
});

/**
 * @swagger
 * components:
 *   schemas:
 *     GeoJSON:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           description: The type of GeoJSON object
 *         features:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of feature
 *               properties:
 *                 type: object
 *                 description: Properties of the feature
 *               geometry:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     description: The type of geometry
 *                   coordinates:
 *                     type: array
 *                     description: The coordinates of the geometry
 */

module.exports = router;
