function _padStartWidthZeros(value: number, totalStringSize: number): string {
    return value.toString().padStart(totalStringSize, '0');
}

/**
 * Serialises a Date to a string of format `yyyy-MM-dd HH:mm:ss`.
 * An alternative separator can be provided to be used instead of hyphens.
 * @param date The date to serialise
 * @param includeTime Whether to include the time in the serialised string
 * @param dateSeparator The separator to use between date parts, e.g. 2025-01-01 or 2025/01/01
 * @param dateTimeSeparator  The separator to use between date and time parts, e.g. 2025-01-01 12:00:00 or 2025-01-01T12:00:00
 */
export function _serialiseDate(
    date: Date | null,
    includeTime = true,
    dateSeparator = '-',
    dateTimeSeparator = ' '
): string | null {
    if (!date) {
        return null;
    }

    let serialised = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
        .map((part) => _padStartWidthZeros(part, 2))
        .join(dateSeparator);

    if (includeTime) {
        serialised +=
            dateTimeSeparator +
            [date.getHours(), date.getMinutes(), date.getSeconds()]
                .map((part) => _padStartWidthZeros(part, 2))
                .join(':');
    }

    return serialised;
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
 * Executing this against date produces the following:
 * ["2008-08-24 03:46:08","2008","-","08","-","24"," 03:46:08"," ","03",":","46",":","08"]
 * [                   0,     1,  2,   3,  4,   5,          6,  7,   8,  9,  10, 11,  12] - indexes if you want to refer to a specific part
 */
const DATE_TIME_REGEXP = /^(\d{4})(.)(\d{2})(.)(\d{2})((.)(\d{2})(.)(\d{2})(.)(\d{2}))?$/;

/**
 * Helper function to check if a date is valid. Use isValidDateTime() to check if a date is valid and has time parts.
 */
export function isValidDate(value?: string | null): boolean {
    return !!_parseDateTimeFromString(value);
}

export function isValidDateTime(value?: string | null): boolean {
    if (!value || !isValidDate(value)) {
        return false;
    }
    const dateTime = value.match(DATE_TIME_REGEXP);
    if (!dateTime) {
        return false;
    }
    // check if dateTime has time parts
    return !!dateTime[6]; // matches the whole 'T14:22:19' part
}

/**
 * Parses a date and time from a string in any format Date() can accept.
 */
export function _parseDateTimeFromString(value?: string | null): Date | null {
    if (!value) {
        return null;
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        return null;
    }
    return date;
}
