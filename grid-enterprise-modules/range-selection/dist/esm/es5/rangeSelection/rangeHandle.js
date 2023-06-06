var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { CellRangeType, SelectionHandleType, _ } from "@ag-grid-community/core";
import { AbstractSelectionHandle } from "./abstractSelectionHandle";
var RangeHandle = /** @class */ (function (_super) {
    __extends(RangeHandle, _super);
    function RangeHandle() {
        var _this = _super.call(this, RangeHandle.TEMPLATE) || this;
        _this.type = SelectionHandleType.RANGE;
        _this.rangeFixed = false;
        return _this;
    }
    RangeHandle.prototype.onDrag = function (e) {
        var lastCellHovered = this.getLastCellHovered();
        if (!lastCellHovered) {
            return;
        }
        var cellRanges = this.rangeService.getCellRanges();
        var lastRange = _.last(cellRanges);
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
            var rowChanged = !this.rowPositionUtils.sameRow(this.endPosition, this.rangeService.getRangeEndRow(lastRange));
            if (rowChanged) {
                // ensure the dimension range is kept in sync with the value range (which has the handle)
                this.rangeService.updateRangeEnd(cellRanges[0], __assign(__assign({}, this.endPosition), { column: cellRanges[0].columns[0] }), true);
            }
        }
        this.rangeService.extendLatestRangeToCell(this.endPosition);
    };
    RangeHandle.prototype.onDragEnd = function (e) {
        var cellRange = _.last(this.rangeService.getCellRanges());
        this.fixRangeStartEnd(cellRange);
        this.rangeFixed = false;
    };
    RangeHandle.prototype.fixRangeStartEnd = function (cellRange) {
        var startRow = this.rangeService.getRangeStartRow(cellRange);
        var endRow = this.rangeService.getRangeEndRow(cellRange);
        var column = cellRange.columns[0];
        cellRange.startRow = startRow;
        cellRange.endRow = endRow;
        cellRange.startColumn = column;
    };
    RangeHandle.TEMPLATE = "<div class=\"ag-range-handle\"></div>";
    return RangeHandle;
}(AbstractSelectionHandle));
export { RangeHandle };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2VIYW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcmFuZ2VTZWxlY3Rpb24vcmFuZ2VIYW5kbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBR0gsYUFBYSxFQUNiLG1CQUFtQixFQUNuQixDQUFDLEVBQ0osTUFBTSx5QkFBeUIsQ0FBQztBQUVqQyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUVwRTtJQUFpQywrQkFBdUI7SUFRcEQ7UUFBQSxZQUNJLGtCQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsU0FDOUI7UUFOUyxVQUFJLEdBQUcsbUJBQW1CLENBQUMsS0FBSyxDQUFDO1FBRW5DLGdCQUFVLEdBQVksS0FBSyxDQUFDOztJQUlwQyxDQUFDO0lBRVMsNEJBQU0sR0FBaEIsVUFBaUIsQ0FBYTtRQUMxQixJQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUVsRCxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQUUsT0FBTztTQUFFO1FBRWpDLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDckQsSUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUVyQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNsQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7U0FDMUI7UUFFRCxJQUFJLENBQUMsV0FBVyxHQUFHO1lBQ2YsUUFBUSxFQUFFLGVBQWUsQ0FBQyxRQUFRO1lBQ2xDLFNBQVMsRUFBRSxlQUFlLENBQUMsU0FBUztZQUNwQyxNQUFNLEVBQUUsZUFBZSxDQUFDLE1BQU07U0FDakMsQ0FBQztRQUVGLDJDQUEyQztRQUMzQyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssYUFBYSxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsSUFBSSxLQUFLLGFBQWEsQ0FBQyxLQUFLLEVBQUU7WUFDckgsSUFBTSxVQUFVLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUVqSCxJQUFJLFVBQVUsRUFBRTtnQkFDWix5RkFBeUY7Z0JBQ3pGLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUM1QixVQUFVLENBQUMsQ0FBQyxDQUFDLHdCQUVOLElBQUksQ0FBQyxXQUFXLEtBQ25CLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUVwQyxJQUFJLENBQ1AsQ0FBQzthQUNMO1NBQ0o7UUFFRCxJQUFJLENBQUMsWUFBWSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRVMsK0JBQVMsR0FBbkIsVUFBb0IsQ0FBYTtRQUM3QixJQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUUsQ0FBQztRQUU3RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7SUFDNUIsQ0FBQztJQUVPLHNDQUFnQixHQUF4QixVQUF5QixTQUFvQjtRQUN6QyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQy9ELElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzNELElBQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFcEMsU0FBUyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDOUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDMUIsU0FBUyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7SUFDbkMsQ0FBQztJQWhFTSxvQkFBUSxHQUFjLHVDQUFxQyxDQUFDO0lBaUV2RSxrQkFBQztDQUFBLEFBbkVELENBQWlDLHVCQUF1QixHQW1FdkQ7U0FuRVksV0FBVyJ9