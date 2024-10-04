import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const [message, setMessage] = useState("");

    useEffect(() => {
        // Apply dark mode if previously enabled
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            setDarkMode(true);
        }

        // Initialize clickCount from sessionStorage
        const storedClickCount = sessionStorage.getItem('clickCount');
        if (storedClickCount) {
            setClickCount(parseInt(storedClickCount, 10));
        }
    }, []);

    useEffect(() => {
        // Update message and button based on click count
        if (clickCount === 0) {
            setMessage(""); // No message on initial load
        } else if (clickCount <= 2) {
            setMessage("No, you can't.");
        } else if (clickCount < 5) {
            setMessage("Really?");
        } else if (clickCount === 5) {
            setMessage(`
                ruxinx.design@gmail.com | 734-882-8500 | 
                <a href="your-cv-link" target="_blank" aria-label="View CV">CV</a> | 
                <a href="https://www.linkedin.com/in/ruxin-xie/" target="_blank" aria-label="Visit LinkedIn Profile">LinkedIn</a>
            `);
        }
        sessionStorage.setItem('clickCount', clickCount); // Persist the click count
    }, [clickCount]);

    const toggleDarkMode = () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            setDarkMode(true);
        } else {
            localStorage.setItem('darkMode', 'disabled');
            setDarkMode(false);
        }
    };

    const handleStopMeClick = (event) => {
        event.preventDefault();
        if (clickCount < 5) {
            setClickCount(clickCount + 1); // Increment the click count
        }
    };

    const resetStopMe = (event) => {
        event.preventDefault();
        sessionStorage.removeItem('clickCount');
        setClickCount(0); // Reset the click count
    };

    return (
        <div className="container">
            <header id="masthead" className="site-header" role="banner">
                <h1 className="site-title">
                    <Link href="/" rel="home" className="bling-text" onClick={resetStopMe}>
                        Ruxin <span className="rotating-x">X</span>ie
                    </Link>
                </h1>

                <div className="stop-me-section">
                    {clickCount < 5 && ( // Conditionally render the button if clickCount is less than 5
                        <a href="#" id="stop-button" onClick={handleStopMeClick}>
                            {clickCount >= 2 ? "Stop me again" : "Stop me"}
                        </a>
                    )}
                    <p id="message" dangerouslySetInnerHTML={{ __html: message }}></p>
                </div>

                {/* Dark Mode Toggle */}
                <div className="dark-mode-toggle" onClick={toggleDarkMode}>
                    <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
                </div>
            </header>
        </div>
    );
};

export default Header;
