import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { IRowModel } from '../interfaces/iRowModel';
import type { RowPinnedType } from '../interfaces/iRowNode';
import type { RowPosition } from '../interfaces/iRowPosition';
import type { PageBoundsService } from '../pagination/pageBoundsService';
import type { PinnedRowModel } from '../pinnedRowModel/pinnedRowModel';
import { _exists } from '../utils/generic';
import type { RowNode } from './rowNode';

// tests if this row selection is before the other row selection
export function _isRowBefore(rowA: RowPosition, rowB: RowPosition): boolean {
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

export function _isSameRow(rowA: RowPosition | undefined, rowB: RowPosition | undefined): boolean {
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

export class RowPositionUtils extends BeanStub implements NamedBean {
    beanName = 'rowPositionUtils' as const;

    private rowModel: IRowModel;
    private pinnedRowModel?: PinnedRowModel;
    private pageBoundsService: PageBoundsService;

    public wireBeans(beans: BeanCollection): void {
        this.rowModel = beans.rowModel;
        this.pinnedRowModel = beans.pinnedRowModel;
        this.pageBoundsService = beans.pageBoundsService;
    }

    public getFirstRow(): RowPosition | null {
        let rowIndex = 0;
        let rowPinned: RowPinnedType;

        if (this.pinnedRowModel?.getPinnedTopRowCount()) {
            rowPinned = 'top';
        } else if (this.rowModel.getRowCount()) {
            rowPinned = null;
            rowIndex = this.pageBoundsService.getFirstRow();
        } else if (this.pinnedRowModel?.getPinnedBottomRowCount()) {
            rowPinned = 'bottom';
        }

        return rowPinned === undefined ? null : { rowIndex, rowPinned };
    }

    public getLastRow(): RowPosition | null {
        let rowIndex;
        let rowPinned: RowPinnedType = null;

        const pinnedBottomCount = this.pinnedRowModel?.getPinnedBottomRowCount();
        const pinnedTopCount = this.pinnedRowModel?.getPinnedTopRowCount();

        if (pinnedBottomCount) {
            rowPinned = 'bottom';
            rowIndex = pinnedBottomCount - 1;
        } else if (this.rowModel.getRowCount()) {
            rowPinned = null;
            rowIndex = this.pageBoundsService.getLastRow();
        } else if (pinnedTopCount) {
            rowPinned = 'top';
            rowIndex = pinnedTopCount - 1;
        }

        return rowIndex === undefined ? null : { rowIndex, rowPinned };
    }

    public getRowNode(gridRow: RowPosition): RowNode | undefined {
        switch (gridRow.rowPinned) {
            case 'top':
                return this.pinnedRowModel?.getPinnedTopRow(gridRow.rowIndex);
            case 'bottom':
                return this.pinnedRowModel?.getPinnedBottomRow(gridRow.rowIndex);
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    }
}
