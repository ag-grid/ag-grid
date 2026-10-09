import { _isExpressionString } from 'ag-stack';

import type { BeanCollection } from 'ag-grid-community';

import type { FormulaErrorId } from '../i18n';
import { isFormulaIdentChar, isFormulaIdentStart, isStandaloneRefToken, parseA1Ref } from '../refUtils';
import { getFormulaRowByIndex } from '../rowAccess';
import type { OperatorDef } from './operators';
import { OP_BY_SYMBOL, OP_SYMBOLS_DESC } from './operators';
import type { Cell, CellRef, FormulaNode, FormulaOperation } from './utils';
import { FormulaError, FormulaParseError, findFirstInvalidOperation } from './utils';

export interface FormulaSourceToken {
    start: number;
    end: number;
    type: 'reference' | 'function' | 'operator' | 'text';
}

interface FormulaExpressionSource {
    tokens: FormulaSourceToken[];
    error?: FormulaParseError;
}

/**
 * Converts a single operand string into a JS primitive or Cell object.
 *
 * @param beans Helpers for looking up rows/columns (used to resolve cell refs).
 * @param operand The raw text of the operand (e.g. `"123"`, `"true"`, `"A1"`).
 * @param unsafe Skip reference validation; 'absolute' also retains A1 positions as absolute references.
 * @returns A JS value (string/number/boolean/null), a Cell object, or undefined if unknown.
 * @throws FormulaParseError if a cell reference is invalid.
 *
 * @example
 *  parseOperand(beans, '"hello"') // => 'hello'
 *  parseOperand(beans, '42')      // => 42
 *  parseOperand(beans, 'A1')      // => { column:{...}, row:{...} }
 */
const parseOperand = (
    beans: BeanCollection,
    operand: string,
    unsafe: boolean | 'absolute'
): string | number | boolean | Cell | null | undefined => {
    const trimmed = operand.trim();

    // string literal
    if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
        return trimmed.slice(1, -1);
    }

    // booleans
    if (trimmed.toLowerCase() === 'true') {
        return true;
    }
    if (trimmed.toLowerCase() === 'false') {
        return false;
    }
    if (trimmed.toLowerCase() === 'null') {
        return null;
    }

    // numbers
    const num = Number(trimmed);
    if (!isNaN(num)) {
        return num;
    }

    if (trimmed.startsWith('[') && trimmed.endsWith(']') && trimmed.length > 2) {
        const columnReference = trimmed.slice(1, -1);
        const column = beans.colModel.getCol(columnReference) ?? null;

        if (!unsafe && !column) {
            throw new FormulaParseError(2, 0, trimmed.length, [trimmed]);
        }

        // Unsafe mode (e.g. paste-time parsing without grid context) stores the raw reference
        // as the AST id — downstream colsById lookups will not resolve it.
        return {
            column: { id: column?.colId ?? columnReference, absolute: false },
            row: { id: '', absolute: false, current: true },
        };
    }

    // cell/range
    // Matches: $A$1, A1, $A1, A$1, $A$1:$B10 etc.
    const parsed = parseA1Ref(trimmed);

    if (parsed) {
        const {
            startCol,
            startRow,
            startColAbsolute,
            startRowAbsolute,
            endCol,
            endRow,
            endColAbsolute,
            endRowAbsolute,
        } = parsed;

        const toCell = (colAbs: boolean, colStr: string, rowAbs: boolean, rowStr: string): Cell => {
            const col = colAbs || unsafe ? colStr.toUpperCase() : beans.formula?.getColByRef(colStr)?.colId;
            const row = rowAbs || unsafe ? rowStr : getFormulaRowByIndex(beans, Number(rowStr) - 1)?.id;

            if (col == null || row == null) {
                throw new FormulaParseError(2, 0, 0, [trimmed]);
            }

            return {
                column: { id: col!, absolute: colAbs || unsafe === 'absolute' },
                row: { id: row!, absolute: rowAbs || unsafe === 'absolute' },
            };
        };

        const start: Cell = toCell(startColAbsolute, startCol, startRowAbsolute, startRow);

        if (endCol && endRow) {
            const end: Cell = toCell(endColAbsolute ?? false, endCol, endRowAbsolute ?? false, endRow);
            start.endColumn = end.column;
            start.endRow = end.row;
        }

        return start;
    }

    return undefined;
};

/**
 * Split the expression string into small tokens (string literal, number, operator, etc.).
 *
 * @param expr The formula body (without the leading '=').
 * @returns An array of tokens such as ["SUM", "(", "A1", ",", "2", ")"].
 * @throws FormulaParseError for bad characters or unterminated strings.
 *
 * @example tokenize('SUM(A1, 2)') // => ["SUM","(","A1",",","2",")"]
 */
