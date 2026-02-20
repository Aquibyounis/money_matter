import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { isCurrentMonth, CHART_COLORS } from '../utils/helpers';
import './Analytics.css';

const Analytics = () => {
    const { state } = useApp();
    const { expenses, categories, categoryLimits } = state;

    // Budget data: for each category, compute limit, spent this month, remaining
    const budgetData = useMemo(() => {
        // Get current month expenses per category
        const monthlyByCategory = {};
        expenses
            .filter((e) => isCurrentMonth(e.date))
            .forEach((e) => {
                monthlyByCategory[e.category] = (monthlyByCategory[e.category] || 0) + e.amount;
            });

        return categories.map((cat) => {
            const limit = categoryLimits[cat] || 0;
            const spent = monthlyByCategory[cat] || 0;
            const remaining = Math.max(0, limit - spent);
            const overBudget = spent > limit;
            return { name: cat, limit, spent, remaining, overBudget };
        });
    }, [expenses, categories, categoryLimits]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = budgetData.find((d) => d.name === label);
            if (!data) return null;
            return (
                <div className="budget-tooltip">
                    <strong>{label}</strong>
                    <div>Limit: ₹{data.limit.toLocaleString('en-IN')}</div>
                    <div style={{ color: '#e74c3c' }}>Spent: ₹{data.spent.toLocaleString('en-IN')}</div>
                    <div style={{ color: '#00b894' }}>Remaining: ₹{data.remaining.toLocaleString('en-IN')}</div>
                    {data.overBudget && (
                        <div style={{ color: '#e74c3c', fontWeight: 700, marginTop: 4 }}>
                            ⚠ Over by ₹{(data.spent - data.limit).toLocaleString('en-IN')}
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    if (categories.length === 0) {
        return (
            <motion.div
                className="analytics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="empty-analytics">
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 15 }}>
                        No categories yet.<br />Create tags in Dashboard to see your budget overview here! 📊
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="analytics"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Budget Overview - Stacked Bar Chart */}
            <motion.div className="chart-card" variants={itemVariants}>
                <h3 className="chart-title">Monthly Budget Overview</h3>
                <p className="chart-subtitle">Spent vs Remaining for each category</p>
                <ResponsiveContainer width="100%" height={Math.max(220, categories.length * 50)}>
                    <BarChart
                        data={budgetData}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        barCategoryGap="20%"
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                        <XAxis
                            type="number"
                            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                            tickFormatter={(v) => `₹${v}`}
                        />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tick={{ fontSize: 12, fill: 'var(--text-primary)', fontWeight: 600 }}
                            width={80}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                        />
                        <Bar
                            dataKey="spent"
                            name="Spent"
                            stackId="budget"
                            radius={[0, 0, 0, 0]}
                            animationDuration={800}
                        >
                            {budgetData.map((entry, index) => (
                                <Cell
                                    key={entry.name}
                                    fill={entry.overBudget ? '#e74c3c' : CHART_COLORS[index % CHART_COLORS.length]}
                                />
                            ))}
                        </Bar>
                        <Bar
                            dataKey="remaining"
                            name="Remaining"
                            stackId="budget"
                            fill="rgba(0,184,148,0.25)"
                            radius={[0, 4, 4, 0]}
                            animationDuration={800}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Category Cards */}
            <motion.div className="budget-cards" variants={itemVariants}>
                {budgetData.map((cat, i) => {
                    const pct = cat.limit > 0 ? Math.min((cat.spent / cat.limit) * 100, 100) : 0;
                    const overPct = cat.limit > 0 && cat.spent > cat.limit
                        ? Math.min(((cat.spent - cat.limit) / cat.limit) * 100, 50)
                        : 0;

                    return (
                        <motion.div
                            key={cat.name}
                            className={`budget-card ${cat.overBudget ? 'budget-card-over' : ''}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <div className="budget-card-header">
                                <span className="budget-card-name">{cat.name}</span>
                                <span className={`budget-card-status ${cat.overBudget ? 'over' : 'ok'}`}>
                                    {cat.overBudget ? '⚠ Over' : '✓ OK'}
                                </span>
                            </div>
                            <div className="budget-card-amounts">
                                <span>₹{cat.spent.toLocaleString('en-IN')} <small>/ ₹{cat.limit.toLocaleString('en-IN')}</small></span>
                                <span className="budget-card-remaining">
                                    {cat.overBudget
                                        ? `-₹${(cat.spent - cat.limit).toLocaleString('en-IN')}`
                                        : `₹${cat.remaining.toLocaleString('en-IN')} left`
                                    }
                                </span>
                            </div>
                            <div className="budget-progress-track">
                                <motion.div
                                    className="budget-progress-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    style={{
                                        background: cat.overBudget
                                            ? '#e74c3c'
                                            : pct > 80
                                                ? '#fdcb6e'
                                                : CHART_COLORS[i % CHART_COLORS.length],
                                    }}
                                />
                                {overPct > 0 && (
                                    <motion.div
                                        className="budget-progress-over"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${overPct}%` }}
                                        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                                    />
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
};

export default Analytics;
