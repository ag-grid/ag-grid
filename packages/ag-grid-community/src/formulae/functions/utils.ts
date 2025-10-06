import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import type { Cell, CellRef, FormulaNode } from '../ast/utils';
import { FormulaError } from '../ast/utils';

function isRangeCell(cell: Cell): boolean {
    return !!(cell.endColumn && cell.endRow);
}

function getRowNode(beans: BeanCollection, cellRef: CellRef): RowNode | undefined {
    if (cellRef.absolute) {
        const idx = Number(cellRef.id) - 1;
        return beans.rowModel.getRow(idx);
    } else {
        return beans.rowModel.getRowNode(cellRef.id);
    }
}

function getColumn(beans: BeanCollection, cellRef: CellRef): AgColumn | undefined {
    if (cellRef.absolute) {
        return beans.formulae?.getColByRef(cellRef.id) ?? undefined;
    } else {
        return beans.colModel.getColById(cellRef.id) ?? undefined;
    }
}

// Reference resolution (A1 abs vs id rel)
type CellAddress = { row: RowNode; column: AgColumn };

/** Resolve a Cell to concrete grid objects, honoring absolute vs relative semantics. */
function resolveRefToAddress(beans: BeanCollection, cell: Cell): CellAddress | null {
    const { row, column } = cell;

    const rowNode = row.absolute ? beans.rowModel.getRow(Number(row.id) - 1) : beans.rowModel.getRowNode(row.id);

    const agCol = column.absolute ? beans.formulae!.getColByRef(column.id) : beans.colModel.getColById(column.id);

    if (!rowNode || !agCol) {
        return null;
    }
    return { row: rowNode, column: agCol };
}

function* expandRangeAddresses(beans: BeanCollection, cell: Cell): Generator<{ row: RowNode; column: AgColumn }> {
    const startRow = getRowNode(beans, cell.row);
    const startCol = getColumn(beans, cell.column);
    if (!startRow || !startCol) {
        return;
    }

    // Single cell
    if (!cell.endColumn || !cell.endRow) {
        yield { row: startRow, column: startCol };
        return;
    }

    // Range
    const endRow = getRowNode(beans, cell.endRow);
    const endCol = getColumn(beans, cell.endColumn);
    if (!endRow || !endCol) {
        return;
    }

    // Column indices from current column order
    const cols = beans.colModel.getCols();
    const startColIdx = cols.indexOf(startCol);
    const endColIdx = cols.indexOf(endCol);
    if (startColIdx == null || endColIdx == null) {
        return;
    }

    // Prefer native rowIndex on RowNode (display index)
    const startRowIdx = (startRow as any).rowIndex ?? 0;
    const endRowIdx = (endRow as any).rowIndex ?? 0;

    const rowLo = Math.min(startRowIdx, endRowIdx);
    const rowHi = Math.max(startRowIdx, endRowIdx);
    const colLo = Math.min(startColIdx, endColIdx);
    const colHi = Math.max(startColIdx, endColIdx);

    for (let ri = rowLo; ri <= rowHi; ri++) {
        const r = beans.rowModel.getRow(ri);
        if (!r) {
            continue;
        }
        for (let ci = colLo; ci <= colHi; ci++) {
            const c = cols[ci];
            if (!c) {
                continue;
            }
            yield { row: r, column: c };
        }
    }
}

const isCellOperand = (v: unknown): v is Cell =>
    !!v && typeof v === 'object' && v !== null && 'row' in (v as any) && 'column' in (v as any);

function makeArgIterator(
    beans: BeanCollection,
    operands: FormulaNode[],
    getCellValue: (addr: { row: RowNode; column: AgColumn }) => unknown
): Iterator<unknown> {
    let i = 0;
    let inner: Iterator<unknown> | null = null;

    const it: Iterator<unknown> = {
        next(): IteratorResult<unknown> {
            // drain inner (e.g., a range) first
            if (inner) {
                const step = inner.next();
                if (!step.done) {
                    return step;
                }
                inner = null;
            }

            // move to next operand
            if (i >= operands.length) {
                return { done: true, value: undefined };
            }
            const node = operands[i++];

            if (node.type === 'operand') {
                const v = node.value;
                if (isCellOperand(v)) {
                    if (isRangeCell(v)) {
                        // iterate all addresses in the range lazily
                        inner = (function* () {
                            for (const addr of expandRangeAddresses(beans, v)) {
                                yield getCellValue(addr);
                            }
                        })();
                        return it.next(); // return first range value
                    } else {
                        const addr = resolveRefToAddress(beans, v);
                        if (!addr) {
                            throw new FormulaError('Unknown reference to cell', '#REF!');
                        }
                        return { done: false, value: getCellValue(addr) };
                    }
                } else {
                    return { done: false, value: v }; // primitive literal
                }
            }

            // Sub-expression as an argument: evaluate to a single scalar lazily
            const val = evalAst(beans, node, getCellValue);
            return { done: false, value: val };
        },
    };

    // iterable for for...of
    (it as any)[Symbol.iterator] = function () {
        return this;
    };
    return it;
}

