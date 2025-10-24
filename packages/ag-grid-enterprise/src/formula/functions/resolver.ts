import type { AgColumn, BeanCollection, FormulaParam, RangeParam, RowNode } from 'ag-grid-community';

import type { Cell, CellRef, FormulaNode } from '../ast/utils';
import { FormulaError } from '../ast/utils';
import type { CellFormula } from '../formulaService';

/**
 * This file contains utils for resolving formula AST to values
 */

function isRangeCell(cell: Cell): boolean {
    return !!(cell.endColumn && cell.endRow);
}

// Reference resolution (A1 abs vs id rel)
type CellAddress = { row: RowNode; column: AgColumn };

/** Resolve a Cell to concrete grid objects, honoring absolute vs relative semantics. */
function resolveRefToAddress(beans: BeanCollection, cell: Cell): CellAddress | null {
    const { row, column } = cell;

    const rowNode = row.absolute ? beans.rowModel.getRow(Number(row.id) - 1) : beans.rowModel.getRowNode(row.id);

    const agCol = column.absolute ? beans.formula!.getColByRef(column.id) : beans.colModel.getColById(column.id);

    if (!rowNode || !agCol) {
        return null;
    }
    return { row: rowNode, column: agCol };
}

export function evalAst(
    beans: BeanCollection,
    node: FormulaNode,
    getCellValue: (addr: { row: RowNode; column: AgColumn }) => unknown,
    caller: { row: RowNode; column: AgColumn }
): unknown {
    if (node.type === 'operand') {
        const v = node.value;
        if (typeof v !== 'object') {
            return v; // primitive
        }

        if (isRangeCell(v)) {
            // A bare range in scalar context is not meaningful
            throw new FormulaError('Range is not allowed in scalar context');
        }

        const addr = resolveRefToAddress(beans, v);
        if (!addr) {
            throw new FormulaError('Unknown reference to cell', '#REF!');
        }
        return getCellValue(addr);
    }

    const fn = beans.formula?.getFunction(node.operation);
    if (!fn) {
        throw new FormulaError(`Unsupported operation ${node.operation}`, '#NAME?');
    }

    const { args, values } = makeArgIterables(beans, node.operands, getCellValue, caller);
    return fn({ row: caller.row, column: caller.column, args, values });
}

function operandToArg(
    beans: BeanCollection,
    node: FormulaNode,
    getCellValue: (addr: { row: RowNode; column: AgColumn }) => unknown,
    caller: { row: RowNode; column: AgColumn }
): FormulaParam {
    if (node.type === 'operand') {
        const v = node.value;
        if (typeof v !== 'object') {
            return { kind: 'value', value: v };
        }

        if (isRangeCell(v)) {
            // return a range iterable with range context
            return buildRangeArgLazy(beans, v, getCellValue);
        }

        const addr = resolveRefToAddress(beans, v);
        if (!addr) {
            throw new FormulaError('Unknown reference to cell', '#REF!');
        }
        return { kind: 'value', value: getCellValue(addr) };
    }

    // nested op -> scalar
    const val = evalAst(beans, node, getCellValue, caller);
    return { kind: 'value', value: val };
}

/**
 * Iterator over operands producing FormulaParam (ValueParam or RangeParam).
 */
class ParamsIterator implements Iterator<FormulaParam> {
    private i = 0;
    private readonly res: IteratorResult<FormulaParam> = { done: false, value: undefined as unknown as FormulaParam };

    constructor(
        private readonly beans: BeanCollection,
        private readonly operandNodes: FormulaNode[],
        private readonly getCellValue: (addr: { row: RowNode; column: AgColumn }) => unknown,
        private readonly caller: { row: RowNode; column: AgColumn }
    ) {}

    next(): IteratorResult<FormulaParam> {
        if (this.i >= this.operandNodes.length) {
            this.res.done = true;
            this.res.value = undefined as unknown as FormulaParam;
            return this.res;
        }
        this.res.done = false;
        this.res.value = operandToArg(this.beans, this.operandNodes[this.i++], this.getCellValue, this.caller);
        return this.res;
    }

    [Symbol.iterator](): Iterator<FormulaParam> {
        return this;
    }
}

/** Flattens all ranges and iterates values with no wrapping context */
class ValuesIterator implements Iterator<unknown> {
    private i = 0;
    private inner: Iterator<unknown> | null = null;
    private readonly res: IteratorResult<unknown> = { done: false, value: undefined };

    constructor(
        private readonly beans: BeanCollection,
        private readonly operandNodes: FormulaNode[],
        private readonly getCellValue: (addr: { row: RowNode; column: AgColumn }) => unknown,
        private readonly caller: { row: RowNode; column: AgColumn }
    ) {}

