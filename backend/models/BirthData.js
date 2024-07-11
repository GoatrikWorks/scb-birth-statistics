const mongoose = require('mongoose');

/**
 * Mongoose schema for birth data
 */
const birthDataSchema = new mongoose.Schema({
    municipalityCode: String,
    municipalityName: String,
    gender: String,
    year: String,
    value: Number
});

module.exports = mongoose.model('BirthData', birthDataSchema);
