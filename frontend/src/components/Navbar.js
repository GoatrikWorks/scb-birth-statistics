import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Navbar() {
    return (
        <nav className="navbar">
            <motion.ul
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <li><Link to="/">Hem</Link></li>
                <li><Link to="/birth-data">Födselstatistik</Link></li>
            </motion.ul>
        </nav>
    );
}

export default Navbar;
