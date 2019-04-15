import { 
    CellRange,
    RowPositionUtils,
    CellPosition,
    _
} from "ag-grid-community";
import { AbstractSelectionHandle } from "./abstractSelectionHandle";

export class RangeHandle extends AbstractSelectionHandle {

    static TEMPLATE = '<div class="ag-range-handle"></div>';

    protected type = 'range';
    private endPosition: CellPosition;

    constructor() {
        super(RangeHandle.TEMPLATE);
    }

    protected onDrag(e: MouseEvent) {
        const lastCellHovered = this.getLastCellHovered();

        if (!lastCellHovered) { return; }
        const cellRanges = this.rangeController.getCellRanges();
        const lastRange = _.last(cellRanges) as CellRange;

        const newEndRow = {
            rowIndex: lastCellHovered.rowIndex,
            rowPinned: lastCellHovered.rowPinned,
        };

        const rowChanged = !RowPositionUtils.sameRow(newEndRow, this.rangeController.getRangeEndRow(lastRange));

        if (cellRanges.length === 2 && rowChanged) {
            this.rangeController.updateRangeEnd({
                cellRange: cellRanges[0],
                cellPosition: {
                    ...newEndRow,
                    column: cellRanges[0].columns[0]
                }
            });
        }

        if (!rowChanged && _.last(lastRange.columns) === lastCellHovered.column) { return; }
        
        this.endPosition = {
            ...newEndRow,
            column: lastCellHovered.column
        };

        this.rangeController.extendLatestRangeToCell(this.endPosition);
    }

    protected onDragEnd(e: MouseEvent) {
        const cellRange = this.getCellRange();

        const startRow = this.rangeController.getRangeStartRow(cellRange);
        const endRow = this.rangeController.getRangeEndRow(cellRange);
        const column = this.getCellRange().columns[0];

        cellRange.startRow = startRow;
        cellRange.endRow = endRow;
        cellRange.startColumn = column;
    }
}