const PREFIX = 'money_tracker_';

export const getItem = (key) => {
    try {
        const item = localStorage.getItem(PREFIX + key);
        return item ? JSON.parse(item) : null;
    } catch {
        return null;
    }
};

export const setItem = (key, value) => {
    try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
        console.error('localStorage error:', e);
    }
};

export const removeItem = (key) => {
    localStorage.removeItem(PREFIX + key);
};
