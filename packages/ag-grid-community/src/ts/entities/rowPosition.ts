import { Constants } from "../constants";
import {Autowired, Bean} from "../context/context";
import {IRowModel} from "../interfaces/iRowModel";
import {PinnedRowModel} from "../rowModels/pinnedRowModel";
import {RowNode} from "./rowNode";
import { _ } from "../utils";

export interface RowPosition {
    rowIndex: number;
    rowPinned: string | undefined;
}

@Bean('rowPositionUtils')
export class RowPositionUtils {

    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;

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
                if (_.exists(rowB.rowPinned)) {
                    return rowB.rowPinned !== Constants.PINNED_TOP;
                }
                break;
        }
        return rowA.rowIndex < rowB.rowIndex;
    }
}
