// src/components/DataTable.js

import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * DataTable Component
 * Displays birth data in a sortable and paginated table, with optional comparison data.
 *
 * @param {Object} props
 * @param {Array} props.data - The main dataset to display
 * @param {Array} props.comparisonData - Optional comparison dataset
 */
function DataTable({ data, comparisonData }) {
    // State for pagination, sorting, and items per page
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [itemsPerPage, setItemsPerPage] = useState(10);

    /**
     * Sorts the data based on the current sort configuration
     * @param {Array} dataToSort - The data array to sort
     * @returns {Array} Sorted data array
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

    // Memoized sorted data
    const sortedData = useMemo(() => sortData(data), [data, sortData]);
    const sortedComparisonData = useMemo(() => sortData(comparisonData), [comparisonData, sortData]);

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

    /**
     * Changes the current page
     * @param {number} pageNumber - The page number to navigate to
     */
    const paginate = useCallback((pageNumber) => {
        setCurrentPage(pageNumber);
    }, []);

    /**
     * Requests a sort on a specific key
     * @param {string} key - The key to sort by
     */
    const requestSort = useCallback((key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    }, [sortConfig]);

    /**
     * Renders pagination buttons
     * @returns {JSX.Element} Rendered pagination buttons
     */
    const renderPagination = useCallback(() => {
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(sortedData.length / itemsPerPage); i++) {
            pageNumbers.push(i);
        }

        let pagesToShow = [];
        const totalPages = pageNumbers.length;
        if (totalPages <= 7) {
            pagesToShow = pageNumbers;
        } else {
            if (currentPage <= 4) {
                pagesToShow = [...pageNumbers.slice(0, 5), '...', totalPages];
            } else if (currentPage >= totalPages - 3) {
                pagesToShow = [1, '...', ...pageNumbers.slice(totalPages - 5)];
            } else {
                pagesToShow = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
            }
        }

        return (
            <div className="pagination">
                <button onClick={() => paginate(1)} disabled={currentPage === 1}>First</button>
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                {pagesToShow.map((number, index) => (
                    number === '...' ?
                        <span key={index}>...</span> :
                        <button
                            key={index}
                            onClick={() => paginate(number)}
                            className={currentPage === number ? 'active' : ''}
                        >
                            {number}
                        </button>
                ))}
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                <button onClick={() => paginate(totalPages)} disabled={currentPage === totalPages}>Last</button>
            </div>
        );
    }, [currentPage, itemsPerPage, paginate, sortedData.length]);

    return (
        <div className="data-table">
            <div className="table-controls">
                <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="items-per-page-select"
                >
                    <option value={10}>10 per page</option>
                    <option value={15}>15 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                </select>
            </div>
            <table>
                <thead>
                <tr>
                    <th onClick={() => requestSort('municipalityCode')}>Municipality Code</th>
                    <th onClick={() => requestSort('municipalityName')}>Municipality Name</th>
                    <th onClick={() => requestSort('year')}>Year</th>
                    <th onClick={() => requestSort('gender')}>Gender</th>
                    <th onClick={() => requestSort('value')}>Births</th>
                    {comparisonData.length > 0 && <th>Comparison Births</th>}
                </tr>
                </thead>
                <tbody>
                {currentItems.map((item, index) => {
                    const comparisonItem = sortedComparisonData.find(
                        c => c.municipalityCode === item.municipalityCode &&
                            c.gender === item.gender &&
                            c.year === item.year
                    );
                    return (
                        <tr key={`${item.municipalityCode}-${item.year}-${item.gender}`}>
                            <td>{item.municipalityCode}</td>
                            <td>{item.municipalityName}</td>
                            <td>{item.year}</td>
                            <td>{item.gender === '1' ? 'Men' : 'Women'}</td>
                            <td>{item.value}</td>
                            {comparisonData.length > 0 &&
                                <td>{comparisonItem ? comparisonItem.value : 'N/A'}</td>
                            }
                        </tr>
                    );
                })}
                </tbody>
            </table>
            {renderPagination()}
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
