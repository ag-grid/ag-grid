import { interpolate } from "./string";
import { locale } from "./time/format/defaultLocale";

describe('interpolate', () => {
    it('should substitute #{key} with values from the given object', () => {
        const name = 'first name';
        const result = interpolate(`My ${name} is #{name} and I live in #{place}`, {
            name: 'Vitaly',
            place: 'London'
        });
        expect(result).toBe('My first name is Vitaly and I live in London');
    });

    it('should strip #{key} if the key is not in the given object', () => {
        const result = interpolate('#{something} #{this} #{stuff} should be gone', {
            something: 'Ebola'
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
                }
            },
            value: 42
        });
        expect(result).toBe('My favorite number: 42');
    });

    // TODO: Investigate why locale: 'en-GB' doesn't work on CI
    // it('should format numbers (using Intl.NumberFormat) and dates', () => {
    //     const format = '%A, %b %d %Y';
    //     const formatter = locale.format(format);
    //     const date = new Date('Wed Sep 23 2020');
    //     const formattedDate = formatter(date);
    //     const result1 = interpolate('I drank #{drink1:liters} of beer and #{drink2:liters} of vodka on #{day:date}', {
    //         drink1: 42000000,
    //         drink2: 1234,
    //         day: date
    //     }, {
    //         liters: {
    //             locales: 'en-GB',
    //             options: {
    //                 style: 'unit',
    //                 unit: 'liter',
    //                 unitDisplay: 'long'
    //             }
    //         },
    //         date: '%A, %b %d %Y'
    //     });
    //     expect(result1).toBe('I drank 42,000,000 litres of beer and 1,234 litres of vodka on ' + formattedDate);
    // });
});