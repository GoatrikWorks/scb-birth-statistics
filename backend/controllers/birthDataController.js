/**
 * @file birthDataController.js
 * @description Controller för hantering av födelsedata från SCB
 * @requires axios
 * @requires ../config/config
 * @requires ../models/BirthData
 * @requires node-cache
 * @requires ../data/municipalityMapping
 */

const axios = require('axios');
const config = require('../config/config');
const BirthData = require('../models/BirthData');
const NodeCache = require('node-cache');
const municipalityMapping = require('../data/municipalityMapping');

// Konstanter för API-endpoint och cache-inställningar
const SCB_API_URL = config.SCB_API_URL;
const dataCache = new NodeCache({ stdTTL: config.CACHE_TTL });

/**
 * Skapar frågestrukturen för SCB API
 * @returns {Object} Frågestruktur för SCB API
 */
const createSCBQuery = () => ({
    query: [
        {
            code: "Region",
            selection: {
                filter: "vs:RegionKommun07",
                values: [
                    "0114", "0115", "0117", "0120", "0123", "0125", "0126", "0127", "0128", "0136",
                    "0138", "0139", "0140", "0160", "0162", "0163", "0180", "0181", "0182", "0183",
                    "0184", "0186", "0187", "0188", "0191", "0192", "0305", "0319", "0330", "0331",
                    "0360", "0380", "0381", "0382", "0428", "0461", "0480", "0481", "0482", "0483",
                    "0484", "0486", "0488", "0509", "0512", "0513", "0560", "0561", "0562", "0563",
                    "0580", "0581", "0582", "0583", "0584", "0586", "0604", "0617", "0642", "0643",
                    "0662", "0665", "0680", "0682", "0683", "0684", "0685", "0686", "0687", "0760",
                    "0761", "0763", "0764", "0765", "0767", "0780", "0781", "0821", "0834", "0840",
                    "0860", "0861", "0862", "0880", "0881", "0882", "0883", "0884", "0885", "0980",
                    "1060", "1080", "1081", "1082", "1083", "1214", "1230", "1231", "1233", "1256",
                    "1257", "1260", "1261", "1262", "1263", "1264", "1265", "1266", "1267", "1270",
                    "1272", "1273", "1275", "1276", "1277", "1278", "1280", "1281", "1282", "1283",
                    "1284", "1285", "1286", "1287", "1290", "1291", "1292", "1293", "1315", "1380",
                    "1381", "1382", "1383", "1384", "1401", "1402", "1407", "1415", "1419", "1421",
                    "1427", "1430", "1435", "1438", "1439", "1440", "1441", "1442", "1443", "1444",
                    "1445", "1446", "1447", "1452", "1460", "1461", "1462", "1463", "1465", "1466",
                    "1470", "1471", "1472", "1473", "1480", "1481", "1482", "1484", "1485", "1486",
                    "1487", "1488", "1489", "1490", "1491", "1492", "1493", "1494", "1495", "1496",
                    "1497", "1498", "1499", "1715", "1730", "1737", "1760", "1761", "1762", "1763",
                    "1764", "1765", "1766", "1780", "1781", "1782", "1783", "1784", "1785", "1814",
                    "1860", "1861", "1862", "1863", "1864", "1880", "1881", "1882", "1883", "1884",
                    "1885", "1904", "1907", "1960", "1961", "1962", "1980", "1981", "1982", "1983",
                    "1984", "2021", "2023", "2026", "2029", "2031", "2034", "2039", "2061", "2062",
                    "2080", "2081", "2082", "2083", "2084", "2085", "2101", "2104", "2121", "2132",
                    "2161", "2180", "2181", "2182", "2183", "2184", "2260", "2262", "2280", "2281",
                    "2282", "2283", "2284", "2303", "2305", "2309", "2313", "2321", "2326", "2361",
                    "2380", "2401", "2403", "2404", "2409", "2417", "2418", "2421", "2422", "2425",
                    "2460", "2462", "2463", "2480", "2481", "2482", "2505", "2506", "2510", "2513",
                    "2514", "2518", "2521", "2523", "2560", "2580", "2581", "2582", "2583", "2584"
                ]
            }
        },
        {
            code: "Kon",
            selection: {
                filter: "item",
                values: ["1", "2"]
            }
        },
        {
            code: "Tid",
            selection: {
                filter: "item",
                values: ["2016", "2017", "2018", "2019", "2020"]
            }
        }
    ],
    response: {
        format: "json"
    }
});

/**
 * Hämtar data från SCB API
 * @returns {Promise<Object>} Data från SCB API
 * @throws {Error} Om hämtningen misslyckas
 */