function tokenize(expr: string, source?: FormulaExpressionSource): string[] {
    const tokens: string[] = [];
    let i = 0;

    const addToken = (start: number, end: number, type: FormulaSourceToken['type'] = 'text') => {
        tokens.push(expr.slice(start, end));
        source?.tokens.push({ start, end, type });
    };
    const reportError = (error: FormulaParseError) => {
        if (!source) {
            throw error;
        }
        source.error ??= error;
    };
    const isFunctionNameAt = (end: number): boolean => {
        let k = end;
        while (k < expr.length && /\s/.test(expr[k])) {
            k++;
        }
        return expr[k] === '(';
    };

    const lexCellRange = (s: string, start: number): number => {
        let j = start;

        const dollar = () => (s[j] === '$' ? (j++, true) : false);
        const letters = () => {
            const k = j;
            while (j < s.length && /[A-Za-z]/.test(s[j])) {
                j++;
            }
            return j > k;
        };
        const digits = () => {
            const k = j;
            while (j < s.length && /[0-9]/.test(s[j])) {
                j++;
            }
            return j > k;
        };

        // Parse one cell: [$]LETTERS [$]DIGITS
        const parseCell = (): boolean => {
            const j0 = j;
            dollar(); // optional $ before column
            if (!letters()) {
                j = j0;
                return false;
            }
            dollar(); // optional $ before row
            if (!digits()) {
                j = j0;
                return false;
            }
            return true;
        };

        if (!parseCell()) {
            return 0;
        } // not a cell/range here

        // Optional ":<cell>" for a range
        if (s[j] === ':') {
            const colonPos = j;
            j++; // consume ':'
            if (!parseCell()) {
                // Be explicit about what's wrong, instead of falling back and later erroring on ':'
                throw new FormulaParseError(3, colonPos, j);
            }
        }

        const ref = s.slice(start, j);
        if (!isStandaloneRefToken(s, start, ref)) {
            return 0;
        }

        return j - start; // length of cell or range token
    };

    while (i < expr.length) {
        const ch = expr[i];

        // skip whitespace
        if (/\s/.test(ch)) {
            i++;
            continue;
        }

        // string literal "..."
        if (ch === '"') {
            let j = i + 1;
            while (j < expr.length && expr[j] !== '"') {
                j++;
            }
            if (j >= expr.length) {
                reportError(new FormulaParseError(4, i, i + 1));
                addToken(i, expr.length);
                break;
            }
            addToken(i, j + 1);
            i = j + 1;
            continue;
        }

        // numbers (simple)
        if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(expr[i + 1]))) {
            let j = i + 1;
            while (j < expr.length && /[0-9.]/.test(expr[j])) {
                j++;
            }
            addToken(i, j);
            i = j;
            continue;
        }

        // calculated-column same-row reference (e.g. [revenue])
        if (ch === '[') {
            let end = expr.indexOf(']', i + 1);
            // display references escape closing brackets; stored references keep the formula grammar
            while (source && end >= 0 && expr[end + 1] === ']') {
                end = expr.indexOf(']', end + 2);
            }
            if (end < 0) {
                reportError(new FormulaParseError(5, i, i + 1, [ch]));
                addToken(i, expr.length, 'reference');
                break;
            }
            addToken(i, end + 1, 'reference');
            i = end + 1;
            continue;
        }

        // cell / range with $ support (e.g., $A1, A$1, $A$1:$B10)
        if (ch === '$' || isFormulaIdentStart(ch)) {
            let len = 0;
            try {
                len = lexCellRange(expr, i);
            } catch (error) {
                if (!(error instanceof FormulaParseError)) {
                    throw error;
                }
                reportError(error);
            }
            if (len > 0) {
                addToken(i, i + len, 'reference');
                i += len;
                continue;
            }
            // fall back to IDENT (function names, named refs)
            let j = i + 1;
            while (j < expr.length && isFormulaIdentChar(expr[j])) {
                j++;
            }
            addToken(i, j, source && isFunctionNameAt(j) ? 'function' : 'text');
            i = j;
            continue;
        }

        // delimiters: parentheses and comma
        if (ch === '(' || ch === ')' || ch === ',') {
            addToken(i, i + 1);
            i++;
            continue;
        }

        // operators (greedy longest-first match)
        const firstMatch = OP_SYMBOLS_DESC.find((sym) => expr.startsWith(sym, i));
        if (!firstMatch) {
            reportError(new FormulaParseError(5, i, i + 1, [ch]));
            addToken(i, i + 1);
            i++;
            continue;
        }

        addToken(i, i + firstMatch.length, 'operator');
        i += firstMatch.length;
    }

    return tokens;
}

