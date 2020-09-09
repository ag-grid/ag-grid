import { Autowired, Bean } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { Constants } from "../constants/constants";
import { IRowModel } from "../interfaces/iRowModel";
import { RowNode } from "./rowNode";
import { PinnedRowModel } from "../pinnedRowModel/pinnedRowModel";
import { exists } from "../utils/generic";
import { PaginationProxy } from "../pagination/paginationProxy";

export interface RowPosition {
    rowIndex: number;
    rowPinned: string | undefined;
}

@Bean('rowPositionUtils')
export class RowPositionUtils extends BeanStub {

    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;

    public getFirstRow(): RowPosition {
        let rowIndex = 0;
        let rowPinned;

        if (this.pinnedRowModel.getPinnedTopRowCount()) {
            rowPinned = Constants.PINNED_TOP;
        } else if (this.rowModel.getRowCount()) {
            rowPinned = null;
            rowIndex = this.paginationProxy.getPageFirstRow();
        } else if (this.pinnedRowModel.getPinnedBottomRowCount()) {
            rowPinned = Constants.PINNED_BOTTOM;
        }

        return rowPinned === undefined ? null : { rowIndex, rowPinned };
    }

    public getLastRow(): RowPosition {
        let rowIndex;
        let rowPinned;

        const pinnedBottomCount = this.pinnedRowModel.getPinnedBottomRowCount();
        const pinnedTopCount = this.pinnedRowModel.getPinnedTopRowCount();

        if (pinnedBottomCount) {
            rowPinned = Constants.PINNED_BOTTOM;
            rowIndex = pinnedBottomCount - 1;
        } else if (this.rowModel.getRowCount()) {
            rowPinned = null;
            rowIndex = this.paginationProxy.getPageLastRow();
        } else if (pinnedTopCount) {
            rowPinned = Constants.PINNED_TOP;
            rowIndex = pinnedTopCount - 1;
        }

        return rowIndex === undefined ? null : { rowIndex, rowPinned };
    }

    public getRowNode(gridRow: RowPosition): RowNode | null {
        switch (gridRow.rowPinned) {
            case Constants.PINNED_TOP:
                return this.pinnedRowModel.getPinnedTopRowData()[gridRow.rowIndex];
            case Constants.PINNED_BOTTOM:
                return this.pinnedRowModel.getPinnedBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    }

    public sameRow(rowA: RowPosition | undefined, rowB: RowPosition | undefined): boolean {
        // if both missing
        if (!rowA && !rowB) { return true; }
        // if only one missing
        if ((rowA && !rowB) || (!rowA && rowB)) { return false; }
        // otherwise compare (use == to compare rowPinned because it can be null or undefined)
        return rowA.rowIndex === rowB.rowIndex && rowA.rowPinned == rowB.rowPinned;
    }

    // tests if this row selection is before the other row selection
    public before(rowA: RowPosition, rowB: RowPosition): boolean {
        switch (rowA.rowPinned) {
            case Constants.PINNED_TOP:
                // we we are floating top, and other isn't, then we are always before
                if (rowB.rowPinned !== Constants.PINNED_TOP) { return true; }
                break;
            case Constants.PINNED_BOTTOM:
                // if we are floating bottom, and the other isn't, then we are never before
                if (rowB.rowPinned !== Constants.PINNED_BOTTOM) { return false; }
                break;
            default:
                // if we are not floating, but the other one is floating...
                if (exists(rowB.rowPinned)) {
                    return rowB.rowPinned !== Constants.PINNED_TOP;
                }
                break;
        }
        return rowA.rowIndex < rowB.rowIndex;
    }
}
