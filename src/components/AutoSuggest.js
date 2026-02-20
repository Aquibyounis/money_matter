import React, { useState, useRef, useEffect } from 'react';
import './AutoSuggest.css';

const AutoSuggest = ({ value, onChange, suggestions, placeholder }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filtered, setFiltered] = useState([]);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (value.length > 0) {
            const matches = suggestions.filter((s) =>
                s.toLowerCase().includes(value.toLowerCase())
            );
            setFiltered(matches);
            setShowSuggestions(matches.length > 0);
        } else {
            setShowSuggestions(false);
        }
    }, [value, suggestions]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="autosuggest" ref={wrapperRef}>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => {
                    if (value.length > 0 && filtered.length > 0) setShowSuggestions(true);
                }}
                placeholder={placeholder}
                className="autosuggest-input"
            />
            {showSuggestions && (
                <div className="autosuggest-dropdown">
                    {filtered.map((item) => (
                        <button
                            key={item}
                            className="autosuggest-item"
                            onClick={() => {
                                onChange(item);
                                setShowSuggestions(false);
                            }}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AutoSuggest;
