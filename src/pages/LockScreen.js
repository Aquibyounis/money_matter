import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NumericKeypad from '../components/NumericKeypad';
import './LockScreen.css';

const CORRECT_PIN = process.env.REACT_APP_PIN || '1234';

const LockScreen = ({ onUnlock }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleKeyPress = useCallback((key) => {
        setError('');
        if (pin.length < 4) setPin((p) => p + key);
    }, [pin]);

    const handleDelete = useCallback(() => {
        setPin((p) => p.slice(0, -1));
    }, []);

    const handleSubmit = useCallback(() => {
        if (pin.length !== 4) {
            setError('Enter your 4-digit PIN');
            triggerShake();
            return;
        }
        if (pin === CORRECT_PIN) {
            onUnlock();
        } else {
            setError('Incorrect PIN');
            setPin('');
            triggerShake();
        }
    }, [pin, onUnlock]);

    return (
        <motion.div
            className="lock-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ duration: 0.4 }}
        >
            <div className="lock-content">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                    className="lock-icon-container"
                >
                    <span className="lock-emoji">🔐</span>
                </motion.div>

                <motion.h2
                    className="lock-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Enter Your PIN
                </motion.h2>
                <motion.p
                    className="lock-subtitle"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Welcome back! Enter your PIN to continue
                </motion.p>

                {/* PIN Dots */}
                <motion.div
                    className={`pin-dots ${shake ? 'pin-shake' : ''}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 }}
                >
                    {[0, 1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            className={`pin-dot ${i < pin.length ? 'pin-dot-filled' : ''}`}
                            animate={i < pin.length ? { scale: [1, 1.3, 1] } : {}}
                            transition={{ duration: 0.2 }}
                        />
                    ))}
                </motion.div>

                <AnimatePresence>
                    {error && (
                        <motion.p
                            className="lock-error"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <NumericKeypad
                        onKeyPress={handleKeyPress}
                        onDelete={handleDelete}
                        onSubmit={handleSubmit}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default LockScreen;
