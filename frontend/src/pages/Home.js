import React from 'react';
import { motion } from 'framer-motion';

/**
 * Home component
 * @returns {JSX.Element} The home page content
 */
function Home() {
    return (
        <motion.div
            className="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1>Välkommen till SCB Födselstatistik</h1>
            <p>Här kan du utforska statistik över antalet födda i Sverige mellan 2016-2020.</p>

            <motion.section
                className="home__about"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <h2>Om projektet</h2>
                <p>Detta projekt är utvecklat för att visualisera födselstatistik från SCB.</p>
                <p>Har du frågor eller feedback? Kontakta mig gärna:</p>
                <ul>
                    <li>Namn: Erik Elb</li>
                    <li>E-post: <a href="mailto:erik@goatrik.se">erik@goatrik.se</a></li>
                </ul>
            </motion.section>
        </motion.div>
    );
}

export default Home;
