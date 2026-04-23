import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';
import type { FilterManager } from '../filter/filterManager';
import type { ClientSideRowModelStage } from '../interfaces/iClientSideRowModel';
import type { IRowNodeFilterStage } from '../interfaces/iRowNodeStage';

export class FilterStage extends BeanStub implements IRowNodeFilterStage, NamedBean {
    beanName = 'filterStage' as const;

    public readonly step: ClientSideRowModelStage = 'filter';
    public readonly refreshProps = null;

    private filterManager?: FilterManager;

    public wireBeans(beans: BeanCollection): void {
        this.filterManager = beans.filterManager;
    }

    public execute(): void {
        const beans = this.beans;
        const rootNode = beans.rowModel.rootNode!;
        const rows = rootNode.childrenAfterGroup!;
        const len = rows.length;
        const fm = this.filterManager;
        const active = !!fm?.isChildFilterPresent();

        if (beans.formula?.active) {
            rootNode.childrenAfterFilter = rows;
            if (active) {
                for (let i = 0; i < len; ++i) {
                    const row = rows[i];
                    row.softFiltered = !fm!.doesRowPassFilter(row);
                }
            } else {
                for (let i = 0; i < len; ++i) {
                    rows[i].softFiltered = false;
                }
            }
        } else if (active) {
            rootNode.childrenAfterFilter = filterFlat(rows, len, rootNode.childrenAfterFilter ?? rows, fm!);
        } else {
            rootNode.childrenAfterFilter = rows;
        }
    }
}

/**
 * Filters flat rows by calling `doesRowPassFilter` on each row.
 *
 * Returns the previous result (`prev`) by reference when the filtered output is identical,
 * or the input `rows` array when every row passes — both cases allocate nothing.
 * A new array is only created when the result actually differs from `prev`.
 *
 * Algorithm (two-phase):
 * 1. **Compare phase** — iterate rows, checking each against `prev[n]` where `n` is the number
 *    of passing rows seen so far.
 *    While every passing row matches `prev` at the same index, no memory is allocated.
 * 2. **Build phase** (`filterFlatBuild`) — entered on first mismatch.
 *    Slices the matching prefix from `prev` and pushes remaining passing rows into the new array.
 */
const filterFlat = (rows: RowNode[], len: number, prev: RowNode[], fm: FilterManager): RowNode[] => {
    const prevLen = prev.length;
    let n = 0;
    for (let i = 0; i < len; ++i) {
        const row = rows[i];
        if (fm.doesRowPassFilter(row)) {
            if (n >= prevLen || prev[n] !== row) {
                return filterFlatBuild(rows, len, i, n, prev, fm);
            }
            ++n;
        } else if (n < prevLen) {
            return filterFlatBuild(rows, len, i, n, prev, fm);
        }
    }
    return n === prevLen ? prev : rows;
};

/** Cold path: result diverged at rows[i] with n rows matched so far. Build new array. */
const filterFlatBuild = (
    rows: RowNode[],
    len: number,
    i: number,
    n: number,
    prev: RowNode[],
    fm: FilterManager
): RowNode[] => {
    const result = n > 0 ? prev.slice(0, n) : [];
    while (i < len) {
        const row = rows[i++];
        if (fm.doesRowPassFilter(row)) {
            result.push(row);
        }
    }
    return result;
};
