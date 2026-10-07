import type { CalculatedExpressionError, ColDef, UserColumnPropertyKey } from 'ag-grid-community';
import { _DATA_TYPE_DERIVED_COL_DEF_PROPERTIES } from 'ag-grid-community';

/** The definition properties and validation state persisted by the Calculated Column dialog. Only these
 *  are recorded in the user-column layer: the rest is derived on build (`editable`,
 *  `suppressPaste`, the data-type properties), or owned by another grid state section (width, sort, …). */
export const USER_OWNED_PROPERTIES: readonly UserColumnPropertyKey[] = [
    'headerName',
    'cellDataType',
    'calculatedExpression',
    'calculatedExpressionError',
    'columnGroupShow',
];

/** Projects a calc col's definition onto the properties a user configured, for persisting in grid state.
 *  `undefined` values are kept: they record a property the user cleared. */
export function pickUserOwnedProperties(colDef: ColDef): ColDef {
    const result: ColDef = {};
    for (let i = 0, len = USER_OWNED_PROPERTIES.length; i < len; ++i) {
        const property = USER_OWNED_PROPERTIES[i];
        if (property in colDef) {
            (result as Record<string, any>)[property] = colDef[property];
        }
    }
    return result;
}

/** The definition's saved expression error, unless the expression has since changed through another path. */
export function getCalculatedExpressionError(colDef: ColDef): CalculatedExpressionError | undefined {
    const error = colDef.calculatedExpressionError;
    return error && error.expression === colDef.calculatedExpression ? error : undefined;
}

/** The user-facing message for a blocked reference, shared by the dialog and the cell's formula error. */
export function getRestrictedReferenceMessage(
    translate: (key: string, defaultValue: string, variableValues?: string[]) => string,
    reference: string
): string {
    return translate(
        'calculatedColumnExpressionRestrictedReference',
        'Column "${variable}" cannot be used in this expression.',
        [reference]
    ).replace('${variable}', reference);
}

/** A calculated expression as a formula string, tolerating an existing leading `=` like evaluation does. */
export function toFormulaString(expression: string): string {
    const trimmed = expression.trim();
    return trimmed.startsWith('=') ? trimmed : `=${trimmed}`;
}

/**
 * When `cellDataType` changes on a calculated column (e.g. via the Edit dialog moving Boolean →
 * Number), the data-type service does not re-resolve properties it implicitly set for the old
 * type (cellRenderer, valueFormatter, etc.) — they remain on the resolved colDef and leak the
 * previous type's behaviour. This strips those properties from the base before the user's update
 * merges in, but only when the user did not provide them explicitly on the original colDef.
 *
 * @param colDef The current resolved colDef on the AgColumn.
 * @param userColDef The original user-provided colDef (preserves explicit overrides).
 * @param colDefUpdate The incoming patch — only acts when its `cellDataType` differs.
 */
export function clearStaleDataTypeProperties(colDef: ColDef, userColDef: ColDef | null, colDefUpdate: ColDef): ColDef {
    if (colDefUpdate.cellDataType === undefined || colDefUpdate.cellDataType === colDef.cellDataType) {
        return colDef;
    }

    const nextColDef = { ...colDef };
    for (const property of _DATA_TYPE_DERIVED_COL_DEF_PROPERTIES) {
        if (colDefUpdate[property] === undefined && userColDef?.[property] === undefined) {
            delete nextColDef[property];
        }
    }
    return nextColDef;
}

/**
 * Visits every `[ref]` bracket reference in a calculated-column expression and produces a new
 * expression with each reference replaced by the callback's return value. String-literal
 * boundaries (`"..."`) are respected, including the SQL-style `""` escape — brackets inside a
 * string literal are left untouched.
 *
 * Callers can return undefined to preserve the original token, including any escaped brackets.
 *
 * Must stay in sync with the parser's `isInsideStringLiteral` semantics in
 * `formula/ast/parsers.ts`.
 *
 * @param expression The expression to scan, typically the raw `calculatedExpression` value.
 * @param replaceReference Receives each bracketed reference (without the brackets); the return
 *   value replaces the bracketed token in the output expression, or undefined leaves it unchanged.
 * @param escapedReferences Whether dialog references escape a closing bracket as `]]`.
 * @returns The expression with each reference replaced; returns the input verbatim when no
 *   bracket references are present.
 */
