"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangeHandle = void 0;
const core_1 = require("@ag-grid-community/core");
const abstractSelectionHandle_1 = require("./abstractSelectionHandle");
class RangeHandle extends abstractSelectionHandle_1.AbstractSelectionHandle {
    constructor() {
        super(RangeHandle.TEMPLATE);
        this.type = core_1.SelectionHandleType.RANGE;
        this.rangeFixed = false;
    }
    onDrag(e) {
        const lastCellHovered = this.getLastCellHovered();
        if (!lastCellHovered) {
            return;
        }
        const cellRanges = this.rangeService.getCellRanges();
        const lastRange = core_1._.last(cellRanges);
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
        if (cellRanges.length === 2 && cellRanges[0].type === core_1.CellRangeType.DIMENSION && lastRange.type === core_1.CellRangeType.VALUE) {
            const rowChanged = !this.rowPositionUtils.sameRow(this.endPosition, this.rangeService.getRangeEndRow(lastRange));
            if (rowChanged) {
                // ensure the dimension range is kept in sync with the value range (which has the handle)
                this.rangeService.updateRangeEnd(cellRanges[0], Object.assign(Object.assign({}, this.endPosition), { column: cellRanges[0].columns[0] }), true);
            }
        }
        this.rangeService.extendLatestRangeToCell(this.endPosition);
    }
    onDragEnd(e) {
        const cellRange = core_1._.last(this.rangeService.getCellRanges());
        this.fixRangeStartEnd(cellRange);
        this.rangeFixed = false;
    }
    fixRangeStartEnd(cellRange) {
        const startRow = this.rangeService.getRangeStartRow(cellRange);
        const endRow = this.rangeService.getRangeEndRow(cellRange);
        const column = cellRange.columns[0];
        cellRange.startRow = startRow;
        cellRange.endRow = endRow;
        cellRange.startColumn = column;
    }
}
exports.RangeHandle = RangeHandle;
RangeHandle.TEMPLATE = `<div class="ag-range-handle"></div>`;
