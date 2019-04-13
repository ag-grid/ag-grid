import { AbstractSelectionHandle } from "./abstractSelectionHandle";
import { _, CellRange, RowPositionUtils, CellPositionUtils } from "ag-grid-community";

export class RangeHandle extends AbstractSelectionHandle {

    static TEMPLATE = '<div class="ag-range-handle"></div>';

    protected type = 'range';
    private shouldDestroyOnEndDragging: boolean = false;

    constructor() {
        super(RangeHandle.TEMPLATE);
    }

    protected onDrag(e: MouseEvent) {
        const lastCellHovered = this.getLastCellHovered();

        this.dragging = true;

        if (!lastCellHovered ) { return; }
        const cellRanges = this.rangeController.getCellRanges();
        const lastRange = _.last(cellRanges) as CellRange;

        const newEndRow = {
            rowIndex: lastCellHovered.rowIndex,
            rowPinned: lastCellHovered.rowPinned,
        };

        const rowChanged = !RowPositionUtils.sameRow(newEndRow, lastRange.endRow);

        if (cellRanges.length === 2 && rowChanged) {
            this.rangeController.updateRangeEnd({
                cellRange: cellRanges[0],
                cellPosition: {
                    ...newEndRow,
                    column: cellRanges[0].columns[0]
                }
            })
        }
            
        this.rangeController.extendLatestRangeToCell({
            ...newEndRow,
            column: lastCellHovered.column
        });
    }

    protected onDragEnd(e: MouseEvent) {
        if (this.shouldDestroyOnEndDragging) {
            this.destroy();
        }
        this.dragging = false;
    }

    public destroy() {
        const cellComp = this.getCellComp();
        
        if (!this.shouldDestroyOnEndDragging && this.dragging && cellComp && cellComp.isAlive()) {
            _.setVisible(this.getGui(), false);
            this.shouldDestroyOnEndDragging = true;
            return;
        }

        this.shouldDestroyOnEndDragging = false;
        super.destroy();
    }
}