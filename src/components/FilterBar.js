import React from 'react';
import './FilterBar.css';

const FilterBar = ({
    categories,
    selectedCategory,
    onCategoryChange,
    searchText,
    onSearchChange,
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
}) => {
    return (
        <div className="filter-bar">
            <div className="filter-search">
                <span className="filter-search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchText}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="filter-input"
                />
            </div>
            <div className="filter-row">
                <select
                    className="filter-select"
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <input
                    type="date"
                    className="filter-date"
                    value={dateFrom}
                    onChange={(e) => onDateFromChange(e.target.value)}
                />
                <input
                    type="date"
                    className="filter-date"
                    value={dateTo}
                    onChange={(e) => onDateToChange(e.target.value)}
                />
            </div>
        </div>
    );
};

export default FilterBar;
