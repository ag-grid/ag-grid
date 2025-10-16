import type { AgColumn, BeanCollection, ColumnModel } from 'ag-grid-community';

import { getDefBySymbol } from './operators';
import type { InfixOpDef } from './operators';
import type { Cell, CellRef, FormulaNode, FormulaOperation } from './utils';

// shared, symbol-only

const isOperationNode = (n: FormulaNode): n is FormulaOperation => n.type === 'operation';

function colLabelFromId(beans: BeanCollection, colId: string): string | null {
    const col = beans.colModel.getColById(colId);
    if (col) {
        return beans.formula?.getColRef(col) ?? null;
    }
    return null;
}
function colIdFromLabel(beans: BeanCollection, label: string): string | null {
    return beans.formula?.getColByRef?.(label)?.colId ?? null;
}

export function colIndexFromId(colModel: ColumnModel, cols: AgColumn[], colId: string): number | null {
    const col = colModel.getColById(colId);

    if (!col) {
        return null;
    }
    const i = cols.indexOf(col);
    return i >= 0 ? i : null;
}

export function colIdFromIndex(cols: AgColumn[], idx: number): string | null {
    const col = cols[idx];
    return col ? col.getId() ?? null : null;
}

export function rowIndexFromId(beans: BeanCollection, rowId: string): number | null {
    const row = beans.rowModel?.getRowNode?.(rowId);
    if (row?.rowIndex != null) {
        return row.rowIndex + 1; // convert 0-based to 1-based
    }
    return null;
}
export function rowIdFromIndex(beans: BeanCollection, idx: number): string | null {
    return beans.rowModel?.getRow?.(idx - 1)?.id ?? null;
}

function quoteString(s: string): string {
    if (s.includes('"')) {
        throw 'String contains a quote (") which the tokenizer does not support.';
    }
    return `"${s}"`;
}

function columnValueForREF(beans: BeanCollection, ref: CellRef): string {
    const looksLetters = /^[A-Za-z]+$/.test(ref.id);
    if (ref.absolute) {
        if (looksLetters) {
            return ref.id.toUpperCase();
        }
        const label = colLabelFromId(beans, ref.id);
        if (label) {
            return label.toUpperCase();
        }
        throw `Cannot produce absolute COLUMN label from id '${ref.id}'`;
    } else {
        if (looksLetters) {
            const id = colIdFromLabel(beans, ref.id);
            if (id) {
                return id;
            }
        }
        return ref.id;
    }
}

function rowValueForREF(beans: BeanCollection, ref: CellRef): string {
    const looksDigits = /^\d+$/.test(ref.id);
    if (ref.absolute) {
        if (looksDigits) {
            return ref.id;
        }
        const idx = rowIndexFromId(beans, ref.id);
        if (idx != null) {
            return String(idx);
        }
        throw `Cannot produce absolute ROW index from id '${ref.id}'`;
    } else {
        if (looksDigits) {
            const id = rowIdFromIndex(beans, Number(ref.id));
            if (id) {
                return id;
            }
        }
        return ref.id;
    }
}

function columnLabelForA1(beans: BeanCollection, ref: CellRef): string {
    // if absolute, already storing col label
    if (ref.absolute) {
        return ref.id;
    }

    const label = colLabelFromId(beans, ref.id);
    if (label) {
        return label.toUpperCase();
    }
    throw `Cannot map column id '${ref.id}' to A1 label`;
}

function rowIndexForA1(beans: BeanCollection, ref: CellRef): number {
    // if absolute, already storing 1-based row index
    if (ref.absolute) {
        const idx = Number(ref.id);
        if (Number.isFinite(idx) && idx >= 1) {
            return idx;
        }
        throw `Cannot parse absolute row index '${ref.id}'`;
    }
    const idx = rowIndexFromId(beans, ref.id);
    if (idx != null) {
        return idx;
    }
    throw `Cannot map row id '${ref.id}' to A1 index`;
}

function serializeCellA1(beans: BeanCollection, cell: Cell): string {
    const a = (abs: boolean, x: string | number) => (abs ? '$' : '') + String(x);

    const col1 = columnLabelForA1(beans, cell.column);
    const row1 = rowIndexForA1(beans, cell.row);
    const startRef = a(cell.column.absolute, col1) + a(cell.row.absolute, row1);

    if (cell.endColumn && cell.endRow) {
        const col2 = columnLabelForA1(beans, cell.endColumn);
        const row2 = rowIndexForA1(beans, cell.endRow);
        return `${startRef}:${a(cell.endColumn.absolute, col2)}${a(cell.endRow.absolute, row2)}`;
    }
    return startRef;
}

function serializeCellREF(beans: BeanCollection, cell: Cell): string {
    const colPart = (r: CellRef) => `COLUMN(${quoteString(columnValueForREF(beans, r))}${r.absolute ? ',true' : ''})`;
    const rowPart = (r: CellRef) => `ROW(${quoteString(rowValueForREF(beans, r))}${r.absolute ? ',true' : ''})`;

    const start = `REF(${colPart(cell.column)},${rowPart(cell.row)}`;
    if (cell.endColumn && cell.endRow) {
        return `${start},${colPart(cell.endColumn)},${rowPart(cell.endRow)})`;
    }
    return `${start})`;
}

