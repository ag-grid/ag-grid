import { criteriaToPredicate } from './utils';

/** The regular-expression implementation wildcard criteria used before; the matcher must agree with it. */
function legacyWildcardRegExp(pattern: string): RegExp {
    let out = '^';
    for (let i = 0; i < pattern.length; i++) {
        const ch = pattern[i];
        if (ch === '~' && i + 1 < pattern.length && (pattern[i + 1] === '*' || pattern[i + 1] === '?')) {
            out += '\\' + pattern[++i];
            continue;
        }
        if (ch === '*') {
            out += '.*';
            continue;
        }
        if (ch === '?') {
            out += '.';
            continue;
        }
        out += /[-/\\^$*+?.()|[\]{}]/.test(ch) ? '\\' + ch : ch;
    }
    return new RegExp(out + '$', 'i');
}

const PATTERNS = [
    '*',
    '?',
    '**',
    'ap*',
    'ap?',
    '*le',
    '*p*e*',
    'a?p*e',
    'a~*b',
    'a~?b',
    'a~b',
    'a~~b',
    '~',
    '*~',
    '~*?',
    '*.txt',
    'a.b*',
    '(x)*',
    '[a]?',
    '^a$*',
    'A*B',
    '*SS*',
    'stra?e',
    'k*',
    'a*\nb',
];

const CELLS: unknown[] = [
    '',
    'a',
    'ap',
    'app',
    'apple',
    'APPLE',
    'pineapple',
    'a*b',
    'a?b',
    'aXb',
    'a~b',
    'a~~b',
    '~',
    'a\nb',
    'a\r\nb',
    'a\u2028b',
    'report.TXT',
    'aXb.c',
    '(x)yz',
    '[a]b',
    '^a$!',
    'abb',
    'straße',
    'STRASSE',
    '\u212Aelvin',
    'kelvin',
    12,
    true,
    null,
    undefined,
];

describe('criteriaToPredicate wildcard criteria', () => {
    describe.each(['', '=', '<>'])('operator "%s"', (op) => {
        test.each(PATTERNS)('pattern %j matches the same cells as before', (pattern) => {
            const predicate = criteriaToPredicate(op + pattern);
            const legacy = legacyWildcardRegExp(pattern);
            for (const cell of CELLS) {
                const text = cell == null ? '' : typeof cell === 'boolean' ? (cell ? 'TRUE' : 'FALSE') : String(cell);
                const expected = op === '<>' ? !legacy.test(text) : legacy.test(text);
                expect({ cell, matches: predicate(cell) }).toEqual({ cell, matches: expected });
            }
        });
    });

    test('long non-matching text with many wildcards is evaluated quickly', () => {
        const predicate = criteriaToPredicate('*a*a*a*a*a*a*a*a*a*ab');
        const text = 'a'.repeat(1000);

        const start = performance.now();
        expect(predicate(text)).toBe(false);
        expect(performance.now() - start).toBeLessThan(50);
    });
});
