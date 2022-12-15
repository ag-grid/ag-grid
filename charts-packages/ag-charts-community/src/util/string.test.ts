import { describe, expect, it } from '@jest/globals';
import { interpolate } from './string';
import { buildFormatter } from './timeFormat';

describe('interpolate', () => {
    it('should substitute #{key} with values from the given object', () => {
        const name = 'first name';
        const result = interpolate(`My ${name} is #{name} and I live in #{place}`, {
            name: 'Vitaly',
            place: 'London',
        });
        expect(result).toBe('My first name is Vitaly and I live in London');
    });

    it('should strip #{key} if the key is not in the given object', () => {
        const result = interpolate('#{something} #{this} #{stuff} should be gone', {
            something: 'Ebola',
        });
        expect(result).toBe('Ebola   should be gone');
    });

    it('should convert numbers and objects with toString method to strings', () => {
        const result = interpolate('#{caption}: #{value}', {
            caption: {
                first: 'My',
                second: 'favorite',
                third: 'number',
                toString: function () {
                    return this.first + ' ' + this.second + ' ' + this.third;
                },
            },
            value: 42,
        });
        expect(result).toBe('My favorite number: 42');
    });

    it('should format numbers (using Intl.NumberFormat) and dates', () => {
        const format = '%A, %b %d %Y';
        const formatter = buildFormatter(format);
        const amount1 = 42000000;
        const amount2 = 1234;
        const locales = 'en-GB';
        const date = new Date('Wed Sep 23 2020');
        const options = {
            style: 'unit',
            unit: 'liter',
            unitDisplay: 'long',
        };
        const formattedAmount1 = amount1.toLocaleString(locales, options);
        const formattedAmount2 = amount2.toLocaleString(locales, options);
        const formattedDate = formatter(date);
        const result1 = interpolate(
            'I drank #{amount1:liters} of beer and #{amount2:liters} of vodka on #{day:date}',
            {
                amount1,
                amount2,
                day: date,
            },
            {
                liters: {
                    locales,
                    options,
                },
                date: '%A, %b %d %Y',
            }
        );
        expect(result1).toBe(
            `I drank ${formattedAmount1} of beer and ${formattedAmount2} of vodka on ${formattedDate}`
        );
    });
});