/** Detects if unary - by checking if first child is 0 */
function isUnaryMinusNode(node: FormulaNode): FormulaNode | null {
    if (!isOperationNode(node) || node.operation !== '-' || node.operands.length !== 2) {
        return null;
    }
    const [left, right] = node.operands;
    if (left.type === 'operand' && left.value === 0) {
        return right;
    }
    return null;
}

/** True if this node is an infix operation that's in the operator table. */
function isInfixOpNode(node: FormulaNode): boolean {
    if (!isOperationNode(node)) {
        return false;
    }
    return !!getDefBySymbol(node.operation, 'infix');
}

function needsParensInBinary(parentDef: InfixOpDef, child: FormulaNode, side: 'left' | 'right'): boolean {
    if (!isOperationNode(child)) {
        return false;
    }

    // If child is unary-minus-encoded, let the unary print logic decide.
    if (isUnaryMinusNode(child)) {
        return false;
    }

    const childDef = getDefBySymbol(child.operation, 'infix');
    if (!childDef || childDef.fixity !== 'infix') {
        // functions or non-infix -> no parens
        return false;
    }

    const pParent = parentDef.precedence;
    const pChild = childDef.precedence;

    if (pChild < pParent) {
        return true;
    }
    if (pChild > pParent) {
        return false;
    }

    // Equal precedence
    if (parentDef.associativity === 'right') {
        // e.g., '^': parenthesize LEFT child if also '^'
        const sameOp = childDef.symbol === parentDef.symbol;
        return side === 'left' && sameOp;
    }

    // Left-assoc at equal precedence: add parens on RIGHT if not associative (e.g., '-', '/')
    const parentAssociative = parentDef.isAssociative === true;
    if (!parentAssociative) {
        return side === 'right';
    }

    return false; // associative like '+' or '*'
}

/** Decide if inner of unary minus (-x) needs parentheses for surface syntax. */
function needsParensForUnaryMinus(rhs: FormulaNode): boolean {
    if (!isOperationNode(rhs)) {
        return false;
    }

    // If inner is an infix op, we mirror original behavior: wrap for +, -, *, /; don't wrap for '^'
    const innerInfix = getDefBySymbol(rhs.operation, 'infix');
    if (!innerInfix) {
        return false;
    }
    const isPow = innerInfix.symbol === '^';
    return !isPow;
}

/**
 * Serializes a formula AST into a string representation.
 * @param beans The bean collection.
 * @param root The root node of the formula AST.
 * @param useRefFormat Whether to use the REF format (db safe) or A1 format (editor safe).
 * @returns The serialized formula string.
 *
 * @example
 * useRefFormat = true  -> REF(COLUMN(...),ROW(...))
 * useRefFormat = false -> A1 ($A$1:$B2)
 */
export function serializeFormula(beans: BeanCollection, root: FormulaNode, useRefFormat: boolean): string {
    const emitCell = (cell: Cell) => (useRefFormat ? serializeCellREF(beans, cell) : serializeCellA1(beans, cell));

    function emit(node: FormulaNode): string {
        if (node.type === 'operand') {
            const v = node.value;
            if (typeof v === 'string') {
                return quoteString(v);
            }
            if (typeof v === 'number') {
                return String(v);
            }
            if (typeof v === 'boolean') {
                return v ? 'TRUE' : 'FALSE';
            }
            return emitCell(v as Cell);
        }

        // Unary minus special-case: represented as '-' with [0, expr]
        const unaryMinusInner = isUnaryMinusNode(node);
        if (unaryMinusInner) {
            const s = emit(unaryMinusInner);
            return needsParensForUnaryMinus(unaryMinusInner) ? `-(${s})` : `-${s}`;
        }

        const op = node.operation.toUpperCase();

        // unary +-% (prefix or postfix)
        if (node.operands.length === 1) {
            const rhs = node.operands[0];

            // Prefer postfix if defined for this symbol (e.g., '%')
            const post = getDefBySymbol(op, 'postfix');
            if (post) {
                return `${emit(rhs)}${post.symbol}`;
            }

            // Otherwise prefix (if you add real prefix ops later)
            const pre = getDefBySymbol(op, 'prefix');
            if (pre) {
                const inner = emit(rhs);
                // Conservative: add parens if inner is an infix expression
                const need = isInfixOpNode(rhs);
                return need ? `${pre.symbol}(${inner})` : `${pre.symbol}${inner}`;
            }

            // Fallback: function-style
            return `${op}(${emit(rhs)})`;
        }

        // infix binary operator
        if (node.operands.length === 2) {
            const def = getDefBySymbol(op, 'infix');

            if (def) {
                const [l, r] = node.operands;
                const Ls = needsParensInBinary(def, l, 'left') ? `(${emit(l)})` : emit(l);
                const Rs = needsParensInBinary(def, r, 'right') ? `(${emit(r)})` : emit(r);
                return `${Ls}${def.symbol}${Rs}`;
            }
        }

        // function call or unknown operation: OP(arg1,arg2,...)
        return `${op}(${node.operands.map(emit).join(',')})`;
    }

    return '=' + emit(root);
}
