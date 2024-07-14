const axios = require('axios');
const config = require('../config/config');
const BirthData = require('../models/BirthData');
const NodeCache = require('node-cache');
const municipalityMapping = require('../data/municipalityMapping');

// Constants for the API endpoint and cache settings
const SCB_API_URL = config.SCB_API_URL;
const dataCache = new NodeCache({ stdTTL: config.CACHE_TTL });

/**
 * Creates the query object for SCB API
 * @returns {Object} Query object for SCB API
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
 * Fetches data from SCB API
 * @returns {Promise<Object>} The data from SCB API
 */
const fetchDataFromSCB = async () => {
    const query = createSCBQuery();
    console.log('Sending request to SCB API:', JSON.stringify(query));
    try {
        const response = await axios.post(SCB_API_URL, query, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        console.log('Received response from SCB API:', JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        console.error('Error fetching data from SCB:', error.response ? error.response.data : error.message);
        throw error;
    }
};

/**
 * Updates the database with fetched data
 * @param {Object} scbData - The data fetched from SCB API
 * @returns {Promise<number>} The number of updated records
 */
const updateDatabase = async (scbData) => {
    console.log('Updating database with fetched data...');
    let updatedCount = 0;
    for (const { key, values } of scbData.data) {
        const [municipalityCode, gender, year] = key;
        const value = values[0];

        if (!value) {
            console.warn(`Skipping undefined value for ${municipalityCode}, ${gender}, ${year}`);
            continue;
        }

        const numericValue = Number(value);
        if (isNaN(numericValue)) {
            console.warn(`Skipping non-numeric value for ${municipalityCode}, ${year}: ${value}`);
            continue;
        }

        const municipalityName = municipalityMapping[municipalityCode] || 'Unknown';

        try {
            await BirthData.findOneAndUpdate(
                { municipalityCode, gender, year },
                {
                    $set: {
                        value: numericValue,
                        municipalityName
                    }
                },
                { upsert: true, new: true }
            );
            updatedCount++;
            console.log(`Successfully updated data for ${municipalityCode}, ${gender}, ${year}`);
        } catch (error) {
            console.error(`Error updating data for ${municipalityCode}, ${year}:`, error);
        }
    }
    console.log(`Total records updated: ${updatedCount}`);
    return updatedCount;
};

/**
 * Updates birth data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateBirthData = async (req, res) => {
    console.log('Received request to update birth data');
    try {
        const scbData = await fetchDataFromSCB();
        const updatedCount = await updateDatabase(scbData);
        console.log(`Birth data successfully updated. Processed ${updatedCount} data points.`);

        // Clear the cache after updating
        dataCache.del('allBirthData');

        res.json({ message: `Birth data successfully updated. Processed ${updatedCount} data points.` });
    } catch (error) {
        console.error('Error updating birth data:', error);
        res.status(500).json({ message: 'Error updating birth data', error: error.message });
    }
};

/**
 * Retrieves all birth data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllBirthData = async (req, res) => {
    console.log('Received request to fetch all birth data');
    try {
        let birthData = dataCache.get('allBirthData');
        if (!birthData) {
            console.log('Cache miss. Fetching data from database...');
            birthData = await BirthData.find({});
            dataCache.set('allBirthData', birthData);
            console.log('Data fetched from database and cached.');
        } else {
            console.log('Data retrieved from cache.');
        }
        console.log(`Returning ${birthData.length} data points.`);
        res.json(birthData);
    } catch (error) {
        console.error('Failed to fetch birth data:', error);
        res.status(500).json({ message: 'Error fetching birth data', error: error.message });
    }
};

/**
 * Retrieves birth data for a specific municipality
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getMunicipalityData = async (req, res) => {
    const { municipalityCode } = req.params;
    console.log(`Received request to fetch birth data for municipality: ${municipalityCode}`);
    try {
        const municipalityData = await BirthData.find({ municipalityCode });
        console.log(`Returning ${municipalityData.length} data points for municipality ${municipalityCode}`);
        res.json(municipalityData);
    } catch (error) {
        console.error(`Failed to fetch birth data for municipality ${municipalityCode}:`, error);
        res.status(500).json({ message: 'Error fetching municipality data', error: error.message });
    }
};

/**
 * Retrieves aggregated birth data for all municipalities
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAggregatedData = async (req, res) => {
    console.log('Received request to fetch aggregated birth data');
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
        console.log(`Returning aggregated data for ${aggregatedData.length} municipality-year combinations`);
        res.json(aggregatedData);
    } catch (error) {
        console.error('Failed to fetch aggregated birth data:', error);
        res.status(500).json({ message: 'Error fetching aggregated data', error: error.message });
    }
};
