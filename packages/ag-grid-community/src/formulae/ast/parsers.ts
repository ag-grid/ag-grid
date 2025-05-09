import type { BeanCollection } from "../../context/context";
import { BINARY_PRECEDENCE, BinaryOperator, isBinaryOp } from "./serializer";
import type { Cell, CellRef, FormulaNode, FormulaOperation } from './utils';
import { FormulaParseError } from './utils';

/**
 * Converts a single operand string into a JS primitive or Cell object.
 *
 * @param beans Helpers for looking up rows/columns (used to resolve cell refs).
 * @param operand The raw text of the operand (e.g. `"123"`, `"true"`, `"A1"`).
 * @returns A JS value (string/number/boolean) or a Cell object, or null if unknown.
 * @throws FormulaParseError if a cell reference is invalid.
 *
 * @example
 *  parseOperand(beans, '"hello"') // => 'hello'
 *  parseOperand(beans, '42')      // => 42
 *  parseOperand(beans, 'A1')      // => { column:{...}, row:{...} }
 */
export const parseOperand = (beans: BeanCollection, operand: string): string | number | boolean | Cell | null => {
    const trimmed = operand.trim();

    // string literal
    if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 2) {
        return trimmed.slice(1, -1);
    }

    // booleans
    if (trimmed.toLowerCase() === "true") return true;
    if (trimmed.toLowerCase() === "false") return false;

    // numbers
    const num = Number(trimmed);
    if (!isNaN(num)) return num;

    // cell/range
    // Matches: $A$1, A1, $A1, A$1, $A$1:$B10 etc.
    const cellRegex =
        /^(\$?)([A-Z]+)(\$?)([0-9]+)(?::(\$?)([A-Z]+)(\$?)([0-9]+))?$/i;
    const match = trimmed.match(cellRegex);

    if (match) {
        const [
            ,
            absCol1, col1,
            absRow1, row1,
            absCol2, col2,
            absRow2, row2,
        ] = match;

        const toCell = (colAbs: boolean, colStr: string, rowAbs: boolean, rowStr: string): Cell => {
            const col = colAbs ? colStr.toUpperCase() : beans.formulae?.getColByRef(colStr)?.colId;
            const row = rowAbs ? rowStr : beans.rowModel?.getRow(Number(rowStr) - 1)?.id; // TODO handle NaN

            if (col == null || row == null) {
                throw new FormulaParseError("Invalid cell reference", 0, 0);
            }

            return {
                column: { id: col!, absolute: colAbs },
                row: { id: row!, absolute: rowAbs },
            };
        }

        const start: Cell = toCell(absCol1 === "$", col1, absRow1 === "$", row1);

        if (col2 && row2) {
            const end: Cell = toCell(absCol2 === "$", col2, absRow2 === "$", row2);
            start.endColumn = end.column;
            start.endRow = end.row;
        }

        return start;
    }

    return null;
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
function tokenize(expr: string): string[] {
    const tokens: string[] = [];
    let i = 0;

    const lexCellRange = (s: string, start: number): number => {
        let j = start;

        const dollar = () => (s[j] === '$' ? (j++, true) : false);
        const letters = () => { const k = j; while (j < s.length && /[A-Za-z]/.test(s[j])) j++; return j > k; };
        const digits = () => { const k = j; while (j < s.length && /[0-9]/.test(s[j])) j++; return j > k; };

        // Parse one cell: [$]LETTERS [$]DIGITS
        const parseCell = (): boolean => {
            const j0 = j;
            dollar();              // optional $ before column
            if (!letters()) { j = j0; return false; }
            dollar();              // optional $ before row
            if (!digits()) { j = j0; return false; }
            return true;
        };

        if (!parseCell()) return 0; // not a cell/range here

        // Optional ":<cell>" for a range
        if (s[j] === ':') {
            const colonPos = j;
            j++; // consume ':'
            if (!parseCell()) {
                // Be explicit about what's wrong, instead of falling back and later erroring on ':'
                throw new FormulaParseError("Invalid range end reference", colonPos, j);
            }
        }

        return j - start; // length of cell or range token
    };


    while (i < expr.length) {
        const ch = expr[i];

        // skip whitespace
        if (/\s/.test(ch)) { i++; continue; }

        // string literal "..."
        if (ch === '"') {
            let j = i + 1;
            while (j < expr.length && expr[j] !== '"') j++;
            if (j >= expr.length) throw new FormulaParseError("Unterminated string", i, expr.length);
            tokens.push(expr.slice(i, j + 1));
            i = j + 1;
            continue;
        }

        // numbers (simple)
        if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(expr[i + 1]))) {
            let j = i + 1;
            while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
            tokens.push(expr.slice(i, j));
            i = j;
            continue;
        }

        // cell / range with $ support (e.g., $A1, A$1, $A$1:$B10)
        if (ch === '$' || /[A-Za-z]/.test(ch)) {
            const len = lexCellRange(expr, i);
            if (len > 0) {
                tokens.push(expr.slice(i, i + len));
                i += len;
                continue;
            }
            // fall back to IDENT (function names, named refs)
            let j = i + 1;
            while (j < expr.length && /[A-Za-z0-9]/.test(expr[j])) j++;
            tokens.push(expr.slice(i, j));
            i = j;
            continue;
        }

        // single-char operators/delimiters
        if ("+-*/^(),%".includes(ch)) {
            tokens.push(ch);
            i++;
            continue;
        }

        throw new FormulaParseError("Unexpected character: " + ch, i, i + 1);
    }

    return tokens;
}

