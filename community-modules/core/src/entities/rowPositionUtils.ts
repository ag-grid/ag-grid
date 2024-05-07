import { Autowired, Bean } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { IRowModel } from "../interfaces/iRowModel";
import { RowNode } from "./rowNode";
import { RowPinnedType } from "../interfaces/iRowNode";
import { exists } from "../utils/generic";
import { PaginationProxy } from "../pagination/paginationProxy";

export interface RowPosition {
    /** A positive number from 0 to n, where n is the last row the grid is rendering
    * or -1 if you want to navigate to the grid header */
    rowIndex: number;

    /** Either 'top', 'bottom' or null/undefined (for not pinned) */
    rowPinned: RowPinnedType;
}

@Bean('rowPositionUtils')
export class RowPositionUtils extends BeanStub {

    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;

    public getFirstRow(): RowPosition | null {
        let rowIndex = 0;
        let rowPinned: RowPinnedType;

       if (this.rowModel.getRowCount()) {
            rowPinned = null;
            rowIndex = this.paginationProxy.getPageFirstRow();
        }

        return rowPinned === undefined ? null : { rowIndex, rowPinned };
    }

    public getLastRow(): RowPosition | null {
        let rowIndex;
        let rowPinned: RowPinnedType = null;
        if (this.rowModel.getRowCount()) {
            rowPinned = null;
            rowIndex = this.paginationProxy.getPageLastRow();
        } 

        return rowIndex === undefined ? null : { rowIndex, rowPinned };
    }

    public getRowNode(gridRow: RowPosition): RowNode | undefined {
        return this.rowModel.getRow(gridRow.rowIndex);
    }

    public sameRow(rowA: RowPosition | undefined, rowB: RowPosition | undefined): boolean {
        // if both missing
        if (!rowA && !rowB) { return true; }
        // if only one missing
        if ((rowA && !rowB) || (!rowA && rowB)) { return false; }
        // otherwise compare (use == to compare rowPinned because it can be null or undefined)
        return rowA!.rowIndex === rowB!.rowIndex && rowA!.rowPinned == rowB!.rowPinned;
    }

    // tests if this row selection is before the other row selection
    public before(rowA: RowPosition, rowB: RowPosition): boolean {
        switch (rowA.rowPinned) {
            case 'top':
                // we we are floating top, and other isn't, then we are always before
                if (rowB.rowPinned !== 'top') { return true; }
                break;
            case 'bottom':
                // if we are floating bottom, and the other isn't, then we are never before
                if (rowB.rowPinned !== 'bottom') { return false; }
                break;
            default:
                // if we are not floating, but the other one is floating...
                if (exists(rowB.rowPinned)) {
                    return rowB.rowPinned !== 'top';
                }
                break;
        }
        return rowA.rowIndex < rowB.rowIndex;
    }
}
