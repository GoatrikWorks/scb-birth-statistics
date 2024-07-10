const fs = require('fs');
const { parse } = require('csv-parse/sync');

function loadCityCoordinates() {
    const fileContent = fs.readFileSync('./data/svenska-stader.csv', 'utf8');
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
    });

    const cityCoordinates = {};
    records.forEach(record => {
        cityCoordinates[record.Locality] = {
            lat: parseFloat(record.Latitude),
            lng: parseFloat(record.Longitude)
        };
    });

    return cityCoordinates;
}

module.exports = { loadCityCoordinates };
