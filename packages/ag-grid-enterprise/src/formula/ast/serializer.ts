import type { AgColumn, BeanCollection, ColumnModel } from 'ag-grid-community';

import { getFormulaRowByIndex, getFormulaRowIndex } from '../rowAccess';
import type { InfixOpDef } from './operators';
import { getDefBySymbol } from './operators';
import type { Cell, CellRef, FormulaNode, FormulaOperation } from './utils';
import { FormulaError } from './utils';

const isOperationNode = (n: FormulaNode): n is FormulaOperation => n.type === 'operation';

function colLabelFromId(beans: BeanCollection, colId: string): string | null {
    const col = beans.colModel.colsById[colId];
    if (col) {
        return beans.formula?.getColRef(col) ?? null;
    }
    return null;
}
function colIdFromLabel(beans: BeanCollection, label: string): string | null {
    return beans.formula?.getColByRef?.(label)?.colId ?? null;
}

export function colIndexFromId(colModel: ColumnModel, cols: AgColumn[], colId: string): number | null {
    const col = colModel.colsById[colId];

    if (!col) {
        return null;
    }
    const i = cols.indexOf(col);
    return i >= 0 ? i : null;
}

export function colIdFromIndex(cols: AgColumn[], idx: number): string | null {
    return cols[idx]?.colId ?? null;
}

export function rowIndexFromId(beans: BeanCollection, rowId: string): number | null {
    const row = beans.rowModel?.getRowNode?.(rowId);
    const formulaRowIndex = row ? getFormulaRowIndex(row) : null;
    if (formulaRowIndex != null) {
        return formulaRowIndex + 1; // convert 0-based to 1-based
    }
    return null;
}
export function rowIdFromIndex(beans: BeanCollection, idx: number): string | null {
    return getFormulaRowByIndex(beans, idx - 1)?.id ?? null;
}

const LETTERS_ONLY = /^[A-Za-z]+$/;

function quoteString(s: string): string {
    if (s.includes('"')) {
        throw new FormulaError(18);
    }
    return '"' + s + '"';
}

function columnValueForREF(beans: BeanCollection, ref: CellRef): string {
    const id = ref.id;
    const looksLetters = LETTERS_ONLY.test(id);
    if (ref.absolute) {
        if (looksLetters) {
            return id.toUpperCase();
        }
        const label = colLabelFromId(beans, id);
        if (label) {
            return label.toUpperCase();
        }
        throw new FormulaError(19, [id]);
    }
    if (looksLetters) {
        const mappedId = colIdFromLabel(beans, id);
        if (mappedId) {
            return mappedId;
        }
    }
    return id;
}

function rowValueForREF(beans: BeanCollection, ref: CellRef): string {
    const { id, absolute } = ref;
    if (absolute) {
        // when absolute, the reference id is the index
        if (rowIdFromIndex(beans, Number(id)) == null) {
            throw new FormulaError(20, [id]);
        }
    } else if (rowIndexFromId(beans, id) == null) {
        throw new FormulaError(21, [id]);
    }
    return id;
}

function columnLabelForA1(beans: BeanCollection, ref: CellRef): string {
    const id = ref.id;
    // if absolute, already storing col label
    if (ref.absolute) {
        return id;
    }

    const label = colLabelFromId(beans, id);
    if (label) {
        return label.toUpperCase();
    }
    throw new FormulaError(22, [id]);
}

function rowIndexForA1(beans: BeanCollection, ref: CellRef): number {
    // if absolute, already storing 1-based row index
    const id = ref.id;
    if (ref.absolute) {
        const idx = Number(id);
        if (Number.isFinite(idx) && idx >= 1) {
            return idx;
        }
        throw new FormulaError(23, [id]);
    }
    const idx = rowIndexFromId(beans, id);
    if (idx != null) {
        return idx;
    }
    throw new FormulaError(24, [id]);
}

function emitA1Ref(beans: BeanCollection, ref: CellRef, isCol: boolean, unsafe: boolean): string {
    const raw = unsafe ? ref.id : isCol ? columnLabelForA1(beans, ref) : rowIndexForA1(beans, ref);
    return ref.absolute ? '$' + raw : '' + raw;
}

function serializeCellA1(beans: BeanCollection, cell: Cell, unsafe: boolean, useCalculatedRefs: boolean): string {
    if (useCalculatedRefs && cell.row.current && !cell.endColumn && !cell.endRow) {
        return `[${cell.column.id}]`;
    }
    const startRef = emitA1Ref(beans, cell.column, true, unsafe) + emitA1Ref(beans, cell.row, false, unsafe);
    const { endColumn, endRow } = cell;
    if (endColumn && endRow) {
        return startRef + ':' + emitA1Ref(beans, endColumn, true, unsafe) + emitA1Ref(beans, endRow, false, unsafe);
    }
    return startRef;
}

function emitRefColPart(beans: BeanCollection, ref: CellRef): string {
    return 'COLUMN(' + quoteString(columnValueForREF(beans, ref)) + (ref.absolute ? ',true)' : ')');
}

