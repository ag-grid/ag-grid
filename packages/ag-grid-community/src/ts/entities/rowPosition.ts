import { Constants } from "../constants";
import { _ } from "../utils";

export interface RowPosition {
    rowIndex: number;
    rowPinned: string | undefined;
}

export class RowPositionUtils {

    public static sameRow(rowA: RowPosition | undefined, rowB: RowPosition | undefined): boolean {
        // if both missing
        if (!rowA && !rowB) { return true; }
        // if only one missing
        if ((rowA && !rowB) || (!rowA && rowB)) { return false; }
        // otherwise compare (use == to compare rowPinned because it can be null or undefined)
        return rowA.rowIndex === rowB.rowIndex && rowA.rowPinned == rowB.rowPinned;
    }

    // tests if this row selection is before the other row selection
    public static before(rowA: RowPosition, rowB: RowPosition): boolean {
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
                    if (rowB.rowPinned === Constants.PINNED_TOP) {
                        // we are not floating, other is floating top, we are first
                        return false;
                    } else {
                        // we are not floating, other is floating bottom, we are always first
                        return true;
                    }
                }
                break;
        }
        return rowA.rowIndex < rowB.rowIndex;
    }
}
