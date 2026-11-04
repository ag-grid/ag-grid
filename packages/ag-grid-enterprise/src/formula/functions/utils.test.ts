import { criteriaToPredicate } from './utils';

/** Regular-expression reference for wildcard criteria semantics; the matcher must agree with it. */
function referenceRegExp(pattern: string): RegExp {
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

function cellText(cell: unknown): string {
    if (cell == null) {
        return '';
    }
    if (typeof cell === 'boolean') {
        return cell ? 'TRUE' : 'FALSE';
    }
    return String(cell);
}

/** Deterministic PRNG (mulberry32), so a failing generated case reproduces. */
function seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const PATTERNS = [
    '*',
    '?',
    '**',
    'ap*',
    'ap?',
    '*le',
    '*p*e*',
    'a*p*e',
    'a?p*e',
    'a~*b',
    'a~?b',
    'a~b*',
    'a~~b*',
    '~a?',
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
    'a b',
    'report.TXT',
    'aXb.c',
    '(x)yz',
    '[a]b',
    '^a$!',
    'abb',
    'straße',
    'STRASSE',
    'Kelvin',
    'kelvin',
    12,
    true,
    null,
    undefined,
];

describe('criteriaToPredicate wildcard criteria', () => {
    describe.each(['', '=', '<>'])('operator "%s"', (op) => {
        test.each(PATTERNS)('pattern %j matches the same cells as the regular expression', (pattern) => {
            const predicate = criteriaToPredicate(op + pattern);
            const reference = referenceRegExp(pattern);
            for (const cell of CELLS) {
                const matches = reference.test(cellText(cell));
                expect({ cell, matches: predicate(cell) }).toEqual({ cell, matches: op === '<>' ? !matches : matches });
            }
        });
    });

    test('generated patterns match the same text as the regular expression', () => {
        const patternChars = ['*', '*', '?', '~', 'a', 'A', 'b', '\n', 'ß', 'k'];
        const textChars = ['a', 'A', 'b', '\n', '\r', 'ß', 'S', 'K', 'K', '*', '?', '~'];
        const random = seededRandom(1);
        const generate = (chars: string[], maxLength: number) => {
            let out = '';
            for (let i = Math.floor(random() * (maxLength + 1)); i > 0; i--) {
                out += chars[Math.floor(random() * chars.length)];
            }
            return out;
        };

        const mismatches: { pattern: string; text: string }[] = [];
        for (let i = 0; i < 5000; i++) {
            // always include a wildcard, so the criteria takes the wildcard path rather than plain equality
            const body = generate(patternChars, 7);
            const at = Math.floor(random() * (body.length + 1));
            const pattern = body.slice(0, at) + (random() < 0.5 ? '*' : '?') + body.slice(at);
            const text = generate(textChars, 8);
            // criteria are trimmed before matching
            if (criteriaToPredicate(pattern)(text) !== referenceRegExp(pattern.trim()).test(text)) {
                mismatches.push({ pattern, text });
            }
        }
        expect(mismatches).toEqual([]);
    });

    test('many wildcards against a near-miss text are evaluated quickly', () => {
        const predicate = criteriaToPredicate('*a*a*a*a*a*a*a*c*b');
        const text = 'a'.repeat(44) + 'b';

        const start = performance.now();
        expect(predicate(text)).toBe(false);
        expect(performance.now() - start).toBeLessThan(250);
    });
});