export function evalAst(
    beans: BeanCollection,
    node: FormulaNode,
    getCellValue: (addr: { row: RowNode; column: AgColumn }) => unknown
): unknown {
    if (node.type === 'operand') {
        const v = node.value;
        if (isCellOperand(v)) {
            if (isRangeCell(v)) {
                // A bare range in scalar context is not meaningful
                throw new FormulaError('Range is not allowed in scalar context', '#PARSE!');
            }
            const addr = resolveRefToAddress(beans, v);
            if (!addr) {
                throw new FormulaError('Unknown reference to cell', '#REF!');
            }
            return getCellValue(addr);
        }
        return v; // primitive literal
    }

    const fn = beans.formulae?.getFunction(node.operation);
    if (!fn) {
        throw new FormulaError(`Unsupported operation ${node.operation}`, '#NAME?');
    }

    const argIter = makeArgIterator(beans, node.operands, getCellValue);
    return fn(argIter);
}

// Lazily yield unique cell addresses (row, column) referenced by an AST.
// - Expands ranges on the fly (A1:B3 - many addresses)
// - Deduplicates by (row.id, column id)
// - DFS traversal; order is not guaranteed
export function* iterateCellAddresses(
    beans: BeanCollection,
    root: FormulaNode
): Generator<{ row: RowNode; column: AgColumn }> {
    const seen = new Set<string>();
    const stack: FormulaNode[] = [root];

    const colKey = (c: AgColumn) => (c as any).getId?.() ?? (c as any).colId ?? String(c);

    while (stack.length) {
        const node = stack.pop()!;
        if (node.type === 'operand') {
            const v = node.value;
            if (isCellOperand(v)) {
                if (isRangeCell(v)) {
                    for (const addr of expandRangeAddresses(beans, v)) {
                        const key = addr.row.id + '§' + colKey(addr.column);
                        if (!seen.has(key)) {
                            seen.add(key);
                            yield addr;
                        }
                    }
                } else {
                    const addr = resolveRefToAddress(beans, v);
                    if (addr) {
                        const key = addr.row.id + '§' + colKey(addr.column);
                        if (!seen.has(key)) {
                            seen.add(key);
                            yield addr;
                        }
                    }
                }
            }
        } else {
            const ops = node.operands;
            for (let i = ops.length - 1; i >= 0; i--) {
                stack.push(ops[i]);
            }
        }
    }
}

// Helpers for funcs below
const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Convert a value to a finite number, allowing numeric strings; else throw. */
function coerceFiniteNumber(fname: string, v: unknown): number {
    if (isFiniteNumber(v)) {
        return v;
    }

    if (typeof v === 'string') {
        const n = Number(v.trim());
        if (Number.isFinite(n)) {
            return n;
        }
    }

    throw new FormulaError(`${fname}: values must be numeric`, '#PARSE!');
}

/** Iterate all iterator values; call `onValue(num)` for each numeric (with coercion). */
export function forEachNumber(it: Iterator<unknown>, fname: string, onValue: (num: number) => void): void {
    for (let t = it.next(); !t.done; t = it.next()) {
        onValue(coerceFiniteNumber(fname, t.value));
    }
}

/** Read exactly N numeric values from the iterator; error on too few or too many. */
export function readExactlyN(it: Iterator<unknown>, fname: string, n: number): number[] {
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
        const t = it.next();
        if (t.done) {
            throw new FormulaError(`${fname}: requires exactly ${n} value(s)`, '#PARSE!');
        }
        out.push(coerceFiniteNumber(fname, t.value));
    }
    if (!it.next().done) {
        throw new FormulaError(`${fname}: too many values`, '#PARSE!');
    }
    return out;
}

/** Reduce at least one numeric value; `initial=null` means "seed with first value". */
export function reduceAtLeastOne(
    it: Iterator<unknown>,
    fname: string,
    reducer: (acc: number, v: number) => number,
    initial: number | null // null - seed with first number
): number {
    let have = false;
    let acc = initial as number;

    for (let t = it.next(); !t.done; t = it.next()) {
        const v = coerceFiniteNumber(fname, t.value);
        if (!have) {
            have = true;
            acc = initial === null ? v : reducer(acc, v);
        } else {
            acc = reducer(acc, v);
        }
    }

    if (!have) {
        throw new FormulaError(`${fname}: requires at least one value`, '#PARSE!');
    }
    return acc;
}
