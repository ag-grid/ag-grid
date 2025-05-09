import type { BeanCollection } from "../../context/context";
import type { FormulaNode, FormulaOperation } from "./utils";
import type { Cell, CellRef } from './utils';

export type BinaryOperator = '+' | '-' | '*' | '/' | '^';

export const BINARY_PRECEDENCE: Record<BinaryOperator, number> = {
    '+': 1, '-': 1, '*': 2, '/': 2, '^': 3,
};

export const isBinaryOp = (op: string): op is BinaryOperator =>
    op === '+' || op === '-' || op === '*' || op === '/' || op === '^';

const isOperationNode = (n: FormulaNode): n is FormulaOperation => n.type === 'operation';

function colLabelFromId(beans: BeanCollection, colId: string): string | null {
    const col = beans.colModel.getColById(colId);
    if (col) {
        return beans.formulae?.getColRef(col) ?? null;
    }
    return null;

}
function colIdFromLabel(beans: BeanCollection, label: string): string | null {
    return beans.formulae?.getColByRef?.(label)?.colId ?? null;
}
function rowIndexFromId(beans: BeanCollection, rowId: string): number | null {
    const row = beans.rowModel?.getRowNode?.(rowId);
    if (row?.rowIndex != null) {
        return row.rowIndex + 1; // convert 0-based to 1-based
    }
    return null;
}
function rowIdFromIndex(beans: BeanCollection, idx: number): string | null {
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
        if (looksLetters) return ref.id.toUpperCase();
        const label = colLabelFromId(beans, ref.id);
        if (label) return label.toUpperCase();
        throw `Cannot produce absolute COLUMN label from id '${ref.id}'`;
    } else {
        if (looksLetters) {
            const id = colIdFromLabel(beans, ref.id);
            if (id) return id;
        }
        return ref.id;
    }
}

function rowValueForREF(beans: BeanCollection, ref: CellRef): string {
    const looksDigits = /^\d+$/.test(ref.id);
    if (ref.absolute) {
        if (looksDigits) return ref.id;
        const idx = rowIndexFromId(beans, ref.id);
        if (idx != null) return String(idx);
        throw `Cannot produce absolute ROW index from id '${ref.id}'`;
    } else {
        if (looksDigits) {
            const id = rowIdFromIndex(beans, Number(ref.id));
            if (id) return id;
        }
        return ref.id;
    }
}

function columnLabelForA1(beans: BeanCollection, ref: CellRef): string {
    const looksLetters = /^[A-Za-z]+$/.test(ref.id);
    if (looksLetters) return ref.id.toUpperCase();
    const label = colLabelFromId(beans, ref.id);
    if (label) return label.toUpperCase();
    throw `Cannot map column id '${ref.id}' to A1 label`;
}

function rowIndexForA1(beans: BeanCollection, ref: CellRef): number {
    const looksDigits = /^\d+$/.test(ref.id);
    if (looksDigits) return Number(ref.id);
    const idx = rowIndexFromId(beans, ref.id);
    if (idx != null) return idx;
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
    const colPart = (r: CellRef) =>
        `COLUMN(${quoteString(columnValueForREF(beans, r))}${r.absolute ? ',true' : ''})`;
    const rowPart = (r: CellRef) =>
        `ROW(${quoteString(rowValueForREF(beans, r))}${r.absolute ? ',true' : ''})`;

    const start = `REF(${colPart(cell.column)},${rowPart(cell.row)}`;
    if (cell.endColumn && cell.endRow) {
        return `${start},${colPart(cell.endColumn)},${rowPart(cell.endRow)})`;
    }
    return `${start})`;
}

function precedenceOf(op: BinaryOperator): number { return BINARY_PRECEDENCE[op]; }

function needsParensInBinary(parentOp: BinaryOperator, child: FormulaNode, side: 'left' | 'right'): boolean {
    if (!isOperationNode(child)) return false;
    if (!isBinaryOp(child.operation)) {
        if (child.operation === '%') return false;
        return false;
    }
    const pParent = precedenceOf(parentOp);
    const pChild = precedenceOf(child.operation);
    if (pChild < pParent) return true;
    if (pChild > pParent) return false;

    if (parentOp === '^') return side === 'left' && child.operation === '^';
    if (parentOp === '-' || parentOp === '/') return side === 'right';
    return false; // '+' and '*'
}

function needsParensForUnaryMinus(child: FormulaNode): boolean {
    if (!isOperationNode(child)) return false;
    if (isBinaryOp(child.operation)) {
        if (child.operation === '^') return false; // -a^b means -(a^b)
        return true; // + - * /
    }
    return false;
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
    useRefFormat: boolean
): string {

    const emitCell = (cell: Cell) =>
        useRefFormat ? serializeCellREF(beans, cell) : serializeCellA1(beans, cell);

    function emit(node: FormulaNode): string {
        if (node.type === 'operand') {
            const v = node.value;
            if (typeof v === 'string') return quoteString(v);
            if (typeof v === 'number') return String(v);
            if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
            return emitCell(v as Cell);
        }

        const op = node.operation;

        // unary minus: represented as '-' with [0, expr]
        if (op === '-' && node.operands.length === 2 &&
            node.operands[0].type === 'operand' && node.operands[0].value === 0) {
            const rhs = node.operands[1];
            const s = emit(rhs);
            return needsParensForUnaryMinus(rhs) ? `-(${s})` : `-${s}`;
        }

        // postfix percent
        if (op === '%' && node.operands.length === 1) {
            return `${emit(node.operands[0])}%`;
        }

        // binary operators
        if (isBinaryOp(op) && node.operands.length === 2) {
            const [l, r] = node.operands;
            const Ls = needsParensInBinary(op, l, 'left') ? `(${emit(l)})` : emit(l);
            const Rs = needsParensInBinary(op, r, 'right') ? `(${emit(r)})` : emit(r);
            return `${Ls}${op}${Rs}`;
        }

        // function call or other op
        return `${op}(${node.operands.map(emit).join(',')})`;
    }

    return '=' + emit(root);
}
