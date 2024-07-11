import React from 'react';

/**
 * ThemeToggle component
 * @param {Object} props - Component props
 * @param {boolean} props.isDarkMode - Current theme state
 * @param {Function} props.setIsDarkMode - Function to toggle theme
 * @returns {JSX.Element} A button to toggle between light and dark themes
 */
const ThemeToggle = ({ isDarkMode, setIsDarkMode }) => {
    return (
        <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? '☀️' : '🌙'}
        </button>
    );
};

export default ThemeToggle;
