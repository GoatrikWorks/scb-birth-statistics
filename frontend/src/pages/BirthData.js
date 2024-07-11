// src/pages/BirthData.js

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import DataTable from '../components/DataTable';
import DataMap from '../components/DataMap';
import DataChart from '../components/DataChart';

/**
 * BirthData Component
 * Displays birth statistics with options for filtering, comparison, and different views.
 *
 * @param {Object} props
 * @param {Function} props.setIsLoading - Function to set loading state in parent component
 */
function BirthData({ setIsLoading }) {
    // State declarations
    const [birthData, setBirthData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateStatus, setUpdateStatus] = useState('');
    const [view, setView] = useState('table');
    const [filters, setFilters] = useState({
        search: '',
        year: '',
        gender: '',
        municipality: ''
    });
    const [comparisonMode, setComparisonMode] = useState(false);
    const [comparisonFilters, setComparisonFilters] = useState({
        year: '',
        gender: '',
        municipality: ''
    });

    /**
     * Fetches birth data from the API
     */
    const fetchBirthData = useCallback(async () => {
        setIsLoading(true);
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5001/api/birth-data');
            setBirthData(response.data);
            setError(null);
        } catch (err) {
            setError('Error fetching data: ' + err.message);
        } finally {
            setLoading(false);
            setIsLoading(false);
        }
    }, [setIsLoading]);

    // Fetch data on component mount
    useEffect(() => {
        fetchBirthData();
    }, [fetchBirthData]);

    /**
     * Updates birth data from the API
     */
    const updateBirthData = async () => {
        setUpdateStatus('Updating...');
        try {
            await axios.get('http://localhost:5001/api/birth-data/update');
            setUpdateStatus('Data updated!');
            await fetchBirthData();
        } catch (err) {
            setError('Error updating data: ' + err.message);
            setUpdateStatus('');
        } finally {
            setIsLoading(false);
        }
    };

    // Memoized values for dropdown options
    const years = useMemo(() => [...new Set(birthData.map(item => item.year))].sort(), [birthData]);
    const municipalities = useMemo(() => [...new Set(birthData.map(item => item.municipalityName))].sort(), [birthData]);

    // Filtered data based on current filters
    const filteredData = useMemo(() => {
        return birthData.filter(item =>
            (filters.search === '' ||
                item.municipalityName.toLowerCase().includes(filters.search.toLowerCase()) ||
                item.municipalityCode.includes(filters.search)) &&
            (filters.year === '' || item.year === filters.year) &&
            (filters.gender === '' || item.gender === filters.gender) &&
            (filters.municipality === '' || item.municipalityName === filters.municipality)
        );
    }, [birthData, filters]);

    // Comparison data based on comparison filters
    const comparisonData = useMemo(() => {
        if (!comparisonMode) return [];
        return birthData.filter(item =>
            (comparisonFilters.year === '' || item.year === comparisonFilters.year) &&
            (comparisonFilters.gender === '' || item.gender === comparisonFilters.gender) &&
            (comparisonFilters.municipality === '' || item.municipalityName === comparisonFilters.municipality)
        );
    }, [birthData, comparisonMode, comparisonFilters]);

    if (loading) return <div>Laddar...</div>;

    return (
        <motion.div
            className="birth-data"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.5}}
        >
            <h1>Födelsestatistik</h1>
            {error && (
                <motion.div
                    className="error-message"
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -20}}
                >
                    {error}
                </motion.div>
            )}
            <motion.button
                className="birth-data__update-btn"
                onClick={updateBirthData}
                disabled={loading || updateStatus === 'Uppdaterar...'}
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
            >
                {updateStatus || 'Uppdatera data'}
            </motion.button>
            <div className="view-toggle">
                <button onClick={() => setView('table')} className={view === 'tabell' ? 'active' : ''}>Tabell</button>
                <button onClick={() => setView('map')} className={view === 'map' ? 'active' : ''}>Karta</button>
                <button onClick={() => setView('chart')} className={view === 'chart' ? 'active' : ''}>Diagram</button>
            </div>
            <div className="filters">
                <div className="filter-group">
                    <input
                        type="text"
                        placeholder="Sök här..."
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                    />
                </div>
                <div className="filter-group">
                    <select
                        value={filters.year}
                        onChange={(e) => setFilters({...filters, year: e.target.value})}
                    >
                        <option value="">Alla år</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <select
                        value={filters.gender}
                        onChange={(e) => setFilters({...filters, gender: e.target.value})}
                    >
                        <option value="">Alla kön</option>
                        <option value="1">Män</option>
                        <option value="2">Kvinnor</option>
                    </select>
                </div>
                <div className="filter-group">
                <select
                        value={filters.municipality}
                        onChange={(e) => setFilters({...filters, municipality: e.target.value})}
                    >
                        <option value="">Alla kommuner</option>
                        {municipalities.map(municipality => (
                            <option key={municipality} value={municipality}>{municipality}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="comparison-toggle">
                <label>
                    <input
                        type="checkbox"
                        checked={comparisonMode}
                        onChange={(e) => setComparisonMode(e.target.checked)}
                    />
                    Aktivera jämförelseläge
                </label>
            </div>
            {comparisonMode && (
                <div className="comparison-filters">
                    <select
                        value={comparisonFilters.year}
                        onChange={(e) => setComparisonFilters({...comparisonFilters, year: e.target.value})}
                    >
                        <option value="">Alla år</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <select
                        value={comparisonFilters.gender}
                        onChange={(e) => setComparisonFilters({...comparisonFilters, gender: e.target.value})}
                    >
                        <option value="">Alla kön</option>
                        <option value="1">Män</option>
                        <option value="2">Kvinnor</option>
                    </select>
                    <select
                        value={comparisonFilters.municipality}
                        onChange={(e) => setComparisonFilters({...comparisonFilters, municipality: e.target.value})}
                    >
                        <option value="">Alla kommuner</option>
                        {municipalities.map(municipality => (
                            <option key={municipality} value={municipality}>{municipality}</option>
                        ))}
                    </select>
                </div>
            )}
            {view === 'table' && <DataTable data={filteredData} comparisonData={comparisonData}/>}
            {view === 'map' && <DataMap data={filteredData} comparisonData={comparisonData}/>}
            {view === 'chart' && <DataChart data={filteredData} comparisonData={comparisonData}/>}
        </motion.div>
    );
}

export default BirthData;
