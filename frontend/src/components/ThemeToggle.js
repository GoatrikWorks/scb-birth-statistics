import React from 'react';

const ThemeToggle = ({ isDarkMode, setIsDarkMode }) => {
    return (
        <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? '☀️' : '🌙'}
        </button>
    );
};

export default ThemeToggle;
