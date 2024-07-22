/**
 * @file DataTable.js
 * @description Komponent för att visa födelsedata i en sorterbar och paginerbar tabell.
 * @requires React
 * @requires PropTypes
 */

import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * @function DataTable
 * @description Renderar en tabell med födelsedata och möjlighet till sortering och paginering.
 *
 * @param {Object} props - Komponentens props
 * @param {Array<Object>} props.data - Array med födelsedata-objekt
 * @param {Array<Object>} [props.comparisonData=[]] - Array med jämförelsedata-objekt
 *
 * @returns {JSX.Element} Renderad DataTable-komponent
 */
function DataTable({ data, comparisonData }) {
    /** @type {[Object, function]} Sorteringskonfiguration och uppdateringsfunktion */
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    /** @type {[number, function]} Antal objekt per sida och uppdateringsfunktion */
    const [itemsPerPage, setItemsPerPage] = useState(20);

    /** @type {[number, function]} Aktuell sida och uppdateringsfunktion */
    const [currentPage, setCurrentPage] = useState(1);

    /**
     * @function sortData
     * @description Sorterar given data baserat på aktuell sortConfig
     *
     * @param {Array<Object>} dataToSort - Data att sortera
     * @returns {Array<Object>} Sorterad data
     */
    const sortData = useCallback((dataToSort) => {
        if (sortConfig.key !== null) {
            return [...dataToSort].sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return dataToSort;
    }, [sortConfig]);

    /** @type {Array<Object>} Memoiserad sorterad huvuddata */
    const sortedData = useMemo(() => sortData(data), [data, sortData]);

    /** @type {Array<Object>} Memoiserad sorterad jämförelsedata */
    const sortedComparisonData = useMemo(() => sortData(comparisonData), [comparisonData, sortData]);

    /**
     * @function requestSort
     * @description Begär sortering på en specifik nyckel
     *
     * @param {string} key - Nyckeln att sortera efter
     */
    const requestSort = useCallback((key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    }, [sortConfig]);

    /** @type {number} Totalt antal sidor */
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    /** @type {Array<Object>} Data för aktuell sida */
    const currentData = useMemo(() => {
        const begin = (currentPage - 1) * itemsPerPage;
        const end = begin + itemsPerPage;
        return sortedData.slice(begin, end);
    }, [currentPage, itemsPerPage, sortedData]);

    /**
     * @function renderPaginationButtons
     * @description Renderar pagineringsknappar
     *
     * @returns {JSX.Element} Renderade pagineringsknappar
     */
    const renderPaginationButtons = useCallback(() => {
        const buttons = [];
        let startPage, endPage;
        if (totalPages <= 7) {
            // Om det finns 7 eller färre sidor, visa alla
            startPage = 1;
            endPage = totalPages;
        } else {
            // Alltid visa första och sista sidan
            if (currentPage <= 4) {
                startPage = 1;
                endPage = 5;
            } else if (currentPage + 3 >= totalPages) {
                startPage = totalPages - 4;
                endPage = totalPages;
            } else {
                startPage = currentPage - 2;
                endPage = currentPage + 2;
            }
        }

        if (startPage > 1) {
            buttons.push(<button key={1} onClick={() => setCurrentPage(1)}>1</button>);
            if (startPage > 2) {
                buttons.push(<span key="ellipsis1">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={currentPage === i ? 'active' : ''}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                buttons.push(<span key="ellipsis2">...</span>);
            }
            buttons.push(
                <button key={totalPages} onClick={() => setCurrentPage(totalPages)}>
                    {totalPages}
                </button>
            );
        }

        return buttons;
    }, [currentPage, totalPages, setCurrentPage]);

    return (
        <div className="data-table">
            <div className="table-controls">
                <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="items-per-page-select"
                >
                    <option value={20}>20 per sida</option>
                    <option value={50}>50 per sida</option>
                    <option value={100}>100 per sida</option>
                </select>
            </div>
            <table>
                <thead>
                <tr>
                    <th onClick={() => requestSort('municipalityName')}>Kommun</th>
                    <th onClick={() => requestSort('year')}>År</th>
                    <th onClick={() => requestSort('gender')}>Kön</th>
                    <th onClick={() => requestSort('value')}>Födda</th>
                    {comparisonData.length > 0 && <th>Jämförelse Födsel</th>}
                </tr>
                </thead>
                <tbody>
                {currentData.map((item) => {
                    const comparisonItem = sortedComparisonData.find(
                        c => c.municipalityCode === item.municipalityCode &&
                            c.gender === item.gender &&
                            c.year === item.year
                    );
                    return (
                        <tr key={`${item.municipalityCode}-${item.year}-${item.gender}`}>
                            <td>{item.municipalityName}</td>
                            <td>{item.year}</td>
                            <td>{item.gender === '1' ? 'Män' : 'Kvinnor'}</td>
                            <td>{item.value}</td>
                            {comparisonData.length > 0 &&
                                <td>{comparisonItem ? comparisonItem.value : 'N/A'}</td>
                            }
                        </tr>
                    );
                })}
                </tbody>
            </table>
            <div className="pagination">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                    Första
                </button>
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                    Föregående
                </button>
                {renderPaginationButtons()}
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                    Nästa
                </button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                    Sista
                </button>
            </div>
        </div>
    );
}

DataTable.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        municipalityCode: PropTypes.string.isRequired,
        municipalityName: PropTypes.string.isRequired,
        year: PropTypes.string.isRequired,
        gender: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired
    })).isRequired,
    comparisonData: PropTypes.arrayOf(PropTypes.shape({
        municipalityCode: PropTypes.string.isRequired,
        municipalityName: PropTypes.string.isRequired,
        year: PropTypes.string.isRequired,
        gender: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired
    }))
};

DataTable.defaultProps = {
    comparisonData: []
};

export default DataTable;
