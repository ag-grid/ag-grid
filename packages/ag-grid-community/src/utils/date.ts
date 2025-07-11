import {
    DATE_TIME_SEPARATOR,
    _padStartWidthZeros,
    _parseDateTimeFromString,
    _serialiseDate,
} from '../agStack/utils/dateUtils';

/**
 * Executing this against date produces the following:
 * ["2008-08-24T21:00:08"," 21:00:08"]
 */
const DATE_TIME_REGEXP = new RegExp(`^\\d{4}-\\d{2}-\\d{2}(${DATE_TIME_SEPARATOR}\\d{2}:\\d{2}:\\d{2}\\D?)?`);

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
            _padStartWidthZeros(d.getDate(), 2),
            _padStartWidthZeros(d.getHours(), 2),
            `:${_padStartWidthZeros(d.getMinutes(), 2)}`,
            `:${_padStartWidthZeros(d.getSeconds(), 2)}`,
        ];
    }

    return [d.getFullYear(), d.getMonth() + 1, _padStartWidthZeros(d.getDate(), 2)].map(String);
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
export function _dateToFormattedString(date: Date, format?: string): string {
    if (format == null) {
        // returns YYYY-MM-DD, but is more efficient
        return _serialiseDate(date, false)!;
    }
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
