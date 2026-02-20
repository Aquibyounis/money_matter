import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { getItem, setItem } from '../utils/storage';
import { isCurrentMonth } from '../utils/helpers';

const AppContext = createContext();

const initialState = {
    expenses: getItem('expenses') || [],
    categories: getItem('categories') || [],
    categoryLimits: getItem('categoryLimits') || {},
    routines: getItem('routines') || [],
    bankBalance: getItem('bankBalance') ?? 0,
    darkMode: getItem('darkMode') || false,
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'ADD_EXPENSE':
            return { ...state, expenses: [action.payload, ...state.expenses] };
        case 'DELETE_EXPENSE':
            return { ...state, expenses: state.expenses.filter((e) => e.id !== action.payload) };
        case 'ADD_CATEGORY':
            if (state.categories.includes(action.payload)) return state;
            return { ...state, categories: [...state.categories, action.payload] };
        case 'DELETE_CATEGORY': {
            const newLimits = { ...state.categoryLimits };
            delete newLimits[action.payload];
            return {
                ...state,
                categories: state.categories.filter((c) => c !== action.payload),
                categoryLimits: newLimits,
            };
        }
        case 'SET_CATEGORY_LIMIT':
            return {
                ...state,
                categoryLimits: {
                    ...state.categoryLimits,
                    [action.payload.category]: action.payload.limit,
                },
            };
        case 'ADD_ROUTINE':
            if (state.routines.some(r => r.toLowerCase() === action.payload.toLowerCase())) return state;
            return { ...state, routines: [...state.routines, action.payload] };
        case 'SET_BANK_BALANCE':
            return { ...state, bankBalance: action.payload };
        case 'TOGGLE_DARK_MODE':
            return { ...state, darkMode: !state.darkMode };
        default:
            return state;
    }
};

export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => { setItem('expenses', state.expenses); }, [state.expenses]);
    useEffect(() => { setItem('categories', state.categories); }, [state.categories]);
    useEffect(() => { setItem('categoryLimits', state.categoryLimits); }, [state.categoryLimits]);
    useEffect(() => { setItem('routines', state.routines); }, [state.routines]);
    useEffect(() => { setItem('bankBalance', state.bankBalance); }, [state.bankBalance]);
    useEffect(() => {
        setItem('darkMode', state.darkMode);
        document.documentElement.setAttribute('data-theme', state.darkMode ? 'dark' : 'light');
    }, [state.darkMode]);

    const totals = useMemo(() => {
        const totalSpent = state.expenses.reduce((sum, e) => sum + e.amount, 0);
        const monthlySpent = state.expenses
            .filter((e) => isCurrentMonth(e.date))
            .reduce((sum, e) => sum + e.amount, 0);
        return { totalSpent, monthlySpent };
    }, [state.expenses]);

    return (
        <AppContext.Provider value={{ state, dispatch, totals }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
};
