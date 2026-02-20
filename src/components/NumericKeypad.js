import React from 'react';
import { motion } from 'framer-motion';
import './NumericKeypad.css';

const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['⌫', '0', '✓'],
];

const NumericKeypad = ({ onKeyPress, onDelete, onSubmit }) => {
    const handlePress = (key) => {
        if (key === '⌫') onDelete();
        else if (key === '✓') onSubmit();
        else onKeyPress(key);
    };

    return (
        <div className="keypad">
            {keys.map((row, ri) => (
                <div className="keypad-row" key={ri}>
                    {row.map((key) => (
                        <motion.button
                            key={key}
                            className={`keypad-btn ${key === '✓' ? 'keypad-btn-submit' : ''} ${key === '⌫' ? 'keypad-btn-delete' : ''}`}
                            onClick={() => handlePress(key)}
                            whileTap={{ scale: 0.85 }}
                            whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(108,92,231,0.2)' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        >
                            {key}
                        </motion.button>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default NumericKeypad;
