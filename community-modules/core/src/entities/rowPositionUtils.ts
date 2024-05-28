import { BeanStub } from '../context/beanStub';
import type { BeanCollection, BeanName } from '../context/context';
import type { IRowModel } from '../interfaces/iRowModel';
import type { RowPinnedType } from '../interfaces/iRowNode';
import type { PaginationProxy } from '../pagination/paginationProxy';
import type { PinnedRowModel } from '../pinnedRowModel/pinnedRowModel';
import { _exists } from '../utils/generic';
import type { RowNode } from './rowNode';

export interface RowPosition {
    /** A positive number from 0 to n, where n is the last row the grid is rendering
     * or -1 if you want to navigate to the grid header */
    rowIndex: number;

    /** Either 'top', 'bottom' or null/undefined (for not pinned) */
    rowPinned: RowPinnedType;
}

export class RowPositionUtils extends BeanStub {
    beanName: BeanName = 'rowPositionUtils';

    private rowModel: IRowModel;
    private pinnedRowModel: PinnedRowModel;
    private paginationProxy: PaginationProxy;

    public wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.rowModel = beans.rowModel;
        this.pinnedRowModel = beans.pinnedRowModel;
        this.paginationProxy = beans.paginationProxy;
    }

    public getFirstRow(): RowPosition | null {
        let rowIndex = 0;
        let rowPinned: RowPinnedType;

        if (this.pinnedRowModel.getPinnedTopRowCount()) {
            rowPinned = 'top';
        } else if (this.rowModel.getRowCount()) {
            rowPinned = null;
            rowIndex = this.paginationProxy.getPageFirstRow();
        } else if (this.pinnedRowModel.getPinnedBottomRowCount()) {
            rowPinned = 'bottom';
        }

        return rowPinned === undefined ? null : { rowIndex, rowPinned };
    }

    public getLastRow(): RowPosition | null {
        let rowIndex;
        let rowPinned: RowPinnedType = null;

        const pinnedBottomCount = this.pinnedRowModel.getPinnedBottomRowCount();
        const pinnedTopCount = this.pinnedRowModel.getPinnedTopRowCount();

        if (pinnedBottomCount) {
            rowPinned = 'bottom';
            rowIndex = pinnedBottomCount - 1;
        } else if (this.rowModel.getRowCount()) {
            rowPinned = null;
            rowIndex = this.paginationProxy.getPageLastRow();
        } else if (pinnedTopCount) {
            rowPinned = 'top';
            rowIndex = pinnedTopCount - 1;
        }

        return rowIndex === undefined ? null : { rowIndex, rowPinned };
    }

    public getRowNode(gridRow: RowPosition): RowNode | undefined {
        switch (gridRow.rowPinned) {
            case 'top':
                return this.pinnedRowModel.getPinnedTopRowData()[gridRow.rowIndex];
            case 'bottom':
                return this.pinnedRowModel.getPinnedBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    }

    public sameRow(rowA: RowPosition | undefined, rowB: RowPosition | undefined): boolean {
        // if both missing
        if (!rowA && !rowB) {
            return true;
        }
        // if only one missing
        if ((rowA && !rowB) || (!rowA && rowB)) {
            return false;
        }
        // otherwise compare (use == to compare rowPinned because it can be null or undefined)
        return rowA!.rowIndex === rowB!.rowIndex && rowA!.rowPinned == rowB!.rowPinned;
    }

    // tests if this row selection is before the other row selection
    public before(rowA: RowPosition, rowB: RowPosition): boolean {
        switch (rowA.rowPinned) {
            case 'top':
                // we we are floating top, and other isn't, then we are always before
                if (rowB.rowPinned !== 'top') {
                    return true;
                }
                break;
            case 'bottom':
                // if we are floating bottom, and the other isn't, then we are never before
                if (rowB.rowPinned !== 'bottom') {
                    return false;
                }
                break;
            default:
                // if we are not floating, but the other one is floating...
                if (_exists(rowB.rowPinned)) {
                    return rowB.rowPinned !== 'top';
                }
                break;
        }
        return rowA.rowIndex < rowB.rowIndex;
    }
}
