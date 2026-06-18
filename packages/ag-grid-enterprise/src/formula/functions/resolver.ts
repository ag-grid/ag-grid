import type { AgColumn, BeanCollection, FormulaParam, RangeParam, RowNode } from 'ag-grid-community';

import type { Cell, CellRef, FormulaNode } from '../ast/utils';
import { FormulaError } from '../ast/utils';
import type { CellFormula } from '../cellFormula';
import { getFormulaRowByIndex, getFormulaRowIndex, isFormulaRowAvailable } from '../rowAccess';

/**
 * This file contains utils for resolving formula AST to values
 */

/**
 * Per-eval cycle-detection state. Tracked as row -> set-of-visiting-columns so push/pop of an
 * eval frame maps to a single add/remove on a cell's set. A fresh map is allocated at the
 * outermost `resolveValue` call and reused across nested evals (so a valueGetter that chains
 * into another formula shares the visiting set and doesn't raise false-positive cycles).
 */
export type FormulaVisitorContext = Map<RowNode, Set<AgColumn>>;

/**
 * Contract the eval loop (`evalAst`, `unresolvedDeps`, error propagation) needs. FormulaService
 * implements this directly so we pass `this` and avoid allocating bound callbacks.
 */
export interface FormulaResolver {
    ensureCellFormula(row: RowNode, col: AgColumn): CellFormula | null;
    resolveAddrRef(addr: Addr): unknown;
}

/** Mark `(r, c)` as visiting. Throws FormulaError(51) if already visiting (cycle). */
export function formulaVisitorSetVisiting(ctx: FormulaVisitorContext, r: RowNode, c: AgColumn): void {
    let colSet = ctx.get(r);
    if (colSet?.has(c)) {
        throw new FormulaError(51);
    }
    if (!colSet) {
        colSet = new Set<AgColumn>();
        ctx.set(r, colSet);
    }
    colSet.add(c);
}

/** Mark `(r, c)` as visited. Cleans up the row's entry when its column set becomes empty. */
export function formulaVisitorSetVisited(ctx: FormulaVisitorContext, r: RowNode, c: AgColumn): void {
    const colSet = ctx.get(r);
    if (colSet) {
        colSet.delete(c);
        if (colSet.size === 0) {
            ctx.delete(r);
        }
    }
}

function isRangeCell(cell: Cell): boolean {
    return !!(cell.endColumn && cell.endRow);
}

// Reference resolution (A1 abs vs id rel)
type CellAddress = { row: RowNode; column: AgColumn };

/** Resolve a Cell to concrete grid objects, honouring absolute vs relative semantics. */
function resolveRefToAddress(
    beans: BeanCollection,
    cell: Cell,
    caller?: { row: RowNode; column: AgColumn }
): CellAddress | null {
    const { row, column } = cell;

    if (row.current && !caller?.row) {
        // fail when a same-row reference is evaluated without a caller,
        // instead of silently returning null and showing a generic reference error.
        throw new FormulaError(29);
    }

    const rowNode = row.current
        ? caller!.row
        : row.absolute
          ? getFormulaRowByIndex(beans, Number(row.id) - 1)
          : beans.rowModel.getRowNode(row.id);

    const agCol = column.absolute ? beans.formula!.getColByRef(column.id) : beans.colModel.colsById[column.id];

    if (!rowNode || (!row.current && !isFormulaRowAvailable(rowNode)) || !agCol) {
        return null;
    }
    return { row: rowNode, column: agCol };
}

export function evalAst(
    beans: BeanCollection,
    node: FormulaNode,
    resolver: FormulaResolver,
    caller: { row: RowNode; column: AgColumn }
): unknown {
    if (node.type === 'operand') {
        const v = node.value;
        if (typeof v !== 'object' || v == null) {
            return v; // primitive
        }

        if (isRangeCell(v)) {
            // A bare range in scalar context is not meaningful
            throw new FormulaError(25);
        }

        const addr = resolveRefToAddress(beans, v, caller);
        if (!addr) {
            throw new FormulaError(26);
        }
        return resolver.resolveAddrRef(addr);
    }

    const fn = beans.formula?.getFunction(node.operation);
    if (!fn) {
        throw new FormulaError(27, [node.operation]);
    }

    const { args, values } = makeArgIterables(beans, node.operands, resolver, caller);
    return fn({ row: caller.row, column: caller.column, args, values });
}

