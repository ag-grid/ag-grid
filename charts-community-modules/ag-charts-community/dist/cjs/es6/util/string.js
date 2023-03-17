"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpolate = void 0;
const timeFormat_1 = require("./timeFormat");
const interpolatePattern = /(#\{(.*?)\})/g;
function interpolate(input, values, formats) {
    return input.replace(interpolatePattern, function (...args) {
        const name = args[2];
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
                const formatter = timeFormat_1.buildFormatter(format);
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
