"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var string_1 = require("./string");
var defaultLocale_1 = require("./time/format/defaultLocale");
describe('interpolate', function () {
    it('should substitute #{key} with values from the given object', function () {
        var name = 'first name';
        var result = string_1.interpolate("My " + name + " is #{name} and I live in #{place}", {
            name: 'Vitaly',
            place: 'London'
        });
        expect(result).toBe('My first name is Vitaly and I live in London');
    });
    it('should strip #{key} if the key is not in the given object', function () {
        var result = string_1.interpolate('#{something} #{this} #{stuff} should be gone', {
            something: 'Ebola'
        });
        expect(result).toBe('Ebola   should be gone');
    });
    it('should convert numbers and objects with toString method to strings', function () {
        var result = string_1.interpolate('#{caption}: #{value}', {
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
    it('should format numbers (using Intl.NumberFormat) and dates', function () {
        var format = '%A, %b %d %Y';
        var formatter = defaultLocale_1.locale.format(format);
        var amount1 = 42000000;
        var amount2 = 1234;
        var locales = 'en-GB';
        var date = new Date('Wed Sep 23 2020');
        var options = {
            style: 'unit',
            unit: 'liter',
            unitDisplay: 'long'
        };
        var formattedAmount1 = amount1.toLocaleString(locales, options);
        var formattedAmount2 = amount2.toLocaleString(locales, options);
        var formattedDate = formatter(date);
        var result1 = string_1.interpolate('I drank #{amount1:liters} of beer and #{amount2:liters} of vodka on #{day:date}', {
            amount1: amount1,
            amount2: amount2,
            day: date
        }, {
            liters: {
                locales: locales,
                options: options
            },
            date: '%A, %b %d %Y'
        });
        expect(result1).toBe("I drank " + formattedAmount1 + " of beer and " + formattedAmount2 + " of vodka on " + formattedDate);
    });
});
//# sourceMappingURL=string.test.js.map