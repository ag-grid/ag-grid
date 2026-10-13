import { _splitBracketed } from './string';

describe('_splitBracketed', () => {
    it.each([
        ['', ['']],
        ['plain', ['plain']],
        ['a[b]c', ['a', '[b]', 'c']],
        ['[red]0.00[$-409]', ['', '[red]', '0.00', '[$-409]', '']],
        ['[a[b]', ['', '[a[b]', '']],
        ['a]b[c', ['a]b[c']],
        ['[x\ny]', ['', '[x\ny]', '']],
    ])('splits %j around each bracketed segment', (input, expected) => {
        expect(_splitBracketed(input)).toEqual(expected);
    });

    it.each([
        ['[x\ny]', ['[x\ny]']],
        ['[x\n[y]', ['[x\n', '[y]', '']],
        ['[x\u2028y][z]', ['[x\u2028y]', '[z]', '']],
    ])('does not let a segment span a line break when asked: %j', (input, expected) => {
        expect(_splitBracketed(input, true)).toEqual(expected);
    });
});
