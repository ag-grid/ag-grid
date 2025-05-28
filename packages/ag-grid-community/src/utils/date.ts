const DATE_TIME_SEPARATOR = 'T';
/**
 * Executing this against date produces the following:
 * ["2008-08-24T21:00:08"," 21:00:08"]
 */
const DATE_TIME_REGEXP = new RegExp(`^\\d{4}-\\d{2}-\\d{2}(${DATE_TIME_SEPARATOR}\\d{2}:\\d{2}:\\d{2}\\D?)?`);

function _padStartWidthZeros(value: number, totalStringSize: number): string {
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
 * Helper function to get the date parts of a date. Used in set filter.
 * @param d The date to get the parts from
 * @param includeTime Whether to include the time in the returned array
 * @returns The date parts as an array of strings or null if the date is null or undefined
 */
export function _getDateParts(d: Date | null | undefined, includeTime: boolean = true): null | string[] {
    if (!d) {
        return null;
    }

    if (includeTime) {
        return [
            String(d.getFullYear()),
            String(d.getMonth() + 1),
            String(d.getDate()),
            _padStartWidthZeros(d.getHours(), 2),
            `:${_padStartWidthZeros(d.getMinutes(), 2)}`,
            `:${_padStartWidthZeros(d.getSeconds(), 2)}`,
        ];
    }

    return [d.getFullYear(), d.getMonth() + 1, d.getDate()].map(String);
}

const calculateOrdinal = (value: number) => {
    if (value > 3 && value < 21) {
        return 'th';
    }
    const remainder = value % 10;
    switch (remainder) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
    }
    return 'th';
};

/**
 * Serialises a Date to a string of format the defined format, does not include time.
 * @param date The date to serialise
 * @param format The string to format the date to, defaults to YYYY-MM-DD
 */
export function _dateToFormattedString(date: Date, format: string = 'YYYY-MM-DD'): string {
    const fullYear = _padStartWidthZeros(date.getFullYear(), 4);
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const replace: { [key: string]: () => string } = {
        YYYY: () => fullYear.slice(fullYear.length - 4, fullYear.length),
        YY: () => fullYear.slice(fullYear.length - 2, fullYear.length),
        Y: () => `${date.getFullYear()}`,
        MMMM: () => months[date.getMonth()],
        MMM: () => months[date.getMonth()].slice(0, 3),
        MM: () => _padStartWidthZeros(date.getMonth() + 1, 2),
        Mo: () => `${date.getMonth() + 1}${calculateOrdinal(date.getMonth() + 1)}`,
        M: () => `${date.getMonth() + 1}`,
        Do: () => `${date.getDate()}${calculateOrdinal(date.getDate())}`,
        DD: () => _padStartWidthZeros(date.getDate(), 2),
        D: () => `${date.getDate()}`,
        dddd: () => days[date.getDay()],
        ddd: () => days[date.getDay()].slice(0, 3),
        dd: () => days[date.getDay()].slice(0, 2),
        do: () => `${date.getDay()}${calculateOrdinal(date.getDay())}`,
        d: () => `${date.getDay()}`,
    };
    const regexp = new RegExp(Object.keys(replace).join('|'), 'g');
    return format.replace(regexp, (match) => {
        if (match in replace) {
            return replace[match]();
        }
        return match;
    });
}

/**
 * Helper function to check if a date is valid. Use isValidDateTime() to check if a date is valid and has time parts.
 */
export function _isValidDate(value?: string | null, bailIfInvalidTime = false): boolean {
    return !!_parseDateTimeFromString(value, bailIfInvalidTime);
}

// check if dateTime is a valid date and has time parts
export function _isValidDateTime(value?: string | null): boolean {
    return !!value && _isValidDate(value, true) && !!value.match(DATE_TIME_REGEXP)?.[1]; // matches the 'T14:22:19' part
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