type OperatorFrame =
    | { kind: 'binary'; operator: BinaryOperator }
    | { kind: 'unaryMinus' }
    | { kind: 'parenthesis' }
    | { kind: 'function'; name: string; args: FormulaNode[] };

/** '^' is right-associative: do not reduce a stacked '^' when a new '^' arrives. */
function shouldReduceBinary(top: BinaryOperator, incoming: BinaryOperator): boolean {
    if (top === '^' && incoming === '^') return false;
    return BINARY_PRECEDENCE[top] >= BINARY_PRECEDENCE[incoming];
}

/** Type guard for narrowing */
function isBinaryFrame(f: OperatorFrame | undefined): f is Extract<OperatorFrame, { kind: 'binary' }> {
    return !!f && f.kind === 'binary';
}

/**
 * Turn a tokenized math/formula string into an AST (tree) using only stacks.
 * Handles + - * / ^, unary minus, postfix %, parentheses, and nested functions.
 *.
 *
 * @param expr The formula body (without the leading '=').
 * @returns A FormulaNode AST representing the expression.
 * @throws FormulaParseError for mismatched parentheses, missing operands, etc.
 *
 * @example
 * parseExpression(beans, 'SUM(1, 2+3)') // => { type:"operation", operation:"SUM", operands:[...]}
 */
