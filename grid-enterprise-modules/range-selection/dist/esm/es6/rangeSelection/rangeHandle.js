import { CellRangeType, SelectionHandleType, _ } from "@ag-grid-community/core";
import { AbstractSelectionHandle } from "./abstractSelectionHandle";
export class RangeHandle extends AbstractSelectionHandle {
    constructor() {
        super(RangeHandle.TEMPLATE);
        this.type = SelectionHandleType.RANGE;
        this.rangeFixed = false;
    }
    onDrag(e) {
        const lastCellHovered = this.getLastCellHovered();
        if (!lastCellHovered) {
            return;
        }
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
                this.rangeService.updateRangeEnd(cellRanges[0], Object.assign(Object.assign({}, this.endPosition), { column: cellRanges[0].columns[0] }), true);
            }
        }
        this.rangeService.extendLatestRangeToCell(this.endPosition);
    }
    onDragEnd(e) {
        const cellRange = _.last(this.rangeService.getCellRanges());
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
RangeHandle.TEMPLATE = `<div class="ag-range-handle"></div>`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2VIYW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcmFuZ2VTZWxlY3Rpb24vcmFuZ2VIYW5kbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUdILGFBQWEsRUFDYixtQkFBbUIsRUFDbkIsQ0FBQyxFQUNKLE1BQU0seUJBQXlCLENBQUM7QUFFakMsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFcEUsTUFBTSxPQUFPLFdBQVksU0FBUSx1QkFBdUI7SUFRcEQ7UUFDSSxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBTHRCLFNBQUksR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7UUFFbkMsZUFBVSxHQUFZLEtBQUssQ0FBQztJQUlwQyxDQUFDO0lBRVMsTUFBTSxDQUFDLENBQWE7UUFDMUIsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFFbEQsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUFFLE9BQU87U0FBRTtRQUVqQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JELE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFckMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1NBQzFCO1FBRUQsSUFBSSxDQUFDLFdBQVcsR0FBRztZQUNmLFFBQVEsRUFBRSxlQUFlLENBQUMsUUFBUTtZQUNsQyxTQUFTLEVBQUUsZUFBZSxDQUFDLFNBQVM7WUFDcEMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxNQUFNO1NBQ2pDLENBQUM7UUFFRiwyQ0FBMkM7UUFDM0MsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLGFBQWEsQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLElBQUksS0FBSyxhQUFhLENBQUMsS0FBSyxFQUFFO1lBQ3JILE1BQU0sVUFBVSxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFFakgsSUFBSSxVQUFVLEVBQUU7Z0JBQ1oseUZBQXlGO2dCQUN6RixJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FDNUIsVUFBVSxDQUFDLENBQUMsQ0FBQyxrQ0FFTixJQUFJLENBQUMsV0FBVyxLQUNuQixNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FFcEMsSUFBSSxDQUNQLENBQUM7YUFDTDtTQUNKO1FBRUQsSUFBSSxDQUFDLFlBQVksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVTLFNBQVMsQ0FBQyxDQUFhO1FBQzdCLE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBRSxDQUFDO1FBRTdELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztJQUM1QixDQUFDO0lBRU8sZ0JBQWdCLENBQUMsU0FBb0I7UUFDekMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMvRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMzRCxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXBDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzlCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQzFCLFNBQVMsQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO0lBQ25DLENBQUM7O0FBaEVNLG9CQUFRLEdBQWMscUNBQXFDLENBQUMifQ==