    next(): IteratorResult<unknown> {
        while (true) {
            if (this.inner) {
                const step = this.inner.next();
                if (!step.done) {
                    this.res.done = false;
                    this.res.value = step.value; // mutate same result object
                    return this.res;
                }
                this.inner = null;
                continue;
            }

            if (this.i >= this.operandNodes.length) {
                this.res.done = true;
                this.res.value = undefined;
                return this.res;
            }

            const arg = operandToArg(this.beans, this.operandNodes[this.i++], this.getCellValue, this.caller);

            if (arg.kind === 'value') {
                this.res.done = false;
                this.res.value = arg.value;
                return this.res;
            }

            this.inner = arg[Symbol.iterator]();
        }
    }

    [Symbol.iterator](): Iterator<unknown> {
        return this;
    }
}

/**
 * Fully-lazy iterables with NO generator functions.
 * - args: yields Arg per operand (ValueArg or RangeArg)
 * - flatArgs: flattens ranges on the fly into ValueArg values
 */
function makeArgIterables(
    beans: BeanCollection,
    operandNodes: FormulaNode[],
    getCellValue: (addr: { row: RowNode; column: AgColumn }) => unknown,
    caller: { row: RowNode; column: AgColumn }
): { args: Iterable<FormulaParam>; values: Iterable<unknown> } {
    const args: Iterable<FormulaParam> = {
        [Symbol.iterator](): Iterator<FormulaParam> {
            return new ParamsIterator(beans, operandNodes, getCellValue, caller);
        },
    };
    const values: Iterable<unknown> = {
        [Symbol.iterator](): Iterator<unknown> {
            return new ValuesIterator(beans, operandNodes, getCellValue, caller);
        },
    };
    return { args, values };
}

function resolveRowIndex(beans: BeanCollection, ref: CellRef): number {
    if (ref.absolute) {
        const n = Number(ref.id) - 1;
        if (!Number.isFinite(n) || n < 0) {
            throw new FormulaError('Invalid absolute row', '#REF!');
        }
        return n;
    }
    const node = beans.rowModel?.getRowNode?.(ref.id);
    if (node?.rowIndex == null) {
        throw new FormulaError('Unrecognised row id', '#REF!');
    }
    return node.rowIndex;
}

function resolveCol(beans: BeanCollection, ref: CellRef): AgColumn {
    if (ref.absolute) {
        const col = beans.formula?.getColByRef(ref.id);
        if (!col) {
            throw new FormulaError('Invalid absolute column', '#REF!');
        }
        return col;
    }
    const col = beans.colModel.getColById(ref.id);
    if (!col) {
        throw new FormulaError('Unrecognised column id', '#REF!');
    }
    return col;
}

class RangeValuesIterator implements Iterator<unknown> {
    private cols: AgColumn[] | null = null;

    private currentRowIndex = this.rowStartIndex;
    private currentColIdx = -1;

    private colStartIdx = -1;
    private colEndIdx = -1;

    private readonly res: IteratorResult<unknown> = { done: false, value: undefined };

    constructor(
        private readonly beans: BeanCollection,
        private readonly rowStartIndex: number,
        private readonly rowEndIndex: number,
        private readonly colStart: AgColumn,
        private readonly colEnd: AgColumn,
        private readonly getCellValue: (addr: { row: RowNode; column: AgColumn }) => unknown
    ) {}

    private initColsOnce() {
        if (this.cols) {
            return;
        }

        this.cols = this.beans.colModel.getCols() ?? [];

        const range = getColRangeIndices(this.beans, this.colStart, this.colEnd);
        if (!range) {
            this.colStartIdx = -1;
            this.colEndIdx = -1;
            return;
        }

        [this.colStartIdx, this.colEndIdx] = range;
        this.currentColIdx = this.colStartIdx;
    }

    next(): IteratorResult<unknown> {
        if (!this.cols) {
            this.initColsOnce();

            if (this.colStartIdx < 0) {
                this.res.done = true;
                return this.res;
            }
        }

        if (this.currentRowIndex <= this.rowEndIndex) {
            const row = this.beans.rowModel?.getRow(this.currentRowIndex);
            if (!row) {
                throw new FormulaError('Unrecognised row in range', '#REF!');
            }

            const col = this.cols![this.currentColIdx];

            if (this.currentColIdx < this.colEndIdx) {
                this.currentColIdx++;
            } else {
                this.currentColIdx = this.colStartIdx;
                this.currentRowIndex++;
            }

            this.res.value = this.getCellValue({ row, column: col });
            return this.res;
        }

        this.res.done = true;
        this.res.value = undefined;
        return this.res;
    }
}

