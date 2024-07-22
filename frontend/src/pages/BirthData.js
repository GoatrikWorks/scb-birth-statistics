/**
 * @file BirthData.js
 * @description Huvudkomponent för att visa och hantera födelsedata med avancerade filtreringsmöjligheter.
 * @requires React
 * @requires axios
 * @requires framer-motion
 * @requires react-select
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import DataTable from '../components/DataTable';
import DataMap from '../components/DataMap';
import DataChart from '../components/DataChart';
import Select from 'react-select';

/**
 * @function BirthData
 * @description Renderar huvudkomponenten för födelsedata med filtreringsmöjligheter och visualiseringar.
 *
 * @param {Object} props - Komponentens props
 * @param {function} props.setIsLoading - Funktion för att sätta laddningstillstånd
 *
 * @returns {JSX.Element} Renderad BirthData-komponent
 */
function BirthData({ setIsLoading }) {
    /** @type {[Array<Object>, function]} Födelsedata och uppdateringsfunktion */
    const [birthData, setBirthData] = useState([]);

    /** @type {[boolean, function]} Laddningstillstånd och uppdateringsfunktion */
    const [loading, setLoading] = useState(true);

    /** @type {[string|null, function]} Felmeddelande och uppdateringsfunktion */
    const [error, setError] = useState(null);

    /** @type {[string, function]} Uppdateringsstatus och uppdateringsfunktion */
    const [updateStatus, setUpdateStatus] = useState('');

    /** @type {[string, function]} Aktuell vy och uppdateringsfunktion */
    const [view, setView] = useState('table');

    /** @type {[number, function]} Valt år för kartvyn */
    const [selectedYear, setSelectedYear] = useState('2020');

    /** @type {[Object, function]} Filterinställningar och uppdateringsfunktion */
    const [filters, setFilters] = useState({
        search: '',
        yearRange: [2016, 2020],
        genders: [],
        municipalities: []
    });

    /** @type {[boolean, function]} Jämförelseläge och uppdateringsfunktion */
    const [comparisonMode, setComparisonMode] = useState(false);

    /** @type {[Object, function]} Jämförelsefilter och uppdateringsfunktion */
    const [comparisonFilters, setComparisonFilters] = useState({
        yearRange: [2016, 2020],
        genders: [],
        municipalities: []
    });

    /**
     * @function fetchBirthData
     * @description Hämtar födelsedata från API:et
     */
    const fetchBirthData = useCallback(async () => {
        setIsLoading(true);
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5001/api/birth-data');
            setBirthData(response.data);
            setError(null);
        } catch (err) {
            setError('Fel vid hämtning av data: ' + err.message);
        } finally {
            setLoading(false);
            setIsLoading(false);
        }
    }, [setIsLoading]);

    useEffect(() => {
        fetchBirthData();
    }, [fetchBirthData]);

    /**
     * @function updateBirthData
     * @description Uppdaterar födelsedata genom att hämta ny data från API:et
     */
    const updateBirthData = async () => {
        setUpdateStatus('Uppdaterar...');
        try {
            await axios.get('http://localhost:5001/api/birth-data/update');
            setUpdateStatus('Data uppdaterad!');
            await fetchBirthData();
        } catch (err) {
            setError('Fel vid uppdatering av data: ' + err.message);
            setUpdateStatus('');
        } finally {
            setIsLoading(false);
        }
    };

    /** @type {Array<string>} Memoiserad lista över unika kommuner */
    const municipalities = useMemo(() => [...new Set(birthData.map(item => item.municipalityName))].sort(), [birthData]);

    /** @type {Array<Object>} Memoiserade kommunalternativ för Select-komponenten */
    const municipalityOptions = useMemo(() =>
            municipalities.map(m => ({ value: m, label: m })),
        [municipalities]
    );

    /** @type {Array<Object>} Könsalternativ för Select-komponenten */
    const genderOptions = [
        { value: '1', label: 'Man' },
        { value: '2', label: 'Kvinna' }
    ];

    /**
     * @function handleYearChange
     * @description Hanterar ändringar i årsintervallet
     * @param {Array<number>} newRange - Nytt årsintervall
     */
    const handleYearChange = (newRange) => {
        setFilters(prevFilters => ({...prevFilters, yearRange: newRange}));
    };

    /**
     * @function handleMapYearChange
     * @description Hanterar ändringar i valt år för kartvyn
     * @param {number} year - Nytt valt år
     */
    const handleMapYearChange = (year) => {
        setSelectedYear(year);
    };

    /** @type {Array<Object>} Memoiserad filtrerad data */
    const filteredData = useMemo(() => {
        return birthData.filter(item =>
            (filters.search === '' ||
                item.municipalityName.toLowerCase().includes(filters.search.toLowerCase()) ||
                item.municipalityCode.includes(filters.search)) &&
            (parseInt(item.year) >= filters.yearRange[0] && parseInt(item.year) <= filters.yearRange[1]) &&
            (filters.genders.length === 0 || filters.genders.some(g => g.value === item.gender)) &&
            (filters.municipalities.length === 0 || filters.municipalities.some(m => m.value === item.municipalityName))
        );
    }, [birthData, filters]);

    /** @type {Array<Object>} Memoiserad jämförelsedata */
    const comparisonData = useMemo(() => {
        if (!comparisonMode) return [];
        return birthData.filter(item =>
            (parseInt(item.year) >= comparisonFilters.yearRange[0] && parseInt(item.year) <= comparisonFilters.yearRange[1]) &&
            (comparisonFilters.genders.length === 0 || comparisonFilters.genders.some(g => g.value === item.gender)) &&
            (comparisonFilters.municipalities.length === 0 || comparisonFilters.municipalities.some(m => m.value === item.municipalityName))
        );
    }, [birthData, comparisonMode, comparisonFilters]);

    const MapFilters = () => (
        <div className="map-filters">
            <select
                value={selectedYear}
                onChange={(e) => handleMapYearChange(e.target.value)}
            >
                {[2016, 2017, 2018, 2019, 2020].map(year => (
                    <option key={year} value={year.toString()}>{year}</option>
                ))}
            </select>
            <Select
                options={genderOptions}
                value={filters.genders[0] || null}
                onChange={(selectedOption) => setFilters(prevFilters => ({
                    ...prevFilters,
                    genders: selectedOption ? [selectedOption] : []
                }))}
                placeholder="Välj kön..."
                isClearable
            />
        </div>
    );

    if (loading) return <div className="loading">Laddar...</div>;

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

            <div className="birth-data__controls">
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
                    {['table', 'map', 'chart'].map((viewType) => (
                        <button
                            key={viewType}
                            onClick={() => setView(viewType)}
                            className={view === viewType ? 'active' : ''}
                        >
                            {viewType === 'table' && 'Tabell'}
                            {viewType === 'map' && 'Karta'}
                            {viewType === 'chart' && 'Diagram'}
                        </button>
                    ))}
                </div>

                {view === 'table' && (
                    <div className="filter-controls">
                        <input
                            type="text"
                            placeholder="Sök här..."
                            value={filters.search}
                            onChange={(e) => setFilters(prevFilters => ({...prevFilters, search: e.target.value}))}
                        />

                        <div className="year-select">
                            <label>År: </label>
                            <select
                                value={filters.yearRange[0]}
                                onChange={(e) => handleYearChange([parseInt(e.target.value), filters.yearRange[1]])}
                            >
                                {[2016, 2017, 2018, 2019, 2020].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <span> - </span>
                            <select
                                value={filters.yearRange[1]}
                                onChange={(e) => handleYearChange([filters.yearRange[0], parseInt(e.target.value)])}
                            >
                                {[2016, 2017, 2018, 2019, 2020].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <Select
                            isMulti
                            options={genderOptions}
                            value={filters.genders}
                            onChange={(selectedOptions) => setFilters(prevFilters => ({...prevFilters, genders: selectedOptions}))}
                            placeholder="Välj kön..."
                        />

                        <Select
                            isMulti
                            options={municipalityOptions}
                            value={filters.municipalities}
                            onChange={(selectedOptions) => setFilters(prevFilters => ({...prevFilters, municipalities: selectedOptions}))}
                            placeholder="Välj kommuner..."
                        />
                    </div>
                )}

                {view === 'map' && <MapFilters />}

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
                        <div className="filter-group">
                            <label>Jämförelseår: </label>
                            <select
                                value={comparisonFilters.yearRange[0]}
                                onChange={(e) => setComparisonFilters({
                                    ...comparisonFilters,
                                    yearRange: [parseInt(e.target.value), comparisonFilters.yearRange[1]]
                                })}
                            >
                                {[2016, 2017, 2018, 2019, 2020].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <span> - </span>
                            <select
                                value={comparisonFilters.yearRange[1]}
                                onChange={(e) => setComparisonFilters({
                                    ...comparisonFilters,
                                    yearRange: [comparisonFilters.yearRange[0], parseInt(e.target.value)]
                                })}
                            >
                                {[2016, 2017, 2018, 2019, 2020].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <Select
                            isMulti
                            options={genderOptions}
                            value={comparisonFilters.genders}
                            onChange={(selectedOptions) => setComparisonFilters({
                                ...comparisonFilters,
                                genders: selectedOptions
                            })}
                            placeholder="Välj kön för jämförelse..."
                        />
                        <Select
                            isMulti
                            options={municipalityOptions}
                            value={comparisonFilters.municipalities}
                            onChange={(selectedOptions) => setComparisonFilters({
                                ...comparisonFilters,
                                municipalities: selectedOptions
                            })}
                            placeholder="Välj kommuner för jämförelse..."
                        />
                    </div>
                )}
            </div>

            {view === 'table' && <DataTable data={filteredData} comparisonData={comparisonData}/>}
            {view === 'map' && (
                <DataMap
                    data={birthData}
                    year={selectedYear}
                    gender={filters.genders[0]}
                />
            )}
            {view === 'chart' && <DataChart data={filteredData} comparisonData={comparisonData}/>}
        </motion.div>
    );
}

export default BirthData;
