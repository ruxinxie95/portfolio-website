// components/Footer.js
import React, { useEffect, useState } from 'react';

const Footer = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show or hide the button based on the scroll position
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    // Function to scroll to the top smoothly
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <footer id="colophon" className="site-footer" role="contentinfo">
            <div className="container">
                <div className="site-info">
                    <a href="https://www.google.com/maps?q=40.343611,-74.649806" 
                       target="_blank" 
                       className="coordinates-link">
                        40°20'37.0"N - 74°38'59.3"W
                    </a>

                    {/* Back to Top Button */}
                    {isVisible && (
                        <button 
                            className="back-to-top" 
                            onClick={scrollToTop}
                            aria-label="Back to Top">
                            ↑ Back to Top
                        </button>
                    )}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
