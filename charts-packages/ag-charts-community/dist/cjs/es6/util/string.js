"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultLocale_1 = require("./time/format/defaultLocale");
const interpolatePattern = /(#\{(.*?)\})/g;
function interpolate(input, values, formats) {
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
                const formatter = defaultLocale_1.locale.format(format);
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
exports.interpolate = interpolate;
