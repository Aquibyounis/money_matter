import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import AnimatedCounter from '../components/AnimatedCounter';
import AutoSuggest from '../components/AutoSuggest';
import ExpenseItem from '../components/ExpenseItem';
import FilterBar from '../components/FilterBar';
import { generateId, isCurrentMonth } from '../utils/helpers';
import './Dashboard.css';

const Dashboard = () => {
    const { state, dispatch, totals } = useApp();
    const { expenses, categories, categoryLimits, routines, bankBalance } = state;
    const { totalSpent, monthlySpent } = totals;

    // Bank balance
    const currentBalance = bankBalance - totalSpent;
    const [showBalanceEdit, setShowBalanceEdit] = useState(false);
    const [balanceInput, setBalanceInput] = useState('');

    // Monthly budget totals
    const totalMonthlyBudget = useMemo(() => {
        return categories.reduce((sum, cat) => sum + (categoryLimits[cat] || 0), 0);
    }, [categories, categoryLimits]);
    const monthlyRemaining = totalMonthlyBudget - monthlySpent;

    // Add expense form
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedTag, setSelectedTag] = useState('');

    // Routine prompt
    const [showRoutinePrompt, setShowRoutinePrompt] = useState(false);
    const [pendingExpense, setPendingExpense] = useState(null);

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchText, setSearchText] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filteredExpenses = useMemo(() => {
        return expenses.filter((e) => {
            if (selectedCategory !== 'All' && e.category !== selectedCategory) return false;
            if (searchText && !e.description.toLowerCase().includes(searchText.toLowerCase())) return false;
            if (dateFrom && new Date(e.date) < new Date(dateFrom)) return false;
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59);
                if (new Date(e.date) > toDate) return false;
            }
            return true;
        });
    }, [expenses, selectedCategory, searchText, dateFrom, dateTo]);

    // Per-category monthly spending
    const categorySpending = useMemo(() => {
        const map = {};
        expenses
            .filter((e) => isCurrentMonth(e.date))
            .forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
        return map;
    }, [expenses]);

    const finalizeExpense = (desc, amt, tag) => {
        dispatch({
            type: 'ADD_EXPENSE',
            payload: {
                id: generateId(),
                description: desc,
                amount: amt,
                category: tag || 'Uncategorized',
                date: new Date().toISOString(),
            },
        });
        setDescription('');
        setAmount('');
        setSelectedTag('');
    };

    const handleAddExpense = () => {
        if (!description.trim() || !amount || parseFloat(amount) <= 0) return;
        if (!selectedTag) return;

        const desc = description.trim();
        const amt = parseFloat(amount);

        const isRoutine = routines.some(
            (r) => r.toLowerCase() === desc.toLowerCase()
        );

        if (isRoutine) {
            finalizeExpense(desc, amt, selectedTag);
        } else {
            setPendingExpense({ desc, amt, tag: selectedTag });
            setShowRoutinePrompt(true);
        }
    };

    const handleRoutineResponse = (saveAsRoutine) => {
        if (saveAsRoutine && pendingExpense) {
            dispatch({ type: 'ADD_ROUTINE', payload: pendingExpense.desc });
        }
        if (pendingExpense) {
            finalizeExpense(pendingExpense.desc, pendingExpense.amt, pendingExpense.tag);
        }
        setShowRoutinePrompt(false);
        setPendingExpense(null);
    };

    const handleSaveBalance = () => {
        const val = parseFloat(balanceInput);
        if (!isNaN(val) && val >= 0) {
            dispatch({ type: 'SET_BANK_BALANCE', payload: val });
        }
        setShowBalanceEdit(false);
        setBalanceInput('');
    };

    const handleLongPress = useCallback((expense) => {
        setDeleteTarget(expense);
    }, []);

    const confirmDelete = () => {
        if (deleteTarget) {
            dispatch({ type: 'DELETE_EXPENSE', payload: deleteTarget.id });
            setDeleteTarget(null);
        }
    };

    const spentPct = totalMonthlyBudget > 0
        ? Math.min(100, (monthlySpent / totalMonthlyBudget) * 100)
        : 0;

    return (
        <motion.div
            className="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Bank Balance Card */}
            <motion.div
                className="balance-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="balance-top">
                    <div>
                        <span className="balance-label">Bank Balance</span>
                        <span className={`balance-value ${currentBalance < 0 ? 'negative' : ''}`}>
                            {currentBalance < 0 ? '-' : ''}₹<AnimatedCounter value={Math.abs(currentBalance)} />
                        </span>
                    </div>
                    <motion.button
                        className="balance-edit-btn"
                        onClick={() => { setShowBalanceEdit(true); setBalanceInput(bankBalance.toString()); }}
                        whileTap={{ scale: 0.9 }}
                        title="Set bank balance"
                    >
                        ✏️
                    </motion.button>
                </div>
            </motion.div>

            {/* Balance Edit Modal */}
            <AnimatePresence>
                {showBalanceEdit && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="modal-card" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
                            <h3 className="modal-title">Set Bank Balance</h3>
                            <p className="modal-text">Enter your current total bank balance.</p>
                            <input
                                type="number"
                                className="modal-input"
                                placeholder="₹ Amount"
                                value={balanceInput}
                                onChange={(e) => setBalanceInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveBalance()}
                                autoFocus
                                min="0"
                            />
                            <div className="modal-actions">
                                <motion.button className="modal-btn modal-btn-secondary" onClick={() => setShowBalanceEdit(false)} whileTap={{ scale: 0.95 }}>Cancel</motion.button>
                                <motion.button className="modal-btn modal-btn-primary" onClick={handleSaveBalance} whileTap={{ scale: 0.95 }}>Save</motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Total Spent & This Month — separate cards */}
            <div className="summary-row">
                <motion.div
                    className="summary-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ y: -2 }}
                >
                    <span className="summary-label">Total Spent</span>
                    <span className="summary-value">₹<AnimatedCounter value={totalSpent} /></span>
                    <span className="summary-icon">📊</span>
                </motion.div>

                <motion.div
                    className="summary-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ y: -2 }}
                >
                    <span className="summary-label">This Month</span>
                    <span className="summary-value">₹<AnimatedCounter value={monthlySpent} /></span>
                    <span className="summary-icon">📅</span>
                </motion.div>
            </div>

            {/* Monthly Budget Bar */}
            {totalMonthlyBudget > 0 && (
                <motion.div
                    className="monthly-bar-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <div className="monthly-bar-top">
                        <span className="monthly-bar-label">Budget</span>
                        <span className="monthly-bar-amounts">
                            ₹{monthlySpent.toLocaleString('en-IN')}
                            <small> / ₹{totalMonthlyBudget.toLocaleString('en-IN')}</small>
                        </span>
                    </div>
                    <div className="monthly-bar-track">
                        <motion.div
                            className="monthly-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${spentPct}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            style={{
                                background: spentPct > 90 ? 'var(--danger)' : spentPct > 70 ? 'var(--warning)' : 'var(--accent)',
                            }}
                        />
                    </div>
                    <span className={`monthly-bar-remaining ${monthlyRemaining < 0 ? 'negative' : ''}`}>
                        {monthlyRemaining < 0 ? 'Over by' : 'Remaining:'} ₹{Math.abs(monthlyRemaining).toLocaleString('en-IN')}
                    </span>
                </motion.div>
            )}

            {/* Quick Category Snapshot */}
            {categories.length > 0 && (
                <div className="quick-category-row">
                    {categories.map((cat) => {
                        const limit = categoryLimits[cat] || 0;
                        const spent = categorySpending[cat] || 0;
                        const rem = limit - spent;
                        return (
                            <motion.div
                                key={cat}
                                className={`quick-cat-chip ${rem < 0 ? 'quick-cat-over' : ''}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <span className="quick-cat-name">{cat}</span>
                                <span className="quick-cat-amount">
                                    {rem < 0 ? `-₹${Math.abs(rem)}` : `₹${rem}`}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Add Expense */}
            <motion.div
                className="card add-expense-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
            >
                <h3 className="card-title">Add Expense</h3>
                <div className="add-expense-form">
                    <AutoSuggest
                        value={description}
                        onChange={setDescription}
                        suggestions={routines}
                        placeholder="Description..."
                    />
                    <input
                        type="number"
                        className="amount-input"
                        placeholder="₹ Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0"
                        step="1"
                    />
                </div>

                {/* Category Tags — read-only from Categories page */}
                {categories.length > 0 ? (
                    <div className="tag-section">
                        <span className="tag-label">Category</span>
                        <div className="tag-list">
                            {categories.map((cat) => (
                                <motion.button
                                    key={cat}
                                    className={`tag-chip ${selectedTag === cat ? 'tag-chip-active' : ''}`}
                                    onClick={() => setSelectedTag(selectedTag === cat ? '' : cat)}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {cat}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="no-tags-hint">No categories yet — create them in the <strong>Categories</strong> tab</p>
                )}

                <motion.button
                    className="add-btn add-btn-full"
                    onClick={handleAddExpense}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ boxShadow: '0 4px 20px rgba(108,92,231,0.3)' }}
                    disabled={!description.trim() || !amount || !selectedTag}
                    style={{ opacity: (!description.trim() || !amount || !selectedTag) ? 0.5 : 1 }}
                >
                    + Add Expense
                </motion.button>
            </motion.div>

            {/* Routine Prompt Modal */}
            <AnimatePresence>
                {showRoutinePrompt && pendingExpense && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="modal-card" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
                            <h3 className="modal-title">Save to Routine?</h3>
                            <p className="modal-text">"<strong>{pendingExpense.desc}</strong>" is new. Save it for quick access next time?</p>
                            <div className="modal-actions">
                                <motion.button className="modal-btn modal-btn-secondary" onClick={() => handleRoutineResponse(false)} whileTap={{ scale: 0.95 }}>Just Once</motion.button>
                                <motion.button className="modal-btn modal-btn-primary" onClick={() => handleRoutineResponse(true)} whileTap={{ scale: 0.95 }}>Save</motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="modal-card" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
                            <h3 className="modal-title">Delete Expense?</h3>
                            <p className="modal-text">Delete "<strong>{deleteTarget.description}</strong>" — ₹{deleteTarget.amount}?</p>
                            <div className="modal-actions">
                                <motion.button className="modal-btn modal-btn-secondary" onClick={() => setDeleteTarget(null)} whileTap={{ scale: 0.95 }}>Cancel</motion.button>
                                <motion.button className="modal-btn modal-btn-danger" onClick={confirmDelete} whileTap={{ scale: 0.95 }}>Delete</motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters */}
            <motion.div
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h3 className="card-title">Filters</h3>
                <FilterBar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    searchText={searchText}
                    onSearchChange={setSearchText}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    onDateFromChange={setDateFrom}
                    onDateToChange={setDateTo}
                />
            </motion.div>

            {/* Expense List */}
            <div className="expense-list-section">
                <div className="section-header">
                    <h3 className="card-title">Expenses</h3>
                    <span className="expense-count">{filteredExpenses.length} items</span>
                </div>
                <p className="long-press-hint">Long press an expense to delete it</p>
                <div className="expense-list">
                    <AnimatePresence mode="popLayout">
                        {filteredExpenses.length === 0 ? (
                            <motion.p className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="empty">
                                No expenses yet. Add one above! 🎉
                            </motion.p>
                        ) : (
                            filteredExpenses.map((expense) => (
                                <ExpenseItem key={expense.id} expense={expense} onLongPress={handleLongPress} />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
