export const parseISODate = (dateString: string): Date | null => {
    try {
        const date = new Date(dateString.replace('Z', '+00:00'));

        if (isNaN(date.getTime())) {
            return null;
        }

        return date;
    } catch (e) {
        return null;
    }
};