function operandToArg(
    beans: BeanCollection,
    node: FormulaNode,
    resolver: FormulaResolver,
    caller: { row: RowNode; column: AgColumn }
): FormulaParam {
    if (node.type === 'operand') {
        const v = node.value;
        if (typeof v !== 'object' || v == null) {
            return { kind: 'value', value: v };
        }

        if (isRangeCell(v)) {
            // return a range iterable with range context
            return buildRangeArgLazy(beans, v, resolver, caller);
        }

        const addr = resolveRefToAddress(beans, v, caller);
        if (!addr) {
            throw new FormulaError(26);
        }
        return { kind: 'value', value: resolver.resolveAddrRef(addr) };
    }

    // nested op -> scalar
    const val = evalAst(beans, node, resolver, caller);
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
        private readonly resolver: FormulaResolver,
        private readonly caller: { row: RowNode; column: AgColumn }
    ) {}

    next(): IteratorResult<FormulaParam> {
        if (this.i >= this.operandNodes.length) {
            this.res.done = true;
            this.res.value = undefined as unknown as FormulaParam;
            return this.res;
        }
        this.res.done = false;
        this.res.value = operandToArg(this.beans, this.operandNodes[this.i++], this.resolver, this.caller);
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
        private readonly resolver: FormulaResolver,
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

            const arg = operandToArg(this.beans, this.operandNodes[this.i++], this.resolver, this.caller);

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
    resolver: FormulaResolver,
    caller: { row: RowNode; column: AgColumn }
): { args: Iterable<FormulaParam>; values: Iterable<unknown> } {
    const args: Iterable<FormulaParam> = {
        [Symbol.iterator](): Iterator<FormulaParam> {
            return new ParamsIterator(beans, operandNodes, resolver, caller);
        },
    };
    const values: Iterable<unknown> = {
        [Symbol.iterator](): Iterator<unknown> {
            return new ValuesIterator(beans, operandNodes, resolver, caller);
        },
    };
    return { args, values };
}

function resolveRowIndex(beans: BeanCollection, ref: CellRef, caller?: { row: RowNode; column: AgColumn }): number {
    if (ref.current) {
        const currentRowIndex = caller?.row ? getFormulaRowIndex(caller.row) : null;
        if (currentRowIndex == null) {
            throw new FormulaError(29);
        }
        return currentRowIndex;
    }
    if (ref.absolute) {
        const n = Number(ref.id) - 1;
        if (!Number.isFinite(n) || n < 0) {
            throw new FormulaError(28);
        }
        return n;
    }
    const node = beans.rowModel?.getRowNode?.(ref.id);
    const rowIndex = node ? getFormulaRowIndex(node) : null;
    if (rowIndex == null) {
        throw new FormulaError(29);
    }
    return rowIndex;
}

function resolveCol(beans: BeanCollection, ref: CellRef): AgColumn {
    if (ref.absolute) {
        const col = beans.formula?.getColByRef(ref.id);
        if (!col) {
            throw new FormulaError(30);
        }
        return col;
    }
    const col = beans.colModel.colsById[ref.id];
    if (!col) {
        throw new FormulaError(31);
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
        private readonly resolver: FormulaResolver
    ) {}

    private initColsOnce() {
        if (this.cols) {
            return;
        }

        this.cols = this.beans.colModel.colsList;

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
            const row = getFormulaRowByIndex(this.beans, this.currentRowIndex);
            if (!row) {
                throw new FormulaError(32);
            }

            const col = this.cols![this.currentColIdx];

            if (this.currentColIdx < this.colEndIdx) {
                this.currentColIdx++;
            } else {
                this.currentColIdx = this.colStartIdx;
                this.currentRowIndex++;
            }

            this.res.value = this.resolver.resolveAddrRef({ row, column: col });
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
    resolver: FormulaResolver,
    caller?: { row: RowNode; column: AgColumn }
): RangeParam {
    const r1 = resolveRowIndex(beans, cell.row, caller);
    const r2 = cell.endRow ? resolveRowIndex(beans, cell.endRow, caller) : r1;
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
            return new RangeValuesIterator(beans, rowStart, rowEnd, c1, c2, resolver);
        },
    };
}

export type Addr = { row: RowNode; column: AgColumn };

function getColRangeIndices(beans: BeanCollection, c1: AgColumn, c2: AgColumn): [number, number] | null {
    const allColumns = beans.colModel.colsList;

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
    const allColumns = beans.colModel.colsList;
    const colRange = getColRangeIndices(beans, startColumn, endColumn);
    if (colRange == null) {
        return;
    }

    const [colIndexMin, colIndexMax] = colRange;

    for (let rowIndex = rowStartIndex; rowIndex <= rowEndIndex; rowIndex++) {
        const rowNode = getFormulaRowByIndex(beans, rowIndex);
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
    resolver: FormulaResolver,
    caller?: { row: RowNode; column: AgColumn }
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
                const cellAddress = resolveRefToAddress(beans, operandValue, caller);
                if (!cellAddress) {
                    throw new FormulaError(33);
                }

                const cachedCellFormula = resolver.ensureCellFormula(cellAddress.row, cellAddress.column);
                if (!cachedCellFormula || cachedCellFormula.isValueReady()) {
                    continue; // skip non-formula or already computed
                }

                yield cellAddress; // unmet formula cell
                continue;
            }

            if (!operandValue.endColumn || !operandValue.endRow) {
                throw new FormulaError(34);
            }

            // Range reference
            const firstRowIndex = resolveRowIndex(beans, operandValue.row, caller);
            const secondRowIndex = resolveRowIndex(beans, operandValue.endRow, caller);
            const rowStartIndex = Math.min(firstRowIndex, secondRowIndex);
            const rowEndIndex = Math.max(firstRowIndex, secondRowIndex);

            const startCol = resolveCol(beans, operandValue.column);
            const endCol = resolveCol(beans, operandValue.endColumn);

            for (const cellAddress of rangeAddrs(beans, rowStartIndex, rowEndIndex, startCol, endCol)) {
                const cachedCellFormula = resolver.ensureCellFormula(cellAddress.row, cellAddress.column);
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
