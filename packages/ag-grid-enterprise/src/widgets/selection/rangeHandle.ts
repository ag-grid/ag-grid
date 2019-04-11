import { AbstractSelectionHandle } from "./abstractSelectionHandle";
import { CellComp } from "ag-grid-community";

export class RangeHandle extends AbstractSelectionHandle {

    static TEMPLATE = '<div class="ag-range-handle"></div>';

    constructor() {
        super(RangeHandle.TEMPLATE);
    }

    onDrag(e: MouseEvent) {

    }

    onDragEnd(e: MouseEvent) {

    }

    refresh(cellComp: CellComp) {

    }
}