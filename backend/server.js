/**
 * @file server.js
 * @description Main server file for the SCB Birth Data API
 * @requires express
 * @requires mongoose
 * @requires cors
 * @requires dotenv
 * @requires swagger-jsdoc
 * @requires swagger-ui-express
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('./config/config');
const birthDataRoutes = require('./routes/birthDataRoutes');
const cityRoutes = require('./routes/cityRoutes');
const geoDataRoutes = require('./routes/geoDataRoutes');

// Load environment variables
dotenv.config();

const app = express();

/**
 * @description Swagger configuration options
 * @type {Object}
 */
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SCB Birth Data API',
            version: '1.0.0',
            description: 'API for retrieving and updating birth statistics from SCB',
            contact: {
                name: 'Erik Elb',
                email: 'erik@goatrik.se',
            },
        },
        servers: [
            {
                url: `http://localhost:${config.PORT}`,
                description: 'Development server',
            },
        ],
    },
    apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @description Connect to MongoDB
 * @returns {Promise} Mongoose connection promise
 */
const connectToMongoDB = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
};

connectToMongoDB();

// Handle connection errors after initial connection
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/birth-data', birthDataRoutes);
app.use('/api', cityRoutes);
app.use('/api', geoDataRoutes);

/**
 * @description Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

/**
 * @description Start the server
 * @returns {Object} Express server instance
 */
const startServer = () => {
    const server = app.listen(config.PORT, () => {
        console.log(`Server running on port ${config.PORT}`);
        console.log(`Swagger documentation available at http://localhost:${config.PORT}/api-docs`);
    });
    return server;
};

const server = startServer();

/**
 * @description Handle unhandled promise rejections
 * @param {Error} reason - Reason for rejection
 * @param {Promise} promise - Rejected promise
 */
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled asynchronous rejection:', reason);
    // Close server and exit process
    server.close(() => process.exit(1));
});

module.exports = app; // For testing purposes
