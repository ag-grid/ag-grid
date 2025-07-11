export const DATE_TIME_SEPARATOR = 'T';

export function _padStartWidthZeros(value: number, totalStringSize: number): string {
    return value.toString().padStart(totalStringSize, '0');
}

/**
 * Serialises a Date to a string of format `yyyy-MM-ddTHH:mm:ss`.
 * An alternative separator can be provided to be used instead of hyphens.
 * @param date The date to serialise
 * @param includeTime Whether to include the time in the serialised string
 * @param separator The separator to use between date parts, e.g. 2025-01-01 or 2025/01/01
 */

export function _serialiseDate(date: Date | null, includeTime = true, separator = '-'): string | null {
    if (!date) {
        return null;
    }

    let serialised = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
        .map((part) => _padStartWidthZeros(part, 2))
        .join(separator);

    if (includeTime) {
        serialised +=
            DATE_TIME_SEPARATOR +
            [date.getHours(), date.getMinutes(), date.getSeconds()]
                .map((part) => _padStartWidthZeros(part, 2))
                .join(':');
    }

    return serialised;
}

/**
 * Parses a date and time from a string. Expected format is ISO-compatible `yyyy-MM-dd` or `yyyy-MM-ddTHH:mm:ssZ`.
 *
 * Because of javascript historical reasons, we need to parse the datetime manually:
 * Per MDN:
 *   When the time zone offset is absent, **date-only** forms are interpreted as a UTC time and **date-time** forms are interpreted as a local time.
 *   The interpretation as a UTC time is due to a historical spec error that was not consistent with ISO 8601 but could not be changed due to web compatibility.
 */

export function _parseDateTimeFromString(value?: string | null, bailIfInvalidTime = false): Date | null {
    if (!value) {
        return null;
    }

    const [dateStr, timeStr] = value.split(DATE_TIME_SEPARATOR);

    if (!dateStr) {
        return null;
    }

    const fields = dateStr.split('-').map((f) => parseInt(f, 10));

    if (fields.filter((f) => !isNaN(f)).length !== 3) {
        return null;
    }

    const [year, month, day] = fields;
    const date = new Date(year, month - 1, day);

    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        // date was not parsed as expected so must have been invalid
        return null;
    }

    if (!timeStr || timeStr === '00:00:00') {
        return date;
    }

    const [hours, minutes, seconds] = timeStr.split(':').map((part) => parseInt(part, 10)); // if last part includes Z, it is dropped here

    if (hours >= 0 && hours < 24) {
        date.setHours(hours);
    } else if (bailIfInvalidTime) {
        return null;
    }

    if (minutes >= 0 && minutes < 60) {
        date.setMinutes(minutes);
    } else if (bailIfInvalidTime) {
        return null;
    }

    if (seconds >= 0 && seconds < 60) {
        date.setSeconds(seconds);
    } else if (bailIfInvalidTime) {
        return null;
    }

    return date;
}
