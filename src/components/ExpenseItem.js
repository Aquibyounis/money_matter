import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate, CATEGORY_ICONS } from '../utils/helpers';
import './ExpenseItem.css';

const LONG_PRESS_DURATION = 600; // ms

const ExpenseItem = ({ expense, onLongPress }) => {
    const icon = CATEGORY_ICONS[expense.category] || '📌';
    const pressTimer = useRef(null);
    const [pressing, setPressing] = useState(false);

    const startPress = useCallback(() => {
        setPressing(true);
        pressTimer.current = setTimeout(() => {
            setPressing(false);
            onLongPress(expense);
        }, LONG_PRESS_DURATION);
    }, [expense, onLongPress]);

    const cancelPress = useCallback(() => {
        setPressing(false);
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
    }, []);

    return (
        <motion.div
            className={`expense-item ${pressing ? 'expense-item-pressing' : ''}`}
            layout
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}
            onMouseDown={startPress}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress}
            onTouchStart={startPress}
            onTouchEnd={cancelPress}
            style={{ userSelect: 'none', cursor: 'pointer' }}
        >
            <div className="expense-item-icon">{icon}</div>
            <div className="expense-item-info">
                <span className="expense-item-desc">{expense.description}</span>
                <span className="expense-item-meta">
                    {expense.category} • {formatDate(expense.date)}
                </span>
            </div>
            <div className="expense-item-right">
                <span className="expense-item-amount">{formatCurrency(expense.amount)}</span>
            </div>
            {/* Long-press progress indicator */}
            {pressing && (
                <div className="long-press-indicator">
                    <div className="long-press-fill" />
                </div>
            )}
        </motion.div>
    );
};

export default ExpenseItem;