type OperatorFrame = { index: number } & (
    | { kind: 'op'; def: OperatorDef }
    | { kind: 'parenthesis'; outLen: number }
    | { kind: 'function'; name: string; args: FormulaNode[] }
);

function shouldReduce(top: OperatorDef, incoming: OperatorDef): boolean {
    if (top.fixity !== 'infix' || incoming.fixity !== 'infix') {
        return true;
    }

    if (top.associativity === 'right' && top.precedence === incoming.precedence) {
        return false;
    }

    return top.precedence >= incoming.precedence;
}

/** Choose prefix/infix/postfix meaning for an ambiguous symbol based on context. */
function pickOpDefForContext(symbol: string, prevToken: string | undefined): OperatorDef | null {
    const defs = OP_BY_SYMBOL.get(symbol);
    if (!defs) {
        return null;
    }

    const prevIsOperator = prevToken !== undefined && OP_BY_SYMBOL.has(prevToken);
    const prevIsOpenOrComma = prevToken === '(' || prevToken === ',';

    // if previous token is value or ')' or postfix-result, prefer infix/postfix
    const prevIsValueLike = prevToken !== undefined && !prevIsOperator && !prevIsOpenOrComma && prevToken !== '(';

    if (prevIsValueLike || prevToken === ')') {
        // prefer postfix if available, else infix
        return defs.find((d) => d.fixity === 'postfix') ?? defs.find((d) => d.fixity === 'infix') ?? null;
    }

    // otherwise (start of expr, or after '(' , ',' , or another operator): prefix first, then infix
    return defs.find((d) => d.fixity === 'prefix') ?? defs.find((d) => d.fixity === 'infix') ?? null;
}

/**
 * Turn a tokenized math/formula string into an AST (tree) using only stacks.
 * Handles + - * / ^, unary +/-, postfix %, parentheses, and nested functions.
 *
 * @param expr The formula body (without the leading '=').
 * @param unsafe Skip reference validation; 'absolute' also retains A1 positions as absolute references.
 * @returns A FormulaNode AST representing the expression.
 * @throws FormulaParseError for mismatched parentheses, missing operands, etc.
 *
 * @example
 * parseExpression(beans, 'SUM(1, 2+3)') // => { type:"operation", operation:"SUM", operands:[...]}
 */
