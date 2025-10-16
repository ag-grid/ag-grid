import type { FormulaParam, RangeParam, ValueParam } from 'ag-grid-community';

import { FormulaError } from '../ast/utils';

export function take<T>(values: Iterable<T>, name: string, n: 1): [T];
export function take<T>(values: Iterable<T>, name: string, n: 2): [T, T];
export function take<T>(values: Iterable<T>, name: string, n: 3): [T, T, T];
export function take<T>(values: Iterable<T>, name: string, n: number): T[] {
    const it = values[Symbol.iterator]();
    const out: T[] = new Array(n);
    for (let i = 0; i < n; i++) {
        const step = it.next();
        if (step.done) {
            throw new FormulaError(`${name}: expected exactly ${n} arguments`);
        }
        out[i] = step.value;
    }
    // ensure there aren't extras
    if (!it.next().done) {
        throw new FormulaError(`${name}: expected exactly ${n} arguments`);
    }
    return out;
}

export function iterableWithoutBlanks<T>(values: Iterable<T>): Iterable<T> {
    return {
        *[Symbol.iterator]() {
            for (const v of values) {
                if (v != null && v !== '') {
                    yield v;
                }
            }
        },
    };
}

export function takeBetween<T>(values: Iterable<T>, name: string, min: number, max: number): T[] {
    const out: T[] = [];
    for (const v of values) {
        out.push(v);

        if (out.length > max) {
            throw new FormulaError(`${name}: expected at most ${max} arguments`);
        }
    }
    if (out.length < min) {
        throw new FormulaError(`${name}: expected at least ${min} arguments`);
    }
    return out;
}

export const isRangeParam = (p: FormulaParam): p is RangeParam => {
    return p.kind === 'range';
};

export const isValueParam = (p: FormulaParam): p is ValueParam => {
    return p.kind === 'value';
};

/**
 * Wildcard parser/builder for COUNTIF/SUMIF
 */

// Ordered to match longest first
const OPERATOR_TOKENS = ['<=', '>=', '<>', '<', '>', '='] as const;
type OperatorSymbol = (typeof OPERATOR_TOKENS)[number];

function findOperatorSymbol(s: string): OperatorSymbol | null {
    for (const tok of OPERATOR_TOKENS) {
        if (s.startsWith(tok)) {
            return tok;
        }
    }
    return null;
}

function toNumberLike(x: unknown): number | null {
    if (typeof x === 'number' && Number.isFinite(x)) {
        return x;
    }
    if (x instanceof Date) {
        return +x;
    }
    if (typeof x === 'string') {
        const num = Number(x);
        if (!Number.isNaN(num)) {
            return num;
        }
    }
    return null;
}

function toText(x: unknown): string {
    if (x == null) {
        return '';
    }
    switch (typeof x) {
        case 'string':
            return x;
        case 'number':
            return String(x);
        case 'boolean':
            return x ? 'TRUE' : 'FALSE';
    }
    if (x instanceof Date) {
        return String(+x);
    }
    return String(x);
}

function wildcardToRegExp(pattern: string): RegExp {
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
        if (/[-/\\^$*+?.()|[\]{}]/.test(ch)) {
            out += '\\' + ch;
        } else {
            out += ch;
        }
    }
    out += '$';
    return new RegExp(out, 'i'); // case-insensitive
}

const COMPARE_VALUES = (op: OperatorSymbol, query: string, cell: unknown) => {
    let queryVal: string | number | null = toNumberLike(query);
    let cellVal: string | number | null = toNumberLike(cell);

    if (queryVal == null || cellVal == null) {
        queryVal = query;
        cellVal = toText(cell).toUpperCase();
    }

    switch (op) {
        case '<':
            return cellVal < queryVal;
        case '>':
            return cellVal > queryVal;
        case '<=':
            return cellVal <= queryVal;
        case '>=':
            return cellVal >= queryVal;
        case '=':
            return cellVal === queryVal;
        case '<>':
            return cellVal !== queryVal;
    }
    return false;
};

const REGEX_COMPARE_VALUES = (op: '=' | '<>', rx: RegExp, cell: unknown) => {
    const text = toText(cell); // assumes regexp /i/
    const match = rx.test(text);
    return op === '=' ? match : !match;
};

const EMPTY_PREDICATE = (cell: unknown) => cell == null || cell === '';

/** Excel-like predicate for COUNTIF/SUMIF */
export function criteriaToPredicate(criteria: unknown): (cell: unknown) => boolean {
    if (typeof criteria === 'number') {
        return (cell: unknown) => toNumberLike(cell) === criteria;
    }
    // objects, booleans, dates (dates need more thought)
    if (typeof criteria !== 'string') {
        return (cell: unknown) => criteria === cell;
    }

    const trimmed = criteria.trim();
    if (trimmed === '') {
        return EMPTY_PREDICATE;
    }

    const symbol = findOperatorSymbol(trimmed);
    const query = symbol ? trimmed.substring(symbol.length) : trimmed;
    const wildcard = /[*?]/.test(query);
    if (!wildcard) {
        return COMPARE_VALUES.bind(null, symbol ?? '=', query.toUpperCase());
    }

    if (symbol && symbol !== '=' && symbol !== '<>') {
        throw new FormulaError('Invalid criteria: wildcards with comparator', '#VALUE!');
    }
    const regexp = wildcardToRegExp(query);
    return REGEX_COMPARE_VALUES.bind(null, symbol ?? '=', regexp);
}
