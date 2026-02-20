export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const generateId = () => {
    return Date.now() + Math.random().toString(36).substring(2, 9);
};

export const getMonthName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('default', { month: 'short' });
};

export const getWeekLabel = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    if (day <= 7) return 'Week 1';
    if (day <= 14) return 'Week 2';
    if (day <= 21) return 'Week 3';
    return 'Week 4';
};

export const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export const isCurrentMonth = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

export const CATEGORY_ICONS = {
    Food: '🍔',
    Transport: '🚗',
    Entertainment: '🎬',
    Shopping: '🛍️',
    Bills: '📄',
    Health: '💊',
    Education: '📚',
    Other: '📌',
};

export const CHART_COLORS = [
    '#6c5ce7', '#00b894', '#e74c3c', '#fdcb6e',
    '#0984e3', '#e17055', '#00cec9', '#fd79a8',
    '#636e72', '#55efc4',
];
