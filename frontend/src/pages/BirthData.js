import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function BirthData({ setIsLoading }) {
    const [birthData, setBirthData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateStatus, setUpdateStatus] = useState('');
    const [view, setView] = useState('chart');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBirthData();
    }, []);

    const fetchBirthData = async () => {
        try {
            setIsLoading(true);
            setLoading(true);
            setError(null);
            const response = await axios.get('http://localhost:5000/api/birth-data');
            setBirthData(response.data);
        } catch (err) {
            setError('Fel vid hämtning av data: ' + err.message);
        } finally {
            setLoading(false);
            setIsLoading(false);
        }
    };

    const updateBirthData = async () => {
        try {
            setIsLoading(true);
            setUpdateStatus('Uppdaterar...');
            setError(null);
            await axios.get('http://localhost:5000/api/birth-data/update');
            setUpdateStatus('Data uppdaterad!');
            await fetchBirthData();
        } catch (err) {
            setError('Fel vid uppdatering av data: ' + err.message);
            setUpdateStatus('');
        } finally {
            setIsLoading(false);
        }
    };

    const processDataForChart = () => {
        const yearData = {};
        birthData.forEach(item => {
            if (!yearData[item.year]) {
                yearData[item.year] = { year: item.year, men: 0, women: 0 };
            }
            if (item.gender === '1') {
                yearData[item.year].men += item.value;
            } else {
                yearData[item.year].women += item.value;
            }
        });
        return Object.values(yearData);
    };

    const processDataForMap = () => {
        return birthData.reduce((acc, item) => {
            const existingItem = acc.find(i => i.municipalityCode === item.municipalityCode);
            if (existingItem) {
                existingItem.value += item.value;
            } else {
                acc.push({
                    ...item,
                    lat: item.lat || 62.0, // Default to center of Sweden if no coords
                    lng: item.lng || 15.0,
                });
            }
            return acc;
        }, []);
    };

    const filteredData = useMemo(() => {
        return birthData.filter(item =>
            item.municipalityName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [birthData, searchTerm]);

    if (loading) return <div className="loading">Laddar data...</div>;

    return (
        <motion.div
            className="birth-data"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1>Födselstatistik</h1>
            <AnimatePresence>
                {error && (
                    <motion.div
                        className="error-message"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.button
                className="birth-data__update-btn"
                onClick={updateBirthData}
                disabled={loading || updateStatus === 'Uppdaterar...'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {updateStatus || 'Uppdatera data'}
            </motion.button>
            <div className="view-toggle">
                <button onClick={() => setView('chart')} className={view === 'chart' ? 'active' : ''}>Diagram</button>
                <button onClick={() => setView('map')} className={view === 'map' ? 'active' : ''}>Karta</button>
            </div>
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Sök efter kommun..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            {filteredData.length === 0 ? (
                <p>Ingen data tillgänglig. Klicka på "Uppdatera data" för att hämta data eller ändra din sökning.</p>
            ) : (
                <>
                    {view === 'chart' && (
                        <motion.div
                            className="birth-data__chart"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2>Födelsetrend</h2>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={processDataForChart()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="men" stroke="#8884d8" name="Män" />
                                    <Line type="monotone" dataKey="women" stroke="#82ca9d" name="Kvinnor" />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}
                    {view === 'map' && (
                        <motion.div
                            className="birth-data__map"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2>Födelsetal per kommun</h2>
                            <MapContainer center={[62.0, 15.0]} zoom={4} style={{ height: '400px', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                {processDataForMap().filter(item =>
                                    item.municipalityName.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map(item => (
                                    <CircleMarker
                                        key={item.municipalityCode}
                                        center={[item.lat, item.lng]}
                                        radius={Math.sqrt(item.value) / 10}
                                        fillColor="#FF204E"
                                        color="#000"
                                        weight={1}
                                        opacity={1}
                                        fillOpacity={0.8}
                                    >
                                        <Popup>
                                            {item.municipalityName}: {item.value} födda
                                        </Popup>
                                    </CircleMarker>
                                ))}
                            </MapContainer>
                        </motion.div>
                    )}
                    <motion.table
                        className="birth-data__table"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <thead>
                        <tr>
                            <th>Kommun</th>
                            <th>Kön</th>
                            <th>År</th>
                            <th>Antal födda</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredData.map((data, index) => (
                            <motion.tr
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                            >
                                <td>{data.municipalityName}</td>
                                <td>{data.gender === '1' ? 'Män' : 'Kvinnor'}</td>
                                <td>{data.year}</td>
                                <td>{data.value}</td>
                            </motion.tr>
                        ))}
                        </tbody>
                    </motion.table>
                </>
            )}
        </motion.div>
    );
}

export default BirthData;
