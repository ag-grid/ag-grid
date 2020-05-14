import { padStart } from './number';

/**
 * Serialises a Date to a string of format `yyyy-MM-dd HH:mm:ss`.
 * An alternative separator can be provided to be used instead of hyphens.
 * @param date The date to serialise
 * @param includeTime Whether to include the time in the serialised string
 * @param separator The separator to use between date parts
 */
export function serialiseDate(date: Date, includeTime = true, separator = '-'): string | null {
    if (!date) { return null; }

    let serialised = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(part => padStart(part, 2)).join(separator);

    if (includeTime) {
        serialised += ' ' + [date.getHours(), date.getMinutes(), date.getSeconds()].map(part => padStart(part, 2)).join(':');
    }

    return serialised;
}

/**
 * Parses a date and time from a string in the format `yyyy-MM-dd HH:mm:ss`
 */
export function parseDateTimeFromString(value: string): Date | null {
    if (!value) {
        return null;
    }

    const [dateStr, timeStr] = value.split(' ');

    if (!dateStr) { return null; }

    const fields = dateStr.split('-').map(f => parseInt(f, 10));

    if (fields.filter(f => !isNaN(f)).length !== 3) { return null; }

    const [year, month, day] = fields;
    const date = new Date(year, month - 1, day);

    if (date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day) {
        // date was not parsed as expected so must have been invalid
        return null;
    }

    if (!timeStr || timeStr === '00:00:00') {
        return date;
    }

    const [hours, minutes, seconds] = timeStr.split(':').map(part => parseInt(part, 10));

    if (hours >= 0 && hours < 24) {
        date.setHours(hours);
    }

    if (minutes >= 0 && minutes < 60) {
        date.setMinutes(minutes);
    }

    if (seconds >= 0 && seconds < 60) {
        date.setSeconds(seconds);
    }

    return date;
}