function emitRefRowPart(beans: BeanCollection, ref: CellRef): string {
    return 'ROW(' + quoteString(rowValueForREF(beans, ref)) + (ref.absolute ? ',true)' : ')');
}

function serializeCellREF(beans: BeanCollection, cell: Cell, useCalculatedRefs: boolean): string {
    if (useCalculatedRefs && cell.row.current && !cell.endColumn && !cell.endRow) {
        return `[${cell.column.id}]`;
    }
    const start = 'REF(' + emitRefColPart(beans, cell.column) + ',' + emitRefRowPart(beans, cell.row);
    const { endColumn, endRow } = cell;
    if (endColumn && endRow) {
        return start + ',' + emitRefColPart(beans, endColumn) + ',' + emitRefRowPart(beans, endRow) + ')';
    }
    return start + ')';
}

/** True if `node` is `-(0, x)` (the encoding of unary minus); returns inner `x`, else null. */
function unaryMinusInner(node: FormulaOperation): FormulaNode | null {
    if (node.operation !== '-' || node.operands.length !== 2) {
        return null;
    }
    const [left, right] = node.operands;
    return left.type === 'operand' && left.value === 0 ? right : null;
}

function needsParensInBinary(parentDef: InfixOpDef, child: FormulaNode, side: 'left' | 'right'): boolean {
    if (!isOperationNode(child)) {
        return false;
    }
    // Unary-minus children format as '-x' or '-(x)' which is self-contained; no outer parens.
    if (unaryMinusInner(child)) {
        return false;
    }

    const childDef = getDefBySymbol(child.operation, 'infix');
    if (!childDef) {
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
        // e.g. '^': parenthesize LEFT child if also '^'
        return side === 'left' && childDef.symbol === parentDef.symbol;
    }

    // Left-assoc at equal precedence: add parens on RIGHT if not associative (e.g., '-', '/')
    if (!parentDef.isAssociative) {
        return side === 'right';
    }

    return false; // associative like '+' or '*'
}

/** Decide if inner of unary minus (-x) needs parentheses for surface syntax. */
function needsParensForUnaryMinus(rhs: FormulaNode): boolean {
    if (!isOperationNode(rhs)) {
        return false;
    }
    // Mirror original behavior: wrap for +, -, *, /; don't wrap for '^'.
    const innerInfix = getDefBySymbol(rhs.operation, 'infix');
    return !!innerInfix && innerInfix.symbol !== '^';
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
export function serializeFormula(
    beans: BeanCollection,
    root: FormulaNode,
    useRefFormat: boolean,
    unsafe: boolean,
    useCalculatedRefs = false
): string {
    function emit(node: FormulaNode): string {
        if (node.type === 'operand') {
            const v = node.value;
            if (typeof v === 'string') {
                return quoteString(v);
            }
            if (typeof v === 'number') {
                return '' + v;
            }
            if (typeof v === 'boolean') {
                return v ? 'TRUE' : 'FALSE';
            }
            if (v == null) {
                return 'NULL';
            }
            return useRefFormat
                ? serializeCellREF(beans, v as Cell, useCalculatedRefs)
                : serializeCellA1(beans, v as Cell, unsafe, useCalculatedRefs);
        }

        // node is FormulaOperation here.
        const operands = node.operands;
        const arity = operands.length;

        // Unary minus special-case: '-' with operands [0, expr].
        if (arity === 2 && node.operation === '-') {
            const inner = unaryMinusInner(node);
            if (inner) {
                const s = emit(inner);
                return needsParensForUnaryMinus(inner) ? '-(' + s + ')' : '-' + s;
            }
        }

        const op = node.operation.toUpperCase();

        // unary +- or postfix % (1 operand)
        if (arity === 1) {
            const rhs = operands[0];

            // Prefer postfix if defined (e.g., '%')
            const post = getDefBySymbol(op, 'postfix');
            if (post) {
                return emit(rhs) + post.symbol;
            }

            const pre = getDefBySymbol(op, 'prefix');
            if (pre) {
                const inner = emit(rhs);
                // Conservative: add parens if inner is an infix expression.
                return isOperationNode(rhs) && getDefBySymbol(rhs.operation, 'infix')
                    ? pre.symbol + '(' + inner + ')'
                    : pre.symbol + inner;
            }

            // Fallback: function-style
            return op + '(' + emit(rhs) + ')';
        }

        // infix binary operator
        if (arity === 2) {
            const def = getDefBySymbol(op, 'infix');
            if (def) {
                const l = operands[0];
                const r = operands[1];
                const Ls = needsParensInBinary(def, l, 'left') ? '(' + emit(l) + ')' : emit(l);
                const Rs = needsParensInBinary(def, r, 'right') ? '(' + emit(r) + ')' : emit(r);
                return Ls + def.symbol + Rs;
            }
        }

        // function call or unknown operation: OP(arg1,arg2,...)
        let args = '';
        for (let i = 0; i < arity; i++) {
            args += (i === 0 ? '' : ',') + emit(operands[i]);
        }
        return op + '(' + args + ')';
    }

    return '=' + emit(root);
}