function buildRangeArgLazy(
    beans: BeanCollection,
    cell: Cell,
    getCellValue: (addr: { row: RowNode; column: AgColumn }) => unknown
): RangeParam {
    const r1 = resolveRowIndex(beans, cell.row);
    const r2 = cell.endRow ? resolveRowIndex(beans, cell.endRow) : r1;
    const rowStart = Math.min(r1, r2);
    const rowEnd = Math.max(r1, r2);

    const c1 = resolveCol(beans, cell.column);
    const c2 = cell.endColumn ? resolveCol(beans, cell.endColumn) : c1;

    return {
        kind: 'range',
        rowStart,
        rowEnd,
        colStart: c1,
        colEnd: c2,
        [Symbol.iterator](): Iterator<unknown> {
            return new RangeValuesIterator(beans, rowStart, rowEnd, c1, c2, getCellValue);
        },
    };
}

export type Addr = { row: RowNode; column: AgColumn };

function getColRangeIndices(beans: BeanCollection, c1: AgColumn, c2: AgColumn): [number, number] | null {
    const allColumns = beans.colModel.getCols() ?? [];

    let startColIndex: number | null = null;
    let endColIndex: number | null = null;
    for (let i = 0; i < allColumns.length && (startColIndex === null || endColIndex === null); i++) {
        const column = allColumns[i];
        if (column === c2) {
            endColIndex = i;
        }

        if (column === c1) {
            startColIndex = i;
        }

        if (endColIndex !== null && startColIndex !== null) {
            break;
        }
    }

    if (startColIndex === null || endColIndex === null) {
        return null;
    }

    const colIndexMin = Math.min(startColIndex, endColIndex);
    const colIndexMax = Math.max(startColIndex, endColIndex);
    return [colIndexMin, colIndexMax];
}

/** Yields every address in a rectangular range (row/col inclusive), one-by-one. */
function* rangeAddrs(
    beans: BeanCollection,
    rowStartIndex: number,
    rowEndIndex: number,
    startColumn: AgColumn,
    endColumn: AgColumn
): Generator<Addr> {
    const allColumns = beans.colModel.getCols() ?? [];
    const colRange = getColRangeIndices(beans, startColumn, endColumn);
    if (colRange == null) {
        return;
    }

    const [colIndexMin, colIndexMax] = colRange;

    for (let rowIndex = rowStartIndex; rowIndex <= rowEndIndex; rowIndex++) {
        const rowNode = beans.rowModel?.getRow(rowIndex);
        if (!rowNode) {
            continue;
        }
        for (let colIndex = colIndexMin; colIndex <= colIndexMax; colIndex++) {
            yield { row: rowNode, column: allColumns[colIndex] };
        }
    }
}

/**
 * Streams uncached formula dependencies from an AST in traversal order.
 * Skips primitives, non-formula cells, cached formula cells, and already-done cells.
 */
export function* unresolvedDeps(
    beans: BeanCollection,
    root: FormulaNode,
    ensureFormulaCache: (row: RowNode, col: AgColumn) => CellFormula | null
): Generator<Addr> {
    const astStack: FormulaNode[] = [root];

    while (astStack.length) {
        const currentNode = astStack.pop()!;
        if (currentNode.type === 'operand') {
            const operandValue = currentNode.value;

            // Only handle cell-like operands (single cell or range objects) as these need resolved
            if (typeof operandValue !== 'object' || operandValue == null) {
                // primitive -> nothing to yield
                continue;
            }

            // Single-cell reference
            if (!operandValue.endColumn && !operandValue.endRow) {
                const cellAddress = resolveRefToAddress(beans, operandValue);
                if (!cellAddress) {
                    throw new FormulaError('Unrecognised reference to cell', '#REF!');
                }

                const cachedCellFormula = ensureFormulaCache(cellAddress.row, cellAddress.column);
                if (!cachedCellFormula || cachedCellFormula.isValueReady()) {
                    continue; // skip non-formula or already computed
                }

                yield cellAddress; // unmet formula cell
                continue;
            }

            if (!operandValue.endColumn || !operandValue.endRow) {
                throw new FormulaError('Incomplete range reference', '#REF!');
            }

            // Range reference
            const firstRowIndex = resolveRowIndex(beans, operandValue.row);
            const secondRowIndex = resolveRowIndex(beans, operandValue.endRow);
            const rowStartIndex = Math.min(firstRowIndex, secondRowIndex);
            const rowEndIndex = Math.max(firstRowIndex, secondRowIndex);

            const startCol = resolveCol(beans, operandValue.column);
            const endCol = resolveCol(beans, operandValue.endColumn);

            for (const cellAddress of rangeAddrs(beans, rowStartIndex, rowEndIndex, startCol, endCol)) {
                const cachedCellFormula = ensureFormulaCache(cellAddress.row, cellAddress.column);
                if (!cachedCellFormula || cachedCellFormula.isValueReady()) {
                    continue; // skip non-formula or already computed
                }

                yield cellAddress;
            }
            continue;
        }

        // traverse children
        for (let i = 0; i < currentNode.operands.length; i++) {
            astStack.push(currentNode.operands[i]);
        }
    }
}
