import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import './Categories.css';

const Categories = () => {
    const { state, dispatch } = useApp();
    const { categories, categoryLimits } = state;

    // New category
    const [newName, setNewName] = useState('');
    const [newLimit, setNewLimit] = useState('');

    // Editing
    const [editingCat, setEditingCat] = useState(null);
    const [editLimit, setEditLimit] = useState('');

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState(null);

    const handleAdd = () => {
        const name = newName.trim();
        const limit = parseFloat(newLimit);
        if (!name || !limit || limit <= 0) return;

        dispatch({ type: 'ADD_CATEGORY', payload: name });
        dispatch({ type: 'SET_CATEGORY_LIMIT', payload: { category: name, limit } });
        setNewName('');
        setNewLimit('');
    };

    const handleEditStart = (cat) => {
        setEditingCat(cat);
        setEditLimit((categoryLimits[cat] || 0).toString());
    };

    const handleEditSave = () => {
        const limit = parseFloat(editLimit);
        if (!editingCat || !limit || limit <= 0) return;

        dispatch({ type: 'SET_CATEGORY_LIMIT', payload: { category: editingCat, limit } });
        setEditingCat(null);
        setEditLimit('');
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        dispatch({ type: 'DELETE_CATEGORY', payload: deleteTarget });
        setDeleteTarget(null);
    };

    return (
        <motion.div
            className="categories-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="page-heading">Manage Categories</h2>
            <p className="page-subtitle">Add, edit limits, or remove your spending categories</p>

            {/* Add New Category */}
            <div className="cat-add-card">
                <h3 className="cat-section-title">Add New Category</h3>
                <div className="cat-add-form">
                    <input
                        type="text"
                        className="cat-input"
                        placeholder="Category name..."
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <input
                        type="number"
                        className="cat-input cat-input-limit"
                        placeholder="₹ Monthly limit"
                        value={newLimit}
                        onChange={(e) => setNewLimit(e.target.value)}
                        min="0"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <motion.button
                        className="cat-add-btn"
                        onClick={handleAdd}
                        whileTap={{ scale: 0.95 }}
                        style={{ opacity: (!newName.trim() || !newLimit) ? 0.5 : 1 }}
                    >
                        + Add
                    </motion.button>
                </div>
            </div>

            {/* Category List */}
            <div className="cat-list">
                <AnimatePresence mode="popLayout">
                    {categories.length === 0 ? (
                        <motion.p
                            className="cat-empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            key="empty"
                        >
                            No categories yet. Add one above! 🏷️
                        </motion.p>
                    ) : (
                        categories.map((cat) => (
                            <motion.div
                                key={cat}
                                className="cat-item"
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                            >
                                <div className="cat-item-left">
                                    <span className="cat-item-name">{cat}</span>
                                    {editingCat === cat ? (
                                        <div className="cat-edit-row">
                                            <input
                                                type="number"
                                                className="cat-edit-input"
                                                value={editLimit}
                                                onChange={(e) => setEditLimit(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                                                autoFocus
                                                min="0"
                                            />
                                            <motion.button
                                                className="cat-edit-save"
                                                onClick={handleEditSave}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                Save
                                            </motion.button>
                                            <motion.button
                                                className="cat-edit-cancel"
                                                onClick={() => setEditingCat(null)}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                ✕
                                            </motion.button>
                                        </div>
                                    ) : (
                                        <span className="cat-item-limit">
                                            ₹{(categoryLimits[cat] || 0).toLocaleString('en-IN')} / month
                                        </span>
                                    )}
                                </div>
                                {editingCat !== cat && (
                                    <div className="cat-item-actions">
                                        <motion.button
                                            className="cat-action-btn cat-action-edit"
                                            onClick={() => handleEditStart(cat)}
                                            whileTap={{ scale: 0.9 }}
                                            title="Edit limit"
                                        >
                                            ✏️
                                        </motion.button>
                                        <motion.button
                                            className="cat-action-btn cat-action-delete"
                                            onClick={() => setDeleteTarget(cat)}
                                            whileTap={{ scale: 0.9 }}
                                            title="Delete"
                                        >
                                            🗑️
                                        </motion.button>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-card"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                            <h3 className="modal-title">Delete Category?</h3>
                            <p className="modal-text">
                                Remove "<strong>{deleteTarget}</strong>"?
                                Existing expenses using this tag will keep their data.
                            </p>
                            <div className="modal-actions">
                                <motion.button
                                    className="modal-btn modal-btn-secondary"
                                    onClick={() => setDeleteTarget(null)}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    className="modal-btn modal-btn-danger"
                                    onClick={handleDelete}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Delete
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Categories;
