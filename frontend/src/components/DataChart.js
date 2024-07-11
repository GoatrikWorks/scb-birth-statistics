import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import PropTypes from 'prop-types';

/**
 * DataChart Component
 * Displays birth data as a line chart, showing trends for men and women over time.
 *
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of birth data objects
 */
function DataChart({ data }) {
    /**
     * Processes the raw data into a format suitable for the chart
     * Groups data by year and calculates total births for men and women
     */
    const chartData = useMemo(() => {
        const yearlyData = data.reduce((acc, item) => {
            const year = item.year;
            if (!acc[year]) {
                acc[year] = { year, men: 0, women: 0 };
            }
            if (item.gender === '1') {
                acc[year].men += item.value;
            } else if (item.gender === '2') {
                acc[year].women += item.value;
            }
            return acc;
        }, {});

        // Convert to array and sort by year
        return Object.values(yearlyData).sort((a, b) => a.year.localeCompare(b.year));
    }, [data]);

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="year"
                    label={{ value: 'Year', position: 'insideBottomRight', offset: -10 }}
                />
                <YAxis
                    label={{ value: 'Number of Births', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="men"
                    stroke="#8884d8"
                    name="Men"
                    activeDot={{ r: 8 }}
                />
                <Line
                    type="monotone"
                    dataKey="women"
                    stroke="#82ca9d"
                    name="Women"
                    activeDot={{ r: 8 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

// PropTypes for type checking
DataChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        municipalityCode: PropTypes.string.isRequired,
        municipalityName: PropTypes.string.isRequired,
        year: PropTypes.string.isRequired,
        gender: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired
    })).isRequired
};

export default DataChart;
