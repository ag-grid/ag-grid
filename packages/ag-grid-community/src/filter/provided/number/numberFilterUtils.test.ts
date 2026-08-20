import { stringToFloat } from './numberFilterUtils';

// A `number` input keeps scientific notation as the text the user typed — `1e3` is a valid floating-point
// number to the HTML parser — so what reads an input back has to read that notation too. The behavioural
// suite cannot cover it: happy-dom reports such an input as invalid, where every supported browser does not.
describe('stringToFloat', () => {
    test.each([
        ['1e3', 1000],
        ['1E3', 1000],
        ['1.5e-3', 0.0015],
        ['-2.5e2', -250],
    ])('reads scientific notation %s as %s', (text, expected) => {
        expect(stringToFloat(undefined, text)).toBe(expected);
    });

    test.each([
        ['a plain integer', '42', 42],
        ['a negative decimal', '-2.5', -2.5],
        ['blank', '   ', null],
        ['empty', '', null],
        ['a lone minus, which is a number half-typed', '-', null],
        ['a padded lone minus', '  -  ', null],
        ['a padded number, which parses as the number', ' 5 ', 5],
        ['absent', null, null],
    ])('reads %s as %s', (_name, text, expected) => {
        expect(stringToFloat(undefined, text)).toBe(expected);
    });

    test.each([
        ['a number', 1000, 1000],
        ['zero, which is a value and not a blank', 0, 0],
    ])('takes %s as already read', (_name, value, expected) => {
        expect(stringToFloat(undefined, value)).toBe(expected);
        // A parser reads text; there is none to read when the value already is a number.
        expect(stringToFloat(() => 42, value)).toBe(expected);
    });

    test('a numberParser owns the reading wherever one is configured', () => {
        const parser = (text: string | null) => (text === 'one thousand' ? 1000 : null);
        expect(stringToFloat(parser, 'one thousand')).toBe(1000);
        // Blank reaches the parser as null rather than as text it never has to recognise.
        expect(stringToFloat(parser, '  ')).toBe(null);
        // The default reading does not apply underneath a parser that rejected the text.
        expect(stringToFloat(parser, '1e3')).toBe(null);
    });

    test('a numberParser is handed the text as typed, whitespace included', () => {
        const seen: (string | null)[] = [];
        const parser = (text: string | null) => {
            seen.push(text);
            return null;
        };
        stringToFloat(parser, ' 5 ');
        stringToFloat(parser, '  ');
        expect(seen).toEqual([' 5 ', null]);
    });
});
