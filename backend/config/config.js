const config = {
    development: {
        API_URL: 'http://localhost:5001',
        FRONTEND_URL: 'http://localhost:3000',
        MONGODB_URI: 'mongodb://127.0.0.1:27017/scb_birth_data',
        SCB_API_URL: 'https://api.scb.se/OV0104/v1/doris/sv/ssd/START/BE/BE0101/BE0101H/FoddaK',
        PORT: 5001,
        NODE_ENV: 'development',
        JWT_SECRET: 'your_jwt_secret_here',
        JWT_EXPIRATION: '1d',
        CACHE_TTL: 3600,
        RATE_LIMIT: {
            windowMs: 15 * 60 * 1000,
            max: 100
        },
        CORS_OPTIONS: {
            origin: 'http://localhost:3000',
            optionsSuccessStatus: 200
        },
        LOGGING: {
            level: 'debug',
            filename: './logs/app.log'
        }
    },
    production: {
        API_URL: process.env.API_URL,
        FRONTEND_URL: process.env.FRONTEND_URL,
        MONGODB_URI: process.env.MONGODB_URI,
        SCB_API_URL: 'https://api.scb.se/OV0104/v1/doris/sv/ssd/START/BE/BE0101/BE0101H/FoddaK',
        PORT: process.env.PORT || 5001,
        NODE_ENV: 'production',
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1d',
        CACHE_TTL: process.env.CACHE_TTL || 3600,
        RATE_LIMIT: {
            windowMs: 15 * 60 * 1000,
            max: process.env.RATE_LIMIT_MAX || 100
        },
        CORS_OPTIONS: {
            origin: process.env.FRONTEND_URL,
            optionsSuccessStatus: 200
        },
        LOGGING: {
            level: process.env.LOG_LEVEL || 'info',
            filename: process.env.LOG_FILE || './logs/app.log'
        }
    }
};

const env = process.env.NODE_ENV || 'development';

module.exports = config[env];
