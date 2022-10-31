import { locale } from './time/format/defaultLocale';
const interpolatePattern = /(#\{(.*?)\})/g;
export function interpolate(input, values, formats) {
    return input.replace(interpolatePattern, function () {
        const name = arguments[2];
        const [valueName, formatName] = name.split(':');
        const value = values[valueName];
        if (typeof value === 'number') {
            const format = formatName && formats && formats[formatName];
            if (format) {
                const { locales, options } = format;
                return value.toLocaleString(locales, options);
            }
            return String(value);
        }
        if (value instanceof Date) {
            const format = formatName && formats && formats[formatName];
            if (typeof format === 'string') {
                const formatter = locale.format(format);
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
