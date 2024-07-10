const mongoose = require('mongoose');

const birthDataSchema = new mongoose.Schema({
    municipalityCode: String,
    municipalityName: String,
    gender: String,
    year: Number,
    value: Number
});

module.exports = mongoose.model('BirthData', birthDataSchema);