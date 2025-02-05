import React from 'react';

/**
 * Footer component
 * @returns {JSX.Element} The footer of the application
 */
function Footer() {
    return (
        <footer className="footer">
            <div className="footer__content">
                <p>&copy; 2024 SCB Födselstatistik. Utvecklad av Erik Elb.</p>
                <p>Kontakt: <a href="mailto:erik@goatrik.se">erik@goatrik.se</a></p>
            </div>
        </footer>
    );
}

export default Footer;
