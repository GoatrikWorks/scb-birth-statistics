const axios = require('axios');
const BirthData = require('../models/BirthData');
const NodeCache = require('node-cache');
const { loadCityCoordinates } = require('../utils/cityCoordinates');

const dataCache = new NodeCache({ stdTTL: 3600 });
const cityCoordinates = loadCityCoordinates();

exports.updateBirthData = async (req, res) => {
    try {
        const scbApiUrl = 'https://api.scb.se/OV0104/v1/doris/sv/ssd/START/BE/BE0101/BE0101H/FoddaK';
        const query = {
            "query": [
                {
                    "code": "Region",
                    "selection": {
                        "filter": "vs:RegionKommun07+BaraEjAggr",
                        "values": ["*"]
                    }
                },
                {
                    "code": "Kon",
                    "selection": {
                        "filter": "item",
                        "values": ["1", "2"]
                    }
                },
                {
                    "code": "ContentsCode",
                    "selection": {
                        "filter": "item",
                        "values": ["BE0101N1"]
                    }
                },
                {
                    "code": "Tid",
                    "selection": {
                        "filter": "item",
                        "values": ["2016", "2017", "2018", "2019", "2020"]
                    }
                }
            ],
            "response": {
                "format": "json"
            }
        };

        console.log('Skickar förfrågan till SCB API:', JSON.stringify(query, null, 2));
        const response = await axios.post(scbApiUrl, query, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('SCB API response status:', response.status);
        console.log('SCB API response headers:', response.headers);
        console.log('SCB API response data:', JSON.stringify(response.data, null, 2));

        if (response.status !== 200) {
            throw new Error(`SCB API svarade med status: ${response.status}`);
        }

        const scbData = response.data.data;
        console.log(`Mottog ${scbData.length} datapunkter från SCB API.`);

        let updatedCount = 0;
        for (const item of scbData) {
            const [municipalityCode, gender, year, value] = item.key;
            const municipalityName = item.values[0];
            const coordinates = cityCoordinates[municipalityName] || { lat: 62.0, lng: 15.0 }; // Default till Sveriges mittpunkt om koordinater saknas

            await BirthData.findOneAndUpdate(
                { municipalityCode, gender, year },
                {
                    municipalityName,
                    value: parseInt(value),
                    lat: coordinates.lat,
                    lng: coordinates.lng
                },
                { upsert: true, new: true }
            );
            updatedCount++;
        }

        // Uppdatera cachen
        dataCache.set('allBirthData', await BirthData.find());

        console.log(`Uppdaterade ${updatedCount} datapunkter i databasen.`);
        res.json({ message: `Födseldata har uppdaterats framgångsrikt. ${updatedCount} datapunkter bearbetade.` });
    } catch (error) {
        console.error('Detailed error:', error.response ? error.response.data : error.message);
        console.error('Error status:', error.response ? error.response.status : 'N/A');
        console.error('Error headers:', error.response ? error.response.headers : 'N/A');
        res.status(500).json({ message: 'Fel vid uppdatering av födseldata', error: error.message });
    }
};

exports.getAllBirthData = async (req, res) => {
    try {
        // Försök hämta data från cache
        let birthData = dataCache.get('allBirthData');

        if (!birthData) {
            console.log('Cache miss. Hämtar data från databasen...');
            birthData = await BirthData.find();
            // Uppdatera cachen
            dataCache.set('allBirthData', birthData);
        } else {
            console.log('Hämtade data från cache.');
        }

        console.log(`Returnerar ${birthData.length} datapunkter.`);
        res.json(birthData);
    } catch (error) {
        console.error('Fel vid hämtning av födseldata:', error);
        res.status(500).json({ message: 'Fel vid hämtning av födseldata', error: error.message });
    }
};
