import { describe, expect, test } from '@jest/globals';
import { format } from './numberFormat';
import { LinearScale } from '../scale/linearScale';

describe('format', () => {
    test('fixed point', () => {
        expect(format('.1f')(0.1 + 0.2)).toBe('0.3');
        expect(format('.2f')(0.337)).toBe('0.34');
        expect(format('.3f')(0.3337)).toBe('0.334');
        expect(format('.4f')(123)).toBe('123.0000');
        expect(format('f')(0.1234567890123456)).toBe('0.123457');
    });
    test('rounded percentage', () => {
        const f = format('.0%');
        expect(f(0.3)).toBe('30%');
        expect(f(0.123)).toBe('12%');
        expect(f(40)).toBe('4000%');
    });
    test('fixed point percentage', () => {
        expect(format('.2%')(0.345)).toBe('34.50%');
    });
    test('percentage rounded to significant digits', () => {
        expect(format('.2p')(0.678)).toBe('68%');
    });
    test('decimal rounded to integer', () => {
        expect(format('d')(67.7)).toBe('68');
    });
    test('localized fixed-point currency', () => {
        expect(format('$.2f')(3.5)).toBe('$3.50');
    });
    test('pound', () => {
        expect(format('£,.2f')(1000)).toBe('£1,000.00');
    });
    test('space-filled and signed', () => {
        expect(format('+20')(42)).toBe('                 +42');
        expect(format('(')(-42)).toBe('(42)');
    });
    test('dot-filled and centered', () => {
        expect(format('.^20')(42)).toBe('.........42.........');
        expect(format('.^21')(42)).toBe('..........42.........');
    });
    test('prefixed lowercase hexadecimal', () => {
        expect(format('#x')(48879)).toBe('0xbeef');
    });
    test('grouped thousands with fixed point', () => {
        expect(format(',.5f')(123456789.987654321)).toBe('123,456,789.98765');
    });
    test('number of significant digits', () => {
        expect(format(',.3r')(0.077)).toBe('0.0770');
        expect(format(',.3r')(0.07777)).toBe('0.0778');
        expect(format(',.3r')(0.77777)).toBe('0.778');
        expect(format(',.3r')(7.7777)).toBe('7.78');
        expect(format(',.3r')(77.777)).toBe('77.8');
        expect(format(',.3r')(777.77)).toBe('778');
        expect(format(',.3r')(7777.7)).toBe('7,780');
        expect(format(',.3r')(77777)).toBe('77,800');
    });
    test('grouped thousands', () => {
        expect(format(',d')(1)).toBe('1');
        expect(format(',d')(12)).toBe('12');
        expect(format(',d')(123)).toBe('123');
        expect(format(',d')(1234)).toBe('1,234');
        expect(format(',d')(12345)).toBe('12,345');
        expect(format(',d')(123456)).toBe('123,456');
        expect(format(',d')(1234567)).toBe('1,234,567');
        expect(format(',d')(12345678)).toBe('12,345,678');
        expect(format(',d')(-1)).toBe('\u22121');
        expect(format(',d')(-12)).toBe('\u221212');
        expect(format(',d')(-123)).toBe('\u2212123');
        expect(format(',d')(-1234)).toBe('\u22121,234');
        expect(format(',d')(-12345)).toBe('\u221212,345');
        expect(format(',d')(-123456)).toBe('\u2212123,456');
        expect(format(',d')(-1234567)).toBe('\u22121,234,567');
        expect(format(',d')(-12345678)).toBe('\u221212,345,678');
    });
    test('grouped thousands and parenthesis for negative values', () => {
        expect(format('(,d')(1)).toBe('1');
        expect(format('(,d')(12)).toBe('12');
        expect(format('(,d')(123)).toBe('123');
        expect(format('(,d')(1234)).toBe('1,234');
        expect(format('(,d')(12345)).toBe('12,345');
        expect(format('(,d')(123456)).toBe('123,456');
        expect(format('(,d')(1234567)).toBe('1,234,567');
        expect(format('(,d')(12345678)).toBe('12,345,678');
        expect(format('(,d')(-1)).toBe('(1)');
        expect(format('(,d')(-12)).toBe('(12)');
        expect(format('(,d')(-123)).toBe('(123)');
        expect(format('(,d')(-1234)).toBe('(1,234)');
        expect(format('(,d')(-12345)).toBe('(12,345)');
        expect(format('(,d')(-123456)).toBe('(123,456)');
        expect(format('(,d')(-1234567)).toBe('(1,234,567)');
        expect(format('(,d')(-12345678)).toBe('(12,345,678)');
    });
    test('grouped thousands with two significant digits', () => {
        expect(format(',.2r')(4223)).toBe('4,200');
    });
    test('general format', () => {
        expect(format('.1g')(0.049)).toBe('0.05');
        expect(format('.1g')(0.49)).toBe('0.5');
        expect(format('.2g')(0.449)).toBe('0.45');
        expect(format('.3g')(0.4449)).toBe('0.445');
        expect(format('.5g')(0.444449)).toBe('0.44445');
        expect(format('.1g')(100)).toBe('1e+2');
        expect(format('.2g')(100)).toBe('1.0e+2');
        expect(format('.3g')(100)).toBe('100');
        expect(format('.5g')(100)).toBe('100.00');
        expect(format('.5g')(100.2)).toBe('100.20');
        expect(format('.2g')(0.002)).toBe('0.0020');
    });
    test('empty type is a shorthand for ~g', () => {
        expect(format('.2')(42)).toBe('42');
        expect(format('.2')(4.2)).toBe('4.2');
        expect(format('.1')(42)).toBe('4e+1');
        expect(format('.1')(4.2)).toBe('4');
    });
    test('SI-prefix', () => {
        const f = format('.3s');
        expect(f(43e6)).toBe('43.0M');
        expect(format('s')(1500)).toMatch('1.50000k');
        // using '-' will make the test fail because it has a different char code
        expect(format('s')(-1500)).toMatch('\u22121.50000k');
        expect(format('.5s')(12345678)).toBe('12.346M');
        expect(format('.5s')(0.0123)).toBe('12.300m');
        expect(format('.5s')(0.01234567)).toBe('12.346m');
        expect(format('.2s')(0.0034)).toBe('3.4m');
    });
    test('trim insignificant trailing zeros across format types', () => {
        expect(format('~s')(1500)).toBe('1.5k');
        expect(format('~s')(-1500)).toBe('\u22121.5k');
    });
    test('no type specified', () => {
        expect(format(' ')(0.1234567890123456)).toBe('0.123456789012');
    });
    test('padding with prefix and suffix', () => {
        expect(format('🌧️ #{0>2.0f} °C')(4)).toBe('🌧️ 04 °C');
        expect(format('🌧️ #{0>2.0f} °C')(12)).toBe('🌧️ 12 °C');
    });
    test('scale.tickFormat', () => {
        {
            const scale = new LinearScale();
            scale.domain = [-50000000, 50000000];
            const f = scale.tickFormat({ specifier: '~s' });
            expect(f(43000000)).toBe('43M');
        }
        {
            const scale = new LinearScale();
            scale.domain = [-50000000, 50000000];
            const f = scale.tickFormat({ specifier: '~s' });
            expect(f(43500000)).toBe('44M');
        }
        {
            const scale = new LinearScale();
            scale.domain = [35000000, 44000000];
            const f = scale.tickFormat({ specifier: '~s' });
            const expectedTicks = ['36M', '38M', '40M', '42M', '44M'];
            scale.ticks().forEach((t, i) => expect(f(t)).toBe(expectedTicks[i]));
        }
        {
            const scale = new LinearScale();
            scale.domain = [3500000, 4400000];
            const f = scale.tickFormat({ specifier: '~s' });
            const expectedTicks = ['3.6M', '3.8M', '4M', '4.2M', '4.4M'];
            scale.ticks().forEach((t, i) => expect(f(t)).toBe(expectedTicks[i]));
        }
        {
            const scale = new LinearScale();
            scale.domain = [0.0034, 0.0044];
            const f = scale.tickFormat({ specifier: '~s' });
            const expectedTicks = ['3.4m', '3.6m', '3.8m', '4m', '4.2m', '4.4m'];
            scale.ticks().forEach((t, i) => expect(f(t)).toBe(expectedTicks[i]));
        }
        {
            const scale = new LinearScale();
            scale.domain = [0.0034, 0.0044];
            const f = scale.tickFormat({ specifier: 'f' });
            const expectedTicks = ['0.0034', '0.0036', '0.0038', '0.0040', '0.0042', '0.0044'];
            scale.ticks().forEach((t, i) => expect(f(t)).toBe(expectedTicks[i]));
        }
        {
            const scale = new LinearScale();
            scale.domain = [34, 44];
            const f = scale.tickFormat({ specifier: 'f' });
            const expectedTicks = ['34', '36', '38', '40', '42', '44'];
            scale.ticks().forEach((t, i) => expect(f(t)).toBe(expectedTicks[i]));
        }
        {
            const scale = new LinearScale();
            scale.domain = [35, 36];
            const f = scale.tickFormat({ specifier: 'f' });
            const expectedTicks = ['35.0', '35.2', '35.4', '35.6', '35.8', '36.0'];
            scale.ticks().forEach((t, i) => expect(f(t)).toBe(expectedTicks[i]));
        }

        const singlePointFormat = (n: number, specifier: string) => {
            const scale = new LinearScale();
            const pad = Math.abs(n) * 0.01;
            scale.domain = [n - pad, n + pad];
            const format = scale.tickFormat({ specifier, ticks: [n] });
            return format(n);
        };

        expect(singlePointFormat(0.1234567890123456, ' ')).toEqual('0.123456789012');
        expect(singlePointFormat(67.7, 'd')).toEqual('68');
        expect(singlePointFormat(0.678, '.2p')).toEqual('68%');
        expect(singlePointFormat(123, 'f')).toEqual('123');
        expect(singlePointFormat(0.001234567890123456, 'f')).toEqual('0.00123457');
        expect(singlePointFormat(0.1234567890123456, 'f')).toEqual('0.123457');
        expect(singlePointFormat(1.234567890123, 'f')).toEqual('1.23457');
        expect(singlePointFormat(123.4567890123, 'f')).toEqual('123.457');
        expect(singlePointFormat(12345.67890123, 'f')).toEqual('12345.7');
        expect(singlePointFormat(1234567.890123, 'f')).toEqual('1234568');
        expect(singlePointFormat(1234.567890123, 'f')).toEqual('1234.57');
        expect(singlePointFormat(1234.567890123, ' ')).toEqual('1234.56789012');
    });
});
