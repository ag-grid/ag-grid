import { _isFiniteNumber } from 'ag-grid-community';
import type { BeanCollection, FormulaParam, RangeParam, ValueParam } from 'ag-grid-community';

import { colIdFromIndex, colIndexFromId, rowIdFromIndex, rowIndexFromId } from '../ast/serializer';
import type { Cell, CellRef, FormulaNode } from '../ast/utils';
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
            throw new FormulaError(35, [name, n]);
        }
        out[i] = step.value;
    }
    // ensure there aren't extras
    if (!it.next().done) {
        throw new FormulaError(35, [name, n]);
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
            throw new FormulaError(36, [name, max]);
        }
    }
    if (out.length < min) {
        throw new FormulaError(37, [name, min]);
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
    if (_isFiniteNumber(x)) {
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

const WILDCARD_ANY_RUN = 0; // `*`
const WILDCARD_ANY_ONE = 1; // `?`

/** A compiled wildcard pattern: a literal character (already case-folded) or one of the wildcard tokens. */
type WildcardToken = string | typeof WILDCARD_ANY_RUN | typeof WILDCARD_ANY_ONE;

/** Wildcards never match a line terminator, as `.` doesn't in a non-`s` regular expression. */
const isLineTerminator = (ch: string): boolean => ch === '\n' || ch === '\r' || ch === '\u2028' || ch === '\u2029';

/**
 * Case folding of a case-insensitive, non-unicode regular expression (ECMAScript `Canonicalize`): a character whose
 * upper case is several characters (`ß`) or an ASCII one (`ı`) folds to itself.
 */
function foldCase(ch: string): string {
    const code = ch.charCodeAt(0);
    if (code < 128) {
        // OPTIMIZATION: skip toUpperCase for ASCII, which halves typical matching time
        return code >= 97 && code <= 122 ? String.fromCharCode(code - 32) : ch;
    }
    const upper = ch.toUpperCase();
    return upper.length === 1 && upper.charCodeAt(0) >= 128 ? upper : ch;
}

/**
 * `*` matches any run of characters and `?` any single one. `~*` and `~?` match those characters literally; any
 * other `~` is an ordinary character.
 */
function compileWildcard(pattern: string): WildcardToken[] {
    const tokens: WildcardToken[] = [];
    for (let i = 0, len = pattern.length; i < len; ++i) {
        const ch = pattern[i];
        const next = pattern[i + 1];
        if (ch === '~' && (next === '*' || next === '?')) {
            tokens.push(next);
            ++i;
        } else if (ch === '*') {
            // consecutive `*` are equivalent to one
            if (tokens[tokens.length - 1] !== WILDCARD_ANY_RUN) {
                tokens.push(WILDCARD_ANY_RUN);
            }
        } else if (ch === '?') {
            tokens.push(WILDCARD_ANY_ONE);
        } else {
            tokens.push(foldCase(ch));
        }
    }
    return tokens;
}

function matchesChar(token: string | typeof WILDCARD_ANY_ONE, ch: string): boolean {
    return token === WILDCARD_ANY_ONE ? !isLineTerminator(ch) : token === foldCase(ch);
}

/**
 * Case-insensitive, whole-string match in O(text × pattern) time. On a mismatch only the most recent `*` is widened:
 * every earlier segment matched at its earliest position, so widening an earlier `*` cannot find a match this misses.
 */
function matchesWildcard(tokens: WildcardToken[], text: string): boolean {
    const textLength = text.length;
    const tokenCount = tokens.length;
    let textPos = 0;
    let tokenPos = 0;
    // the most recent `*` token, and the end of the text it has absorbed so far
    let starTokenPos = -1;
    let starTextEnd = 0;
    while (textPos < textLength) {
        const token = tokenPos < tokenCount ? tokens[tokenPos] : undefined;
        if (token === WILDCARD_ANY_RUN) {
            starTokenPos = tokenPos;
            starTextEnd = textPos;
            tokenPos++;
        } else if (token !== undefined && matchesChar(token, text[textPos])) {
            tokenPos++;
            textPos++;
        } else if (starTokenPos >= 0 && !isLineTerminator(text[starTextEnd])) {
            // widen the `*` by one character (never a line terminator) and retry the tokens after it
            starTextEnd++;
            textPos = starTextEnd;
            tokenPos = starTokenPos + 1;
        } else {
            return false;
        }
    }
    // the text is used up, so the match succeeds only if every remaining token is a `*` matching nothing
    while (tokenPos < tokenCount && tokens[tokenPos] === WILDCARD_ANY_RUN) {
        tokenPos++;
    }
    return tokenPos === tokenCount;
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

const WILDCARD_COMPARE_VALUES = (op: '=' | '<>', tokens: WildcardToken[], cell: unknown) => {
    const match = matchesWildcard(tokens, toText(cell));
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
        throw new FormulaError(38);
    }
    return WILDCARD_COMPARE_VALUES.bind(null, symbol ?? '=', compileWildcard(query));
}

const shiftColRef = (beans: BeanCollection, delta: number, ref?: CellRef) => {
    if (!ref || delta === 0 || ref.absolute) {
        return;
    }

    const { visibleCols, colModel } = beans;

    const cols = visibleCols.allCols;

    const i0 = colIndexFromId(colModel, cols, ref.id); // 0-based
    if (i0 == null) {
        return;
    }

    const j0 = i0 + delta;
    if (j0 < 0) {
        return;
    }

    const nextId = colIdFromIndex(cols, j0);
    if (nextId) {
        ref.id = nextId;
    }
};

const shiftRowRef = (beans: BeanCollection, rowDelta: number, ref?: CellRef, unsafe?: boolean) => {
    if (!ref || rowDelta === 0 || ref.absolute) {
        return;
    }

    if (unsafe) {
        const numericId = Number(ref.id);
        if (!Number.isFinite(numericId)) {
            return;
        }
        ref.id = String(numericId + rowDelta);
        return;
    }

    const idx1 = rowIndexFromId(beans, ref.id); // 1-based
    if (idx1 == null) {
        return;
    }

    const next1 = idx1 + rowDelta;
    if (next1 < 1) {
        return;
    }

    const nextId = rowIdFromIndex(beans, next1);
    if (nextId) {
        ref.id = nextId;
    }
};

const isCellOperand = (
    value: string | number | boolean | Cell | null
): value is { column: CellRef; row: CellRef; endColumn?: CellRef; endRow?: CellRef } => {
    return (
        !!value && typeof value === 'object' && value !== null && 'row' in (value as any) && 'column' in (value as any)
    );
};

// Traverse the AST and apply shifts to any cell references
export const shiftNode = (
    beans: BeanCollection,
    node: FormulaNode,
    rowDelta: number,
    columnDelta: number,
    unsafe: boolean
): void => {
    if (node.type === 'operand') {
        const { value } = node;
        if (!isCellOperand(value)) {
            return;
        }

        const { row, column, endRow, endColumn } = value;

        // Shift the primary row and column
        shiftRowRef(beans, rowDelta, row, unsafe);
        shiftColRef(beans, columnDelta, column);

        // Shift the range end, if present
        shiftRowRef(beans, rowDelta, endRow, unsafe);
        shiftColRef(beans, columnDelta, endColumn);

        return;
    }

    if (node.type === 'operation') {
        for (const child of node.operands) {
            shiftNode(beans, child, rowDelta, columnDelta, unsafe);
        }
    }
};