function parseExpression(
    beans: BeanCollection,
    expr: string,
    unsafe: boolean | 'absolute',
    source?: FormulaExpressionSource
): FormulaNode {
    const tokens = tokenize(expr, source);
    if (source?.error) {
        throw source.error;
    }
    const errorAt = (id: FormulaErrorId, index: number, values?: readonly unknown[]) => {
        const token = source?.tokens[index];
        return new FormulaParseError(id, token?.start ?? index, token?.end ?? index + 1, values);
    };

    const output: FormulaNode[] = [];
    const ops: OperatorFrame[] = [];

    const applyTop = () => {
        const frame = ops.pop();
        if (!frame) {
            throw new FormulaParseError(6, 0, 0);
        }

        if (frame.kind === 'op') {
            const def = frame.def;

            if (def.fixity !== 'infix') {
                const right = output.pop();
                if (!right) {
                    throw errorAt(7, frame.index, [def.symbol]);
                }

                // unary plus is a no-op
                if (def.symbol === '+' && def.fixity === 'prefix') {
                    output.push(right);
                    return;
                }

                // postfix percent
                if (def.fixity === 'postfix' && def.symbol === '%') {
                    output.push({ type: 'operation', operation: def.symbol, operands: [right] });
                    return;
                }

                // generic unary (prefix)
                if (def.symbol === '-' && def.fixity === 'prefix') {
                    // represent as 0 - x to keep evaluator consistent with binary '-'
                    output.push({
                        type: 'operation',
                        operation: '-',
                        operands: [{ type: 'operand', value: 0 }, right],
                    });
                } else {
                    output.push({ type: 'operation', operation: def.symbol, operands: [right] });
                }
                return;
            }

            // infix
            const right = output.pop();
            const left = output.pop();
            if (!left || !right) {
                throw errorAt(7, frame.index, [def.symbol]);
            }
            output.push({ type: 'operation', operation: def.symbol, operands: [left, right] });
            return;
        }

        // parenthesis/function should not be reduced directly here
        throw errorAt(8, frame.index);
    };

    let i = 0;
    while (i < tokens.length) {
        const token = tokens[i];

        // Function start: IDENT '('
        if (isFormulaIdentStart(token[0]) && tokens[i + 1] === '(') {
            const name = token;
            ops.push({ kind: 'function', name, args: [], index: i });
            ops.push({ kind: 'parenthesis', outLen: output.length, index: i + 1 });
            i += 2;
            continue;
        }

        // Grouping '('
        if (token === '(') {
            ops.push({ kind: 'parenthesis', outLen: output.length, index: i });
            i++;
            continue;
        }

        // Argument separator ','
        if (token === ',') {
            const prevToken = tokens[i - 1];
            if (prevToken == null || prevToken === '(' || prevToken === ',') {
                throw errorAt(10, i);
            }

            // reduce until '('
            while (true) {
                const top = ops[ops.length - 1];
                if (!top || top.kind === 'parenthesis') {
                    break;
                }
                if (top.kind === 'op') {
                    applyTop();
                } else {
                    throw errorAt(9, i);
                }
            }
            const paren = ops[ops.length - 1];
            if (paren?.kind !== 'parenthesis') {
                throw errorAt(10, i);
            }
            // function frame must be just below '('
            const maybeFunction = ops[ops.length - 2];
            if (maybeFunction?.kind !== 'function') {
                throw errorAt(11, i);
            }
            // Only consume an arg if something was produced since '('
            if (output.length > paren.outLen) {
                maybeFunction.args.push(output.pop()!);
            }
            i++;
            continue;
        }

        // Closing ')'
        if (token === ')') {
            if (tokens[i - 1] === ',') {
                throw errorAt(10, i);
            }

            // reduce until '('
            while (true) {
                const top = ops[ops.length - 1];
                if (!top || top.kind === 'parenthesis') {
                    break;
                }
                if (top.kind === 'op') {
                    applyTop();
                } else {
                    throw errorAt(12, i);
                }
            }
            const paren = ops[ops.length - 1];
            if (paren?.kind !== 'parenthesis') {
                throw errorAt(13, i);
            }
            const parenOutLen = paren.outLen;
            ops.pop(); // pop '('

            // function collapse
            if (ops[ops.length - 1]?.kind === 'function') {
                const fn = ops.pop() as Extract<OperatorFrame, { kind: 'function' }>;
                // Only attach an argument if one was parsed within the parens
                if (output.length > parenOutLen) {
                    fn.args.push(output.pop()!);
                }
                output.push({ type: 'operation', operation: fn.name, operands: fn.args });
            }

            i++;
            continue;
        }

        // Operator?
        const incoming = OP_BY_SYMBOL.has(token) ? pickOpDefForContext(token, tokens[i - 1]) : null;

        if (incoming) {
            // Reduce while top-of-stack operator outranks incoming
            while (true) {
                const top = ops[ops.length - 1];
                if (top?.kind !== 'op') {
                    break;
                }
                if (shouldReduce(top.def, incoming)) {
                    applyTop();
                } else {
                    break;
                }
            }

            ops.push({ kind: 'op', def: incoming, index: i });
            i++;
            continue;
        }

        // Operand
        const parsed = parseOperand(beans, token, unsafe);
        if (parsed === undefined) {
            throw errorAt(14, i, [token]);
        }
        output.push({ type: 'operand', value: parsed });
        i++;
    }

    // Drain
    while (ops.length) {
        const top = ops[ops.length - 1];
        if (top.kind === 'op') {
            applyTop();
        } else {
            throw errorAt(15, top.index);
        }
    }

    if (output.length !== 1) {
        throw errorAt(16, tokens.length - 1);
    }
    return output[0];
}

/**
 * Parse a full formula string that starts with "=" into an AST.
 *
 * @param formula The full formula, e.g. "=SUM(A1, 2+3)".
 * @param unsafe If `true`, skip row/column validation. Use 'absolute' to also retain A1 positions as
 *   absolute references, for column-only validation without loaded rows or an active formula engine.
 * @returns The root FormulaNode of the parsed expression.
 * @throws FormulaParseError if the "=" is missing or the body is invalid.
 *
 * @example
 * parseFormula(beans, '=1+2') // => operation("+", [1,2])
 */
export const parseFormula = (
    beans: BeanCollection,
    formula: string,
    unsafe: boolean | 'absolute' = false
): FormulaNode => {
    if (!_isExpressionString(formula)) {
        throw new FormulaParseError(17, 0, 1);
    }
    const body = formula.slice(1).trim();
    return normalizeRefCells(parseExpression(beans, body, unsafe));
};

