import { AbstractSelectionHandle } from "./abstractSelectionHandle";
import { CellPosition, _, CellComp } from "ag-grid-community";

export class RangeHandle extends AbstractSelectionHandle {

    static TEMPLATE = '<div class="ag-range-handle"></div>';

    protected type = 'range';
    private dragging: boolean = false;
    private shouldDestroyOnEndDragging: boolean = false;

    constructor() {
        super(RangeHandle.TEMPLATE);
    }

    protected onDrag(e: MouseEvent) {
        const lastCellHovered = this.getLastCellHovered();
        this.dragging = true;

        if (lastCellHovered) {
            this.rangeController.extendLatestRangeToCell({
                rowIndex: lastCellHovered!.rowIndex,
                rowPinned: lastCellHovered!.rowPinned,
                column: lastCellHovered!.column
            });
        }
    }

    protected onDragEnd(e: MouseEvent) {
        this.dragging = false;
        if (this.shouldDestroyOnEndDragging) {
            this.destroy();
        }
    }

    public destroy() {
        const cellComp = this.getCellComp();

        if (this.dragging && cellComp && cellComp.isAlive()) {
            _.setVisible(this.getGui(), false);
            this.shouldDestroyOnEndDragging = true;
            return;
        }

        this.shouldDestroyOnEndDragging = false;
        super.destroy();
    }
}