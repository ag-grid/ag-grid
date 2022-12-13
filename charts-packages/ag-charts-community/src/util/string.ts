import { buildFormatter } from './timeFormat';

const interpolatePattern = /(#\{(.*?)\})/g;

type NumberFormat = {
    locales?: string | string[];
    options?: any;
};

type DateFormat = string;

type ValueFormat = NumberFormat | DateFormat;

export function interpolate(
    input: string,
    values: { [key in string]: any },
    formats?: { [key in string]: ValueFormat }
): string {
    return input.replace(interpolatePattern, function () {
        const name = arguments[2];
        const [valueName, formatName] = name.split(':');
        const value = values[valueName];

        if (typeof value === 'number') {
            const format = formatName && formats && formats[formatName];

            if (format) {
                const { locales, options } = format as NumberFormat;
                return value.toLocaleString(locales, options);
            }

            return String(value);
        }

        if (value instanceof Date) {
            const format = formatName && formats && formats[formatName];
            if (typeof format === 'string') {
                const formatter = buildFormatter(format);
                return formatter(value);
            }
            return value.toDateString();
        }

        if (typeof value === 'string' || (value && value.toString)) {
            return String(value);
        }

        return '';
    });
}
