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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, _, SelectionHandleType } from "@ag-grid-community/core";
var AbstractSelectionHandle = /** @class */ (function (_super) {
    __extends(AbstractSelectionHandle, _super);
    function AbstractSelectionHandle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.changedCalculatedValues = false;
        _this.dragging = false;
        _this.shouldDestroyOnEndDragging = false;
        return _this;
    }
    AbstractSelectionHandle.prototype.init = function () {
        var _this = this;
        this.dragService.addDragSource({
            dragStartPixels: 0,
            eElement: this.getGui(),
            onDragStart: this.onDragStart.bind(this),
            onDragging: function (e) {
                _this.dragging = true;
                _this.rangeService.autoScrollService.check(e);
                if (_this.changedCalculatedValues) {
                    _this.onDrag(e);
                    _this.changedCalculatedValues = false;
                }
            },
            onDragStop: function (e) {
                _this.dragging = false;
                _this.onDragEnd(e);
                _this.clearValues();
                _this.rangeService.autoScrollService.ensureCleared();
                // TODO: this causes a bug where if there are multiple grids in the same page, all of them will
                // be affected by a drag on any. Move it to the root element.
                document.body.classList.remove(_this.getDraggingCssClass());
                if (_this.shouldDestroyOnEndDragging) {
                    _this.destroy();
                }
            }
        });
        this.addManagedListener(this.getGui(), 'mousedown', this.preventRangeExtension.bind(this));
    };
    AbstractSelectionHandle.prototype.isDragging = function () {
        return this.dragging;
    };
    AbstractSelectionHandle.prototype.getCellCtrl = function () {
        return this.cellCtrl;
    };
    AbstractSelectionHandle.prototype.setCellCtrl = function (cellComp) {
        this.cellCtrl = cellComp;
    };
    AbstractSelectionHandle.prototype.getCellRange = function () {
        return this.cellRange;
    };
    AbstractSelectionHandle.prototype.setCellRange = function (range) {
        this.cellRange = range;
    };
    AbstractSelectionHandle.prototype.getRangeStartRow = function () {
        return this.rangeStartRow;
    };
    AbstractSelectionHandle.prototype.setRangeStartRow = function (row) {
        this.rangeStartRow = row;
    };
    AbstractSelectionHandle.prototype.getRangeEndRow = function () {
        return this.rangeEndRow;
    };
    AbstractSelectionHandle.prototype.setRangeEndRow = function (row) {
        this.rangeEndRow = row;
    };
    AbstractSelectionHandle.prototype.getLastCellHovered = function () {
        return this.lastCellHovered;
    };
    AbstractSelectionHandle.prototype.preventRangeExtension = function (e) {
        e.stopPropagation();
    };
    AbstractSelectionHandle.prototype.onDragStart = function (e) {
        this.cellHoverListener = this.addManagedListener(this.ctrlsService.getGridCtrl().getGui(), 'mousemove', this.updateValuesOnMove.bind(this));
        document.body.classList.add(this.getDraggingCssClass());
    };
    AbstractSelectionHandle.prototype.getDraggingCssClass = function () {
        return "ag-dragging-" + (this.type === SelectionHandleType.FILL ? 'fill' : 'range') + "-handle";
    };
    AbstractSelectionHandle.prototype.updateValuesOnMove = function (e) {
        var cell = this.mouseEventService.getCellPositionForEvent(e);
        if (!cell || (this.lastCellHovered && this.cellPositionUtils.equals(cell, this.lastCellHovered))) {
            return;
        }
        this.lastCellHovered = cell;
        this.changedCalculatedValues = true;
    };
    AbstractSelectionHandle.prototype.getType = function () {
        return this.type;
    };
    AbstractSelectionHandle.prototype.refresh = function (cellCtrl) {
        var oldCellComp = this.getCellCtrl();
        var eGui = this.getGui();
        var cellRange = _.last(this.rangeService.getCellRanges());
        var start = cellRange.startRow;
        var end = cellRange.endRow;
        if (start && end) {
            var isBefore = this.rowPositionUtils.before(end, start);
            if (isBefore) {
                this.setRangeStartRow(end);
                this.setRangeEndRow(start);
            }
            else {
                this.setRangeStartRow(start);
                this.setRangeEndRow(end);
            }
        }
        if (oldCellComp !== cellCtrl || !_.isVisible(eGui)) {
            this.setCellCtrl(cellCtrl);
            var eParentOfValue = cellCtrl.getComp().getParentOfValue();
            if (eParentOfValue) {
                eParentOfValue.appendChild(eGui);
            }
        }
        this.setCellRange(cellRange);
    };
    AbstractSelectionHandle.prototype.clearValues = function () {
        this.lastCellHovered = undefined;
        this.removeListeners();
    };
    AbstractSelectionHandle.prototype.removeListeners = function () {
        if (this.cellHoverListener) {
            this.cellHoverListener();
            this.cellHoverListener = undefined;
        }
    };
    AbstractSelectionHandle.prototype.destroy = function () {
        if (!this.shouldDestroyOnEndDragging && this.isDragging()) {
            _.setDisplayed(this.getGui(), false);
            this.shouldDestroyOnEndDragging = true;
            return;
        }
        this.shouldDestroyOnEndDragging = false;
        _super.prototype.destroy.call(this);
        this.removeListeners();
        var eGui = this.getGui();
        if (eGui.parentElement) {
            eGui.parentElement.removeChild(eGui);
        }
    };
    __decorate([
        Autowired("rowRenderer")
    ], AbstractSelectionHandle.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired("dragService")
    ], AbstractSelectionHandle.prototype, "dragService", void 0);
    __decorate([
        Autowired("rangeService")
    ], AbstractSelectionHandle.prototype, "rangeService", void 0);
    __decorate([
        Autowired("mouseEventService")
    ], AbstractSelectionHandle.prototype, "mouseEventService", void 0);
    __decorate([
        Autowired("columnModel")
    ], AbstractSelectionHandle.prototype, "columnModel", void 0);
    __decorate([
        Autowired("cellNavigationService")
    ], AbstractSelectionHandle.prototype, "cellNavigationService", void 0);
    __decorate([
        Autowired("navigationService")
    ], AbstractSelectionHandle.prototype, "navigationService", void 0);
    __decorate([
        Autowired('rowPositionUtils')
    ], AbstractSelectionHandle.prototype, "rowPositionUtils", void 0);
    __decorate([
        Autowired('cellPositionUtils')
    ], AbstractSelectionHandle.prototype, "cellPositionUtils", void 0);
    __decorate([
        Autowired('ctrlsService')
    ], AbstractSelectionHandle.prototype, "ctrlsService", void 0);
    __decorate([
        PostConstruct
    ], AbstractSelectionHandle.prototype, "init", null);
    return AbstractSelectionHandle;
}(Component));
export { AbstractSelectionHandle };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RTZWxlY3Rpb25IYW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcmFuZ2VTZWxlY3Rpb24vYWJzdHJhY3RTZWxlY3Rpb25IYW5kbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFJVCxTQUFTLEVBT1QsYUFBYSxFQUdiLENBQUMsRUFDRCxtQkFBbUIsRUFJdEIsTUFBTSx5QkFBeUIsQ0FBQztBQUdqQztJQUFzRCwyQ0FBUztJQUEvRDtRQUFBLHFFQXlNQztRQXBMYSw2QkFBdUIsR0FBWSxLQUFLLENBQUM7UUFDM0MsY0FBUSxHQUFZLEtBQUssQ0FBQztRQUd4QixnQ0FBMEIsR0FBWSxLQUFLLENBQUM7O0lBZ0wxRCxDQUFDO0lBN0tXLHNDQUFJLEdBQVo7UUFEQSxpQkFvQ0M7UUFsQ0csSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUM7WUFDM0IsZUFBZSxFQUFFLENBQUM7WUFDbEIsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDdkIsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN4QyxVQUFVLEVBQUUsVUFBQyxDQUFxQjtnQkFDOUIsS0FBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ3JCLEtBQUksQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQWUsQ0FBQyxDQUFDO2dCQUUzRCxJQUFJLEtBQUksQ0FBQyx1QkFBdUIsRUFBRTtvQkFDOUIsS0FBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDZixLQUFJLENBQUMsdUJBQXVCLEdBQUcsS0FBSyxDQUFDO2lCQUN4QztZQUNMLENBQUM7WUFDRCxVQUFVLEVBQUUsVUFBQyxDQUFxQjtnQkFDOUIsS0FBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JB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