/** Inspects display text without evaluating it. Ranges use textarea (UTF-16) offsets, end-exclusive. */
export function inspectFormulaExpression(
    beans: BeanCollection,
    expression: string
): { tokens: FormulaSourceToken[]; error: FormulaError | null; range?: { start: number; end: number } } {
    const source: FormulaExpressionSource = { tokens: [] };
    const prefix = /^\s*=/.exec(expression)?.[0].length ?? 0;
    const body = expression.slice(prefix);
    const trimmedBody = body.trim();
    if (prefix && !trimmedBody) {
        return { tokens: [], error: new FormulaError(16), range: { start: prefix - 1, end: prefix } };
    }
    let error: FormulaError | null = null;
    let range: { start: number; end: number } | undefined;
    try {
        if (trimmedBody) {
            const ast = normalizeRefCells(parseExpression(beans, body, true, source));
            const invalidOperation = findFirstInvalidOperation(ast, (name) => !!beans.formula?.getFunction(name));
            if (invalidOperation) {
                error = new FormulaError(27, [invalidOperation]);
                const invalidToken = source.tokens.find(
                    (token) => token.type === 'function' && body.slice(token.start, token.end) === invalidOperation
                );
                range = invalidToken && { start: invalidToken.start, end: invalidToken.end };
            }
        }
    } catch (err) {
        if (!(err instanceof FormulaError)) {
            throw err;
        }
        error = err;
        if (err instanceof FormulaParseError && err.errorEnd > err.errorStart) {
            range = { start: err.errorStart, end: err.errorEnd };
        }
    }
    return {
        tokens: source.tokens.map((token) => ({ ...token, start: token.start + prefix, end: token.end + prefix })),
        error,
        range: range && { start: range.start + prefix, end: range.end + prefix },
    };
}

function isOperation(node: FormulaNode, name: string): node is FormulaOperation {
    return node.type === 'operation' && node.operation.toUpperCase() === name.toUpperCase();
}

function asBool(node: FormulaNode | undefined, def = false): boolean {
    if (!node) {
        return def;
    }
    if (node.type !== 'operand') {
        return def;
    }
    return !!node.value;
}

function asStringish(node: FormulaNode | undefined): string | null {
    if (node?.type !== 'operand') {
        return null;
    }
    const v = node.value;
    if (typeof v === 'string') {
        return v;
    }
    if (typeof v === 'number' || typeof v === 'boolean') {
        return String(v);
    }
    return null;
}

function extractColumnRef(node: FormulaNode): CellRef | null {
    if (!isOperation(node, 'COLUMN')) {
        return null;
    }
    const id = asStringish(node.operands[0]);
    if (id == null) {
        return null;
    }
    const absolute = asBool(node.operands[1], false);
    return { id, absolute };
}

function extractRowRef(node: FormulaNode): CellRef | null {
    if (!isOperation(node, 'ROW')) {
        return null;
    }
    const id = asStringish(node.operands[0]);
    if (id == null) {
        return null;
    }
    const absolute = asBool(node.operands[1], false);
    return { id, absolute };
}

/**
 * Try to turn REF(...) into a Cell operand. Accepts:
 *  REF( COLUMN(id[,abs]), ROW(id[,abs]) )
 *  REF( COLUMN(id[,abs]), ROW(id[,abs]), COLUMN(id[,abs]), ROW(id[,abs]) ) // range
 */
function tryFoldRefToCell(node: FormulaNode): FormulaNode | null {
    if (!isOperation(node, 'REF')) {
        return null;
    }
    const ops = node.operands;
    if (ops.length !== 2 && ops.length !== 4) {
        return null;
    }

    const col1 = extractColumnRef(ops[0]);
    const row1 = extractRowRef(ops[1]);
    if (!col1 || !row1) {
        return null;
    }

    const cell: Cell = { column: col1, row: row1 };

    if (ops.length === 4) {
        const col2 = extractColumnRef(ops[2]);
        const row2 = extractRowRef(ops[3]);
        if (!col2 || !row2) {
            return null;
        }
        cell.endColumn = col2;
        cell.endRow = row2;
    }

    return { type: 'operand', value: cell };
}

/** Walk the AST and fold any REF/COLUMN/ROW patterns into Cell operands. */
function normalizeRefCells(node: FormulaNode): FormulaNode {
    if (node.type === 'operation') {
        const normalizedOperands = node.operands.map(normalizeRefCells);
        const rebuilt: FormulaOperation = {
            type: 'operation',
            operation: node.operation,
            operands: normalizedOperands,
        };
        const folded = tryFoldRefToCell(rebuilt);
        return folded ?? rebuilt;
    }
    return node;
}
