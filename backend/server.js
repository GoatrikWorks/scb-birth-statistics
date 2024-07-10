const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const birthDataRoutes = require('./routes/birthDataRoutes');

// Ladda miljövariabler
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Anslut till MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/scb_birth_data', {
    serverSelectionTimeoutMS: 5000,
})
    .then(() => console.log('Ansluten till MongoDB'))
    .catch((err) => {
        console.error('Fel vid anslutning till MongoDB:', err);
        process.exit(1);  // Avsluta processen vid anslutningsfel
    });

// Hantera anslutningsfel efter initial anslutning
mongoose.connection.on('error', err => {
    console.error('MongoDB anslutningsfel:', err);
});

// Rutter
app.use('/api/birth-data', birthDataRoutes);

// Felhantering middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Något gick fel!');
});

// Starta servern
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server körs på port ${PORT}`));

// Hantera oväntade fel
process.on('unhandledRejection', (reason, promise) => {
    console.error('Ohandlad asynkron avvisning:', reason);
    // Stäng servern och avsluta processen
    server.close(() => process.exit(1));
});