import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import LockScreen from './pages/LockScreen';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Categories from './pages/Categories';
import Header from './components/Header';
import './App.css';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000;
const LAST_ACTIVITY_KEY = 'money_tracker_last_activity';

const getStoredActivity = () => {
    const stored = localStorage.getItem(LAST_ACTIVITY_KEY);
    return stored ? parseInt(stored, 10) : 0;
};

const saveActivity = (time) => {
    localStorage.setItem(LAST_ACTIVITY_KEY, time.toString());
};

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
];

const AppContent = () => {
    const [isLocked, setIsLocked] = useState(() => {
        const last = getStoredActivity();
        if (last === 0) return true;
        return Date.now() - last > INACTIVITY_TIMEOUT;
    });
    const [activeTab, setActiveTab] = useState('dashboard');
    const [lastActivity, setLastActivity] = useState(Date.now());

    const handleUnlock = useCallback(() => {
        const now = Date.now();
        setIsLocked(false);
        setLastActivity(now);
        saveActivity(now);
    }, []);

    const handleLock = useCallback(() => {
        setIsLocked(true);
    }, []);

    useEffect(() => {
        if (isLocked) return;
        const updateActivity = () => {
            const now = Date.now();
            setLastActivity(now);
            saveActivity(now);
        };
        const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
        events.forEach((e) => window.addEventListener(e, updateActivity));
        return () => events.forEach((e) => window.removeEventListener(e, updateActivity));
    }, [isLocked]);

    useEffect(() => {
        if (isLocked) return;
        const interval = setInterval(() => {
            if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
                setIsLocked(true);
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [isLocked, lastActivity]);

    const renderPage = () => {
        switch (activeTab) {
            case 'analytics':
                return (
                    <motion.div
                        key="analytics"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                    >
                        <Analytics />
                    </motion.div>
                );
            case 'categories':
                return (
                    <motion.div
                        key="categories"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                    >
                        <Categories />
                    </motion.div>
                );
            default:
                return (
                    <motion.div
                        key="dash"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                    >
                        <Dashboard />
                    </motion.div>
                );
        }
    };

    return (
        <div className="app-shell">
            <AnimatePresence mode="wait">
                {isLocked ? (
                    <LockScreen key="lock" onUnlock={handleUnlock} />
                ) : (
                    <motion.div
                        key="main"
                        className="app-layout"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Side Navbar — desktop only */}
                        <nav className="side-nav">
                            <div className="side-nav-brand">
                                <span className="side-nav-icon">💰</span>
                                <span className="side-nav-title">Money Tracker</span>
                            </div>
                            <div className="side-nav-links">
                                {NAV_ITEMS.map((item) => (
                                    <motion.button
                                        key={item.id}
                                        className={`side-nav-btn ${activeTab === item.id ? 'side-nav-active' : ''}`}
                                        onClick={() => setActiveTab(item.id)}
                                        whileTap={{ scale: 0.96 }}
                                    >
                                        <span className="side-nav-btn-icon">{item.icon}</span>
                                        <span className="side-nav-btn-label">{item.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                            <div className="side-nav-footer">
                                <motion.button
                                    className="side-nav-btn side-nav-lock"
                                    onClick={handleLock}
                                    whileTap={{ scale: 0.96 }}
                                >
                                    <span className="side-nav-btn-icon">🔒</span>
                                    <span className="side-nav-btn-label">Lock</span>
                                </motion.button>
                            </div>
                        </nav>

                        {/* Main Content */}
                        <div className="app-main">
                            <Header onLock={handleLock} />
                            <div className="page-content">
                                <AnimatePresence mode="wait">
                                    {renderPage()}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Bottom Nav — mobile only */}
                        <nav className="bottom-nav">
                            {NAV_ITEMS.map((item) => (
                                <motion.button
                                    key={item.id}
                                    className={`bottom-nav-btn ${activeTab === item.id ? 'bottom-nav-active' : ''}`}
                                    onClick={() => setActiveTab(item.id)}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <span className="bottom-nav-icon">{item.icon}</span>
                                    <span className="bottom-nav-label">{item.label}</span>
                                </motion.button>
                            ))}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

function App() {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}

export default App;
