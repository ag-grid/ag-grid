import {
    CellRange,
    CellPosition,
    CellRangeType,
    SelectionHandleType,
    _
} from "@ag-grid-community/core";

import { AbstractSelectionHandle } from "./abstractSelectionHandle";

export class RangeHandle extends AbstractSelectionHandle {

    static TEMPLATE = /* html */ `<div class="ag-range-handle"></div>`;

    protected type = SelectionHandleType.RANGE;
    private endPosition: CellPosition;
    private rangeFixed: boolean = false;

    constructor() {
        super(RangeHandle.TEMPLATE);
    }

    protected onDrag(e: MouseEvent) {
        const lastCellHovered = this.getLastCellHovered();

        if (!lastCellHovered) { return; }

        const cellRanges = this.rangeService.getCellRanges();
        const lastRange = _.last(cellRanges);

        if (!this.rangeFixed) {
            this.fixRangeStartEnd(lastRange);
            this.rangeFixed = true;
        }

        this.endPosition = {
            rowIndex: lastCellHovered.rowIndex,
            rowPinned: lastCellHovered.rowPinned,
            column: lastCellHovered.column
        };

        // check if the cell ranges are for a chart
        if (cellRanges.length === 2 && cellRanges[0].type === CellRangeType.DIMENSION && lastRange.type === CellRangeType.VALUE) {
            const rowChanged = !this.rowPositionUtils.sameRow(this.endPosition, this.rangeService.getRangeEndRow(lastRange));

            if (rowChanged) {
                // ensure the dimension range is kept in sync with the value range (which has the handle)
                this.rangeService.updateRangeEnd(
                    cellRanges[0],
                    {
                        ...this.endPosition,
                        column: cellRanges[0].columns[0]
                    },
                    true,
                );
            }
        }

        this.rangeService.extendLatestRangeToCell(this.endPosition);
    }

    protected onDragEnd(e: MouseEvent) {
        const cellRange = _.last(this.rangeService.getCellRanges())!;

        this.fixRangeStartEnd(cellRange);
        this.rangeFixed = false;
    }

    private fixRangeStartEnd(cellRange: CellRange): void {
        const startRow = this.rangeService.getRangeStartRow(cellRange);
        const endRow = this.rangeService.getRangeEndRow(cellRange);
        const column = cellRange.columns[0];

        cellRange.startRow = startRow;
        cellRange.endRow = endRow;
        cellRange.startColumn = column;
    }
}
