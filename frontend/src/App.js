import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BirthData from './pages/BirthData';
import ProgressBar from './components/ProgressBar';
import ThemeToggle from './components/ThemeToggle';
import './styles/main.scss';

/**
 * Main App component
 * @returns {JSX.Element} The main application structure
 */
function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDarkMode(true);
        }
    }, []);

    useEffect(() => {
        document.body.classList.toggle('dark-mode', isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    return (
        <Router>
            <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
                <ProgressBar isAnimating={isLoading} />
                <Navbar />
                <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
                <AnimatePresence mode="wait">
                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/birth-data" element={<BirthData setIsLoading={setIsLoading} />} />
                        </Routes>
                    </main>
                </AnimatePresence>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
