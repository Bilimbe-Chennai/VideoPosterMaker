import dayjs from 'dayjs';

/**
 * Formats a date string or object based on the user's preferred format.
 * @param {Date|string} date - The date to format.
 * @param {string} format - The format string (e.g., 'DD/MM/YYYY', 'MM/DD/YYYY').
 * @returns {string} The formatted date string.
 */
export const formatDate = (date, format = 'DD/MM/YYYY') => {
    if (!date) return '';
    try {
        const d = dayjs(date);
        if (!d.isValid()) return '';

        // Map common formats to dayjs formats if necessary
        // Our options are usually DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
        return d.format(format);
    } catch (e) {
        console.error('Date formatting error:', e);
        return String(date);
    }
};

/**
 * Gets the stored date format from localStorage or returns default.
 */
export const getStoredDateFormat = () => {
    try {
        const settings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
        return settings.general?.dateFormat || 'DD/MM/YYYY';
    } catch (e) {
        return 'DD/MM/YYYY';
    }
};