function parseExpression(beans: BeanCollection, expr: string): FormulaNode {
    const tokens = tokenize(expr);

    const output: FormulaNode[] = [];
    const ops: OperatorFrame[] = [];

    const applyTop = () => {
        const frame = ops.pop();
        if (!frame) throw new FormulaParseError("Operator stack underflow", 0, 0);

        switch (frame.kind) {
            case 'unaryMinus': {
                const right = output.pop();
                if (!right) throw new FormulaParseError("Missing operand for unary '-'", 0, 0);
                output.push({ type: 'operation', operation: '-', operands: [{ type: 'operand', value: 0 }, right] });
                return;
            }
            case 'binary': {
                const right = output.pop();
                const left = output.pop();
                if (!left || !right) throw new FormulaParseError(`Missing operand for '${frame.operator}'`, 0, 0);
                output.push({ type: 'operation', operation: frame.operator, operands: [left, right] });
                return;
            }
            case 'parenthesis':
            case 'function':
                throw new FormulaParseError("Internal error: unexpected frame during reduction", 0, 0);
        }
    };

    const reducePendingUnaryMinus = () => {
        while (ops[ops.length - 1]?.kind === 'unaryMinus') {
            applyTop();
        }
    };

    let i = 0;
    while (i < tokens.length) {
        const token = tokens[i];

        // Postfix %
        if (token === '%') {
            const last = output.pop();
            if (!last) throw new FormulaParseError("Misplaced '%'", i, i + 1);
            output.push({ type: 'operation', operation: '%', operands: [last] });
            i++;
            continue;
        }

        // '+' / '-' unary vs binary
        if (token === '+' || token === '-') {
            const prev = tokens[i - 1];
            const isUnary =
                i === 0 ||
                prev === '(' ||
                prev === ',' ||
                (prev !== undefined && isBinaryOp(prev));

            if (isUnary) {
                if (token === '-') ops.push({ kind: 'unaryMinus' }); // unary '+': no-op
                i++;
                continue;
            }

            // binary '+' / '-'
            reducePendingUnaryMinus();

            for (; ;) {
                const top = ops[ops.length - 1];
                if (isBinaryFrame(top) && shouldReduceBinary(top.operator, token)) {
                    applyTop();
                } else {
                    break;
                }
            }

            ops.push({ kind: 'binary', operator: token });
            i++;
            continue;
        }

        // other binary operators
        if (isBinaryOp(token)) {
            reducePendingUnaryMinus();

            for (; ;) {
                const top = ops[ops.length - 1];
                if (isBinaryFrame(top) && shouldReduceBinary(top.operator, token)) {
                    applyTop();
                } else {
                    break;
                }
            }

            ops.push({ kind: 'binary', operator: token });
            i++;
            continue;
        }

        // Function start: IDENT '('
        if (/[A-Za-z]/.test(token[0] || '') && tokens[i + 1] === '(') {
            const name = token;
            ops.push({ kind: 'function', name, args: [] });
            ops.push({ kind: 'parenthesis' });
            i += 2;
            continue;
        }

        // Grouping '('
        if (token === '(') {
            ops.push({ kind: 'parenthesis' });
            i++;
            continue;
        }

        // Argument separator ','
        if (token === ',') {
            // reduce until '('
            for (; ;) {
                const top = ops[ops.length - 1];
                if (!top || top.kind === 'parenthesis') break;
                if (top.kind === 'binary' || top.kind === 'unaryMinus') {
                    applyTop();
                } else {
                    throw new FormulaParseError("Internal error: unexpected frame before '('", i, i + 1);
                }
            }
            if (ops[ops.length - 1]?.kind !== 'parenthesis') {
                throw new FormulaParseError("Misplaced comma", i, i + 1);
            }
            // function frame must be just below '('
            const maybeFunction = ops[ops.length - 2];
            if (!maybeFunction || maybeFunction.kind !== 'function') {
                throw new FormulaParseError("Comma outside of a function call", i, i + 1);
            }
            const argNode = output.pop();
            if (argNode) maybeFunction.args.push(argNode); // ignore empty arg if none
            i++;
            continue;
        }

        // Closing ')'
        if (token === ')') {
            // reduce until '('
            for (; ;) {
                const top = ops[ops.length - 1];
                if (!top || top.kind === 'parenthesis') break;
                if (top.kind === 'binary' || top.kind === 'unaryMinus') {
                    applyTop();
                } else {
                    throw new FormulaParseError("Internal error: unexpected frame before ')'", i, i + 1);
                }
            }
            if (ops[ops.length - 1]?.kind !== 'parenthesis') {
                throw new FormulaParseError("Mismatched parentheses", i, i + 1);
            }
            ops.pop(); // pop '('

            // function collapse
            if (ops[ops.length - 1]?.kind === 'function') {
                const fn = ops.pop() as Extract<OperatorFrame, { kind: 'function' }>;
                const lastArg = output.pop();
                if (lastArg) fn.args.push(lastArg);
                output.push({ type: 'operation', operation: fn.name, operands: fn.args });
            }

            i++;
            continue;
        }

        // Operand
        const parsed = parseOperand(beans, token);
        if (parsed == null) {
            throw new FormulaParseError("Unsupported operand: " + token, 0, token.length);
        }
        output.push({ type: 'operand', value: parsed });
        i++;
    }

    // Drain
    reducePendingUnaryMinus();
    while (ops.length) {
        const top = ops[ops.length - 1];
        if (top.kind === 'binary' || top.kind === 'unaryMinus') {
            applyTop();
        } else {
            throw new FormulaParseError("Mismatched parentheses or unfinished function call", 0, 0);
        }
    }

    if (output.length !== 1) {
        throw new FormulaParseError("Invalid expression", 0, 0);
    }
    return output[0];
}


