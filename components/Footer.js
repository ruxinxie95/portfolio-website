// components/Footer.js
import React from 'react';

const Footer = () => {
    return (
        <footer id="colophon" className="site-footer" role="contentinfo">
            <div className="container">
                <div className="site-info">
                    <a href="https://www.google.com/maps?q=40.343611,-74.649806" 
                       target="_blank" 
                       className="coordinates-link">
                        40°20'37.0"N - 74°38'59.3"W
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