export function replaceBracketReferences(
    expression: string,
    replaceReference: (reference: string, start: number, end: number) => string | undefined,
    escapedReferences = false
): string {
    let inString = false;
    let result = '';
    let lastIndex = 0;
    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];
        if (char === '"') {
            if (expression[i + 1] === '"') {
                i++;
            } else {
                inString = !inString;
            }
            continue;
        }
        if (!inString && char === '[') {
            const end = getBracketReferenceEnd(expression, i, escapedReferences);
            if (end === -1) {
                continue;
            }
            result += expression.slice(lastIndex, i);
            const reference = expression.slice(i + 1, end);
            result += `[${replaceReference(escapedReferences ? reference.replace(/]]/g, ']') : reference, i, end + 1) ?? reference}]`;
            lastIndex = end + 1;
            i = end;
        }
    }
    return result + expression.slice(lastIndex);
}

export function escapeDisplayReference(reference: string): string {
    return reference.replace(/]/g, ']]');
}

function getBracketReferenceEnd(expression: string, start: number, escapedReferences: boolean): number {
    for (let i = start + 1; i < expression.length; ++i) {
        if (expression[i] !== ']') {
            continue;
        }
        if (escapedReferences && expression[i + 1] === ']') {
            ++i;
        } else {
            return i;
        }
    }
    return -1;
}

export function getDisplayReferenceToken(
    expression: string,
    caret: number
): { start: number; end: number; prefix: string } | null {
    let inString = false;
    for (let i = 0; i < caret; ++i) {
        const char = expression[i];
        if (char === '"') {
            if (expression[i + 1] === '"') {
                ++i;
            } else {
                inString = !inString;
            }
        } else if (!inString && char === '[') {
            const end = getBracketReferenceEnd(expression, i, true);
            if (end === -1 || caret <= end) {
                return {
                    start: i,
                    end: end === -1 ? caret : end + 1,
                    prefix: expression.slice(i + 1, caret).replace(/]]/g, ']'),
                };
            }
            i = end;
        }
    }
    return null;
}

export function getOperatorReplacementRange(
    expression: string,
    selectionStart: number,
    selectionEnd: number,
    operators: readonly string[]
): { start: number; end: number } {
    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);

    if (start !== end) {
        if (isOperator(expression.slice(start, end).trim(), operators)) {
            return expandWhitespace(expression, start, end);
        }
        return { start, end };
    }

    if (isInsideStringLiteral(expression, start) || getDisplayReferenceToken(expression, start) !== null) {
        return { start, end };
    }

    const token = findOperatorTokenNearCaret(expression, start, operators);
    if (!token) {
        return { start, end };
    }

    return expandWhitespace(expression, token.start, token.end);
}

function isOperator(value: string, operators: readonly string[]): boolean {
    for (let i = 0, len = operators.length; i < len; ++i) {
        if (operators[i] === value) {
            return true;
        }
    }
    return false;
}

function findOperatorTokenNearCaret(
    expression: string,
    caret: number,
    operators: readonly string[]
): { start: number; end: number } | null {
    const direct = getOperatorTokenContainingPosition(expression, caret, operators);
    if (direct) {
        return direct;
    }

    const previous = getPreviousNonSpaceIndex(expression, caret);
    if (previous != null) {
        const previousToken = getOperatorTokenContainingPosition(expression, previous, operators);
        if (previousToken) {
            return previousToken;
        }
    }

    const next = getNextNonSpaceIndex(expression, caret);
    if (next != null) {
        return getOperatorTokenContainingPosition(expression, next, operators);
    }

    return null;
}

function getOperatorTokenContainingPosition(
    expression: string,
    position: number,
    operators: readonly string[]
): { start: number; end: number } | null {
    for (let i = 0, len = operators.length; i < len; ++i) {
        const operator = operators[i];
        for (let offset = 0, operatorLen = operator.length; offset < operatorLen; ++offset) {
            const start = position - offset;
            if (start >= 0 && expression.startsWith(operator, start)) {
                return { start, end: start + operatorLen };
            }
        }
    }

    return null;
}

function expandWhitespace(expression: string, start: number, end: number): { start: number; end: number } {
    while (start > 0 && expression[start - 1].trim() === '') {
        start--;
    }
    while (end < expression.length && expression[end].trim() === '') {
        end++;
    }
    return { start, end };
}

function getPreviousNonSpaceIndex(expression: string, offset: number): number | null {
    for (let i = offset - 1; i >= 0; --i) {
        if (expression[i].trim() !== '') {
            return i;
        }
    }
    return null;
}

function getNextNonSpaceIndex(expression: string, offset: number): number | null {
    for (let i = offset, len = expression.length; i < len; ++i) {
        if (expression[i].trim() !== '') {
            return i;
        }
    }
    return null;
}

export function isInsideStringLiteral(expression: string, offset: number): boolean {
    let inString = false;
    for (let i = 0; i < offset && i < expression.length; ++i) {
        if (expression[i] !== '"') {
            continue;
        }

        if (expression[i + 1] === '"') {
            i++;
            continue;
        }

        inString = !inString;
    }
    return inString;
}