/**
 * Parse a full formula string that starts with "=" into an AST.
 *
 * @param formula The full formula, e.g. "=SUM(A1, 2+3)".
 * @returns The root FormulaNode of the parsed expression.
 * @throws FormulaParseError if the "=" is missing or the body is invalid.
 *
 * @example
 * parseFormula(beans, '=1+2') // => operation("+", [1,2])
 */
export const parseFormula = (beans: BeanCollection, formula: string): FormulaNode => {
    if (!formula.startsWith("=")) {
        throw new FormulaParseError("Formulas must begin with =", 0, 1);
    }
    const body = formula.slice(1).trim();
    return normalizeRefCells(parseExpression(beans, body));
};

function isOperation(node: FormulaNode, name: string): node is FormulaOperation {
    return node.type === 'operation' && node.operation.toUpperCase() === name.toUpperCase();
}

function asBool(node: FormulaNode | undefined, def = false): boolean {
    if (!node) return def;
    if (node.type !== 'operand') return def;
    return !!node.value;
}

function asStringish(node: FormulaNode | undefined): string | null {
    if (!node || node.type !== 'operand') return null;
    const v = node.value;
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    return null;
}

function extractColumnRef(node: FormulaNode): CellRef | null {
    if (!isOperation(node, 'COLUMN')) return null;
    const id = asStringish(node.operands[0]);
    if (id == null) return null;
    const absolute = asBool(node.operands[1], false);
    return { id, absolute };
}

function extractRowRef(node: FormulaNode): CellRef | null {
    if (!isOperation(node, 'ROW')) return null;
    const id = asStringish(node.operands[0]);
    if (id == null) return null;
    const absolute = asBool(node.operands[1], false);
    return { id, absolute };
}

/**
 * Try to turn REF(...) into a Cell operand. Accepts:
 *  REF( COLUMN(id[,abs]), ROW(id[,abs]) )
 *  REF( COLUMN(id[,abs]), ROW(id[,abs]), COLUMN(id[,abs]), ROW(id[,abs]) ) // range
 */
function tryFoldRefToCell(node: FormulaNode): FormulaNode | null {
    if (!isOperation(node, 'REF')) return null;
    const ops = node.operands;
    if (ops.length !== 2 && ops.length !== 4) return null;

    const col1 = extractColumnRef(ops[0]);
    const row1 = extractRowRef(ops[1]);
    if (!col1 || !row1) return null;

    const cell: Cell = { column: col1, row: row1 };

    if (ops.length === 4) {
        const col2 = extractColumnRef(ops[2]);
        const row2 = extractRowRef(ops[3]);
        if (!col2 || !row2) return null;
        cell.endColumn = col2;
        cell.endRow = row2;
    }

    return { type: 'operand', value: cell };
}

/** Walk the AST and fold any REF/COLUMN/ROW patterns into Cell operands. */
function normalizeRefCells(node: FormulaNode): FormulaNode {
    if (node.type === 'operation') {
        const normalizedOperands = node.operands.map(normalizeRefCells);
        const rebuilt: FormulaOperation = { type: 'operation', operation: node.operation, operands: normalizedOperands };
        const folded = tryFoldRefToCell(rebuilt);
        return folded ?? rebuilt;
    }
    return node;
}
