const express = require('express');
const router = express.Router();
const config = require('../config/config');
const birthDataController = require('../controllers/birthDataController');

/**
 * @swagger
 * tags:
 *   name: Birth Data
 *   description: Birth data management
 */

/**
 * @swagger
 * /api/birth-data:
 *   get:
 *     summary: Retrieve all birth data
 *     tags: [Birth Data]
 *     responses:
 *       200:
 *         description: A list of birth data records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BirthData'
 *       500:
 *         description: Server error
 */
router.get('/', birthDataController.getAllBirthData);

/**
 * @swagger
 * /api/birth-data/update:
 *   get:
 *     summary: Update birth data from SCB
 *     tags: [Birth Data]
 *     responses:
 *       200:
 *         description: Birth data successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.get('/update', birthDataController.updateBirthData);

/**
 * @swagger
 * components:
 *   schemas:
 *     BirthData:
 *       type: object
 *       required:
 *         - municipalityCode
 *         - municipalityName
 *         - year
 *         - gender
 *         - value
 *       properties:
 *         municipalityCode:
 *           type: string
 *           description: The municipality code
 *         municipalityName:
 *           type: string
 *           description: The name of the municipality
 *         year:
 *           type: string
 *           description: The year of the data
 *         gender:
 *           type: string
 *           description: The gender (1 for male, 2 for female)
 *         value:
 *           type: number
 *           description: The number of births
 */

module.exports = router;
