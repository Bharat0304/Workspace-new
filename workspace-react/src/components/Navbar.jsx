import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style.css'; // Global styles

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <nav className="navbar" id="navbar">
                <div className="nav-inner">
                    <Link to="/" className="nav-logo">
                        WORK
                        <svg className="logo-bulb" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M9 21h6M12 3a6 6 0 0 0-4 10.5V17h8v-3.5A6 6 0 0 0 12 3z"/>
                            <line x1="10" y1="17" x2="10" y2="21"/>
                            <line x1="14" y1="17" x2="14" y2="21"/>
                        </svg>
                        SPACE
                    </Link>
                    <div className={`nav-links ${isMenuOpen ? 'active' : ''}`} id="navLinks">
                        <Link to="/" className="nav-link">Features</Link>
                        <Link to="/" className="nav-link">How It Works</Link>
                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                        <Link to="/analytics" className="nav-link">Analytics</Link>
                        <Link to="/" className="nav-link">Pricing</Link>
                    </div>
                    <div className="nav-actions">
                        <Link to="/dashboard" className="btn-ghost" id="loginBtn">Log In</Link>
                        <a href="https://chromewebstore.google.com/detail/workspace-ai-tab-monitor/gkpkmkfcneilbmkekpgnifklkfchbaib" target="_blank" rel="noreferrer" className="btn-amber" id="ctaNav">Get Extension</a>
                    </div>
                    <button className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </nav>
            {/* Mobile overlay */}
            <div className={`mobile-overlay ${isMenuOpen ? 'active' : ''}`} id="mobileOverlay">
                <Link to="/" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Features</Link>
                <Link to="/" className="mobile-link" onClick={() => setIsMenuOpen(false)}>How It Works</Link>
                <Link to="/dashboard" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                <Link to="/analytics" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Analytics</Link>
                <Link to="/" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
                <Link to="/dashboard" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Log In</Link>
                <a href="https://chromewebstore.google.com/detail/workspace-ai-tab-monitor/gkpkmkfcneilbmkekpgnifklkfchbaib" target="_blank" rel="noreferrer" className="btn-amber mobile-cta">Get Extension</a>
            </div>
        </>
    );
};

export default Navbar;