const fetchDataFromSCB = async () => {
    const query = createSCBQuery();
    console.log('Skickar förfrågan till SCB API:', JSON.stringify(query));
    try {
        const response = await axios.post(SCB_API_URL, query, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        console.log('Mottog svar från SCB API:', JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        console.error('Fel vid hämtning av data från SCB:', error.response ? error.response.data : error.message);
        throw new Error('Kunde inte hämta data från SCB API');
    }
};

/**
 * Uppdaterar databasen med hämtad data
 * @param {Object} scbData - Data hämtad från SCB API
 * @returns {Promise<number>} Antalet uppdaterade poster
 * @throws {Error} Om uppdateringen misslyckas
 */
const updateDatabase = async (scbData) => {
    console.log('Uppdaterar databasen med hämtad data...');
    let updatedCount = 0;
    const bulkOps = [];

    for (const { key, values } of scbData.data) {
        const [municipalityCode, gender, year] = key;
        const value = values[0];

        if (!value) {
            console.warn(`Hoppar över odefinierat värde för ${municipalityCode}, ${gender}, ${year}`);
            continue;
        }

        const numericValue = Number(value);
        if (isNaN(numericValue)) {
            console.warn(`Hoppar över icke-numeriskt värde för ${municipalityCode}, ${year}: ${value}`);
            continue;
        }

        const municipalityName = municipalityMapping[municipalityCode] || 'Okänd';

        bulkOps.push({
            updateOne: {
                filter: { municipalityCode, gender, year },
                update: { $set: { value: numericValue, municipalityName } },
                upsert: true
            }
        });

        updatedCount++;
    }

    try {
        await BirthData.bulkWrite(bulkOps);
        console.log(`Totalt antal uppdaterade poster: ${updatedCount}`);
        return updatedCount;
    } catch (error) {
        console.error('Fel vid uppdatering av databasen:', error);
        throw new Error('Kunde inte uppdatera databasen');
    }
};

/**
 * Uppdaterar födelsedata
 * @param {Object} req - Express request-objekt
 * @param {Object} res - Express response-objekt
 */
exports.updateBirthData = async (req, res) => {
    console.log('Mottog förfrågan om att uppdatera födelsedata');
    try {
        const scbData = await fetchDataFromSCB();
        const updatedCount = await updateDatabase(scbData);
        console.log(`Födelsedata uppdaterad. Behandlade ${updatedCount} datapunkter.`);

        // Rensa cachen efter uppdatering
        dataCache.del('allBirthData');

        res.json({ meddelande: `Födelsedata uppdaterad. Behandlade ${updatedCount} datapunkter.` });
    } catch (error) {
        console.error('Fel vid uppdatering av födelsedata:', error);
        res.status(500).json({ meddelande: 'Fel vid uppdatering av födelsedata', fel: error.message });
    }
};

/**
 * Hämtar all födelsedata
 * @param {Object} req - Express request-objekt
 * @param {Object} res - Express response-objekt
 */
exports.getAllBirthData = async (req, res) => {
    console.log('Mottog förfrågan om att hämta all födelsedata');
    try {
        let birthData = dataCache.get('allBirthData');
        if (!birthData) {
            console.log('Cache-miss. Hämtar data från databasen...');
            birthData = await BirthData.find({});
            dataCache.set('allBirthData', birthData);
            console.log('Data hämtad från databasen och cachad.');
        } else {
            console.log('Data hämtad från cache.');
        }
        console.log(`Returnerar ${birthData.length} datapunkter.`);
        res.json(birthData);
    } catch (error) {
        console.error('Misslyckades med att hämta födelsedata:', error);
        res.status(500).json({ meddelande: 'Fel vid hämtning av födelsedata', fel: error.message });
    }
};

/**
 * Hämtar födelsedata för en specifik kommun
 * @param {Object} req - Express request-objekt
 * @param {Object} res - Express response-objekt
 */
exports.getMunicipalityData = async (req, res) => {
    const { municipalityCode } = req.params;
    console.log(`Mottog förfrågan om att hämta födelsedata för kommun: ${municipalityCode}`);
    try {
        const municipalityData = await BirthData.find({ municipalityCode });
        console.log(`Returnerar ${municipalityData.length} datapunkter för kommun ${municipalityCode}`);
        res.json(municipalityData);
    } catch (error) {
        console.error(`Misslyckades med att hämta födelsedata för kommun ${municipalityCode}:`, error);
        res.status(500).json({ meddelande: 'Fel vid hämtning av kommundata', fel: error.message });
    }
};

/**
 * Hämtar aggregerad födelsedata för alla kommuner
 * @param {Object} req - Express request-objekt
 * @param {Object} res - Express response-objekt
 */
exports.getAggregatedData = async (req, res) => {
    console.log('Mottog förfrågan om att hämta aggregerad födelsedata');
    try {
        const aggregatedData = await BirthData.aggregate([
            {
                $group: {
                    _id: { municipalityCode: "$municipalityCode", year: "$year" },
                    totalBirths: { $sum: "$value" },
                    municipalityName: { $first: "$municipalityName" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.municipalityCode": 1 }
            }
        ]);
        console.log(`Returnerar aggregerad data för ${aggregatedData.length} kommun-år-kombinationer`);
        res.json(aggregatedData);
    } catch (error) {
        console.error('Misslyckades med att hämta aggregerad födelsedata:', error);
        res.status(500).json({ meddelande: 'Fel vid hämtning av aggregerad data', fel: error.message });
    }
};

/**
 * Hämtar trenddata för födslar över tid
 * @param {Object} req - Express request-objekt
 * @param {Object} res - Express response-objekt
 */
exports.getBirthTrends = async (req, res) => {
    console.log('Mottog förfrågan om att hämta trenddata för födslar');
    try {
        const trends = await BirthData.aggregate([
            {
                $group: {
                    _id: { year: "$year", gender: "$gender" },
                    totalBirths: { $sum: "$value" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.gender": 1 }
            }
        ]);
        console.log(`Returnerar trenddata för ${trends.length} år-kön-kombinationer`);
        res.json(trends);
    } catch (error) {
        console.error('Misslyckades med att hämta trenddata för födslar:', error);
        res.status(500).json({ meddelande: 'Fel vid hämtning av trenddata', fel: error.message });
    }
};

/**
 * Hämtar jämförelsedata mellan kommuner
 * @param {Object} req - Express request-objekt
 * @param {Object} res - Express response-objekt
 */
exports.compareMunicipalities = async (req, res) => {
    const { municipalityCodes } = req.query;
    console.log(`Mottog förfrågan om att jämföra kommuner: ${municipalityCodes}`);
    try {
        if (!municipalityCodes || municipalityCodes.length === 0) {
            throw new Error('Inga kommunkoder angivna för jämförelse');
        }
        const comparisonData = await BirthData.aggregate([
            {
                $match: { municipalityCode: { $in: municipalityCodes.split(',') } }
            },
            {
                $group: {
                    _id: { municipalityCode: "$municipalityCode", year: "$year" },
                    totalBirths: { $sum: "$value" },
                    municipalityName: { $first: "$municipalityName" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.municipalityCode": 1 }
            }
        ]);
        console.log(`Returnerar jämförelsedata för ${comparisonData.length} datapunkter`);
        res.json(comparisonData);
    } catch (error) {
        console.error('Misslyckades med att hämta jämförelsedata:', error);
        res.status(500).json({ meddelande: 'Fel vid hämtning av jämförelsedata', fel: error.message });
    }
};

/**
 * Hämtar statistik för födelsetal
 * @param {Object} req - Express request-objekt
 * @param {Object} res - Express response-objekt
 */
exports.getBirthStatistics = async (req, res) => {
    console.log('Mottog förfrågan om att hämta statistik för födelsetal');
    try {
        const statistics = await BirthData.aggregate([
            {
                $group: {
                    _id: null,
                    totalBirths: { $sum: "$value" },
                    averageBirths: { $avg: "$value" },
                    maxBirths: { $max: "$value" },
                    minBirths: { $min: "$value" }
                }
            }
        ]);
        console.log('Returnerar statistik för födelsetal');
        res.json(statistics[0]);
    } catch (error) {
        console.error('Misslyckades med att hämta statistik för födelsetal:', error);
        res.status(500).json({ meddelande: 'Fel vid hämtning av statistik', fel: error.message });
    }
};

/**
 * Hämtar topplista över kommuner med högst födelsetal
 * @param {Object} req - Express request-objekt
 * @param {Object} res - Express response-objekt
 */
exports.getTopMunicipalities = async (req, res) => {
    const { year, limit = 10 } = req.query;
    console.log(`Mottog förfrågan om att hämta topplista för år ${year}, gräns: ${limit}`);
    try {
        if (!year) {
            throw new Error('Inget år angivet för topplistan');
        }
        const topMunicipalities = await BirthData.aggregate([
            {
                $match: { year: year }
            },
            {
                $group: {
                    _id: "$municipalityCode",
                    totalBirths: { $sum: "$value" },
                    municipalityName: { $first: "$municipalityName" }
                }
            },
            {
                $sort: { totalBirths: -1 }
            },
            {
                $limit: parseInt(limit)
            }
        ]);
        console.log(`Returnerar topplista med ${topMunicipalities.length} kommuner`);
        res.json(topMunicipalities);
    } catch (error) {
        console.error('Misslyckades med att hämta topplista:', error);
        res.status(500).json({ meddelande: 'Fel vid hämtning av topplista', fel: error.message });
    }
};

/**
 * Hämtar födelsedata filtrerad på specifika kriterier
 * @param {Object} req - Express request-objekt
 * @param {Object} res - Express response-objekt
 */
exports.getFilteredBirthData = async (req, res) => {
    const { year, gender, municipalityCode } = req.query;
    console.log(`Mottog förfrågan om filtrerad födelsedata: År=${year}, Kön=${gender}, Kommun=${municipalityCode}`);
    try {
        let query = {};
        if (year) query.year = year;
        if (gender) query.gender = gender;
        if (municipalityCode) query.municipalityCode = municipalityCode;

        const filteredData = await BirthData.find(query);
        console.log(`Returnerar ${filteredData.length} filtrerade datapunkter`);
        res.json(filteredData);
    } catch (error) {
        console.error('Misslyckades med att hämta filtrerad födelsedata:', error);
        res.status(500).json({ meddelande: 'Fel vid hämtning av filtrerad data', fel: error.message });
    }
};

module.exports = exports;
