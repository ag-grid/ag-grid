function _padStartWidthZeros(value: number, totalStringSize: number): string {
    return value.toString().padStart(totalStringSize, '0');
}

/**
 * Serialises a Date to a string of format `yyyy-MM-dd HH:mm:ss`.
 * An alternative separator can be provided to be used instead of hyphens.
 * @param date The date to serialise
 * @param includeTime Whether to include the time in the serialised string
 * @param separator The separator to use between date parts
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
            ' ' +
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
 * Parses a date and time from a string in the format `yyyy-MM-dd HH:mm:ss`
 */
export function _parseDateTimeFromString(value?: string | null): Date | null {
    if (!value) {
        return null;
    }

    const [dateStr, timeStr] = value.split(' ');

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

    const [hours, minutes, seconds] = timeStr.split(':').map((part) => parseInt(part, 10));

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
