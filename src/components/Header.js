import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import './Header.css';

const Header = ({ onLock }) => {
    const { state, dispatch } = useApp();

    return (
        <motion.header
            className="header"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
            <div className="header-left">
                <span className="header-icon">💰</span>
                <h1 className="header-title">Money Tracker</h1>
            </div>
            <div className="header-actions">
                <motion.button
                    className="icon-btn"
                    onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.1 }}
                    title="Toggle Dark Mode"
                >
                    {state.darkMode ? '☀️' : '🌙'}
                </motion.button>
                <motion.button
                    className="icon-btn lock-btn"
                    onClick={onLock}
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.1 }}
                    title="Lock App"
                >
                    🔒
                </motion.button>
            </div>
        </motion.header>
    );
};

export default Header;
