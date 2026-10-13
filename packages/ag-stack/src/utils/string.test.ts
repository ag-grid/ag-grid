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

    it('splits generated inputs exactly as the regexes it replaces', () => {
        // Seeded so that a failing input reproduces.
        let seed = 1;
        const random = () => {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            return seed / 4294967296;
        };
        const alphabet = ['[', ']', 'a', '$', '\n', '\u2028'];

        for (let i = 0; i < 5000; ++i) {
            let input = '';
            for (let j = 0, len = Math.floor(random() * 12); j < len; ++j) {
                input += alphabet[Math.floor(random() * alphabet.length)];
            }

            // eslint-disable-next-line sonarjs/super-linear-regex -- the reference the scanner must match
            expect(_splitBracketed(input)).toEqual(input.split(/(\[[^\]]*\])/));
            // eslint-disable-next-line sonarjs/super-linear-regex -- the reference the scanner must match
            expect(_splitBracketed(input, true)).toEqual(input.split(/(\[.*?\])/));
        }
    });
});
