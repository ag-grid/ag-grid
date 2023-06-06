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
import { AutoScrollService, Autowired, BeanStub, DragAndDropService, DragSourceType, Events, ProvidedColumnGroup, PostConstruct, _ } from "@ag-grid-community/core";
import { ToolPanelColumnGroupComp } from "./toolPanelColumnGroupComp";
var PRIMARY_COLS_LIST_ITEM_HOVERED = 'ag-list-item-hovered';
var PrimaryColsListPanelItemDragFeature = /** @class */ (function (_super) {
    __extends(PrimaryColsListPanelItemDragFeature, _super);
    function PrimaryColsListPanelItemDragFeature(comp, virtualList) {
        var _this = _super.call(this) || this;
        _this.comp = comp;
        _this.virtualList = virtualList;
        _this.currentDragColumn = null;
        _this.lastHoveredColumnItem = null;
        return _this;
    }
    PrimaryColsListPanelItemDragFeature.prototype.postConstruct = function () {
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START, this.columnPanelItemDragStart.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END, this.columnPanelItemDragEnd.bind(this));
        this.createDropTarget();
        this.createAutoScrollService();
    };
    PrimaryColsListPanelItemDragFeature.prototype.columnPanelItemDragStart = function (_a) {
        var column = _a.column;
        this.currentDragColumn = column;
        var currentColumns = this.getCurrentColumns();
        var hasNotMovable = currentColumns.find(function (col) {
            var colDef = col.getColDef();
            return !!colDef.suppressMovable || !!colDef.lockPosition;
        });
        if (hasNotMovable) {
            this.moveBlocked = true;
        }
    };
    PrimaryColsListPanelItemDragFeature.prototype.columnPanelItemDragEnd = function () {
        var _this = this;
        window.setTimeout(function () {
            _this.currentDragColumn = null;
            _this.moveBlocked = false;
        }, 10);
    };
    PrimaryColsListPanelItemDragFeature.prototype.createDropTarget = function () {
        var _this = this;
        var dropTarget = {
            isInterestedIn: function (type) { return type === DragSourceType.ToolPanel; },
            getIconName: function () { return DragAndDropService[_this.moveBlocked ? 'ICON_NOT_ALLOWED' : 'ICON_MOVE']; },
            getContainer: function () { return _this.comp.getGui(); },
            onDragging: function (e) { return _this.onDragging(e); },
            onDragStop: function () { return _this.onDragStop(); },
            onDragLeave: function () { return _this.onDragLeave(); }
        };
        this.dragAndDropService.addDropTarget(dropTarget);
    };
    PrimaryColsListPanelItemDragFeature.prototype.createAutoScrollService = function () {
        var virtualListGui = this.virtualList.getGui();
        this.autoScrollService = new AutoScrollService({
            scrollContainer: virtualListGui,
            scrollAxis: 'y',
            getVerticalPosition: function () { return virtualListGui.scrollTop; },
            setVerticalPosition: function (position) { return virtualListGui.scrollTop = position; }
        });
    };
    PrimaryColsListPanelItemDragFeature.prototype.onDragging = function (e) {
        if (!this.currentDragColumn || this.moveBlocked) {
            return;
        }
        var hoveredColumnItem = this.getDragColumnItem(e);
        var comp = this.virtualList.getComponentAt(hoveredColumnItem.rowIndex);
        if (!comp) {
            return;
        }
        var el = comp.getGui().parentElement;
        if (this.lastHoveredColumnItem &&
            this.lastHoveredColumnItem.rowIndex === hoveredColumnItem.rowIndex &&
            this.lastHoveredColumnItem.position === hoveredColumnItem.position) {
            return;
        }
        this.autoScrollService.check(e.event);
        this.clearHoveredItems();
        this.lastHoveredColumnItem = hoveredColumnItem;
        _.radioCssClass(el, "" + PRIMARY_COLS_LIST_ITEM_HOVERED);
        _.radioCssClass(el, "ag-item-highlight-" + hoveredColumnItem.position);
    };
    PrimaryColsListPanelItemDragFeature.prototype.getDragColumnItem = function (e) {
        var virtualListGui = this.virtualList.getGui();
        var paddingTop = parseFloat(window.getComputedStyle(virtualListGui).paddingTop);
        var rowHeight = this.virtualList.getRowHeight();
        var scrollTop = this.virtualList.getScrollTop();
        var rowIndex = Math.max(0, (e.y - paddingTop + scrollTop) / rowHeight);
        var maxLen = this.comp.getDisplayedColsList().length - 1;
        var normalizedRowIndex = Math.min(maxLen, rowIndex) | 0;
        return {
            rowIndex: normalizedRowIndex,
            position: (Math.round(rowIndex) > rowIndex || rowIndex > maxLen) ? 'bottom' : 'top',
            component: this.virtualList.getComponentAt(normalizedRowIndex)
        };
    };
    PrimaryColsListPanelItemDragFeature.prototype.onDragStop = function () {
        if (this.moveBlocked) {
            return;
        }
        var targetIndex = this.getTargetIndex();
        var columnsToMove = this.getCurrentColumns();
        if (targetIndex != null) {
            this.columnModel.moveColumns(columnsToMove, targetIndex, 'toolPanelUi');
        }
        this.clearHoveredItems();
        this.autoScrollService.ensureCleared();
    };
    PrimaryColsListPanelItemDragFeature.prototype.getMoveDiff = function (end) {
        var allColumns = this.columnModel.getAllGridColumns();
        var currentColumns = this.getCurrentColumns();
        var currentColumn = currentColumns[0];
        var span = currentColumns.length;
        var currentIndex = allColumns.indexOf(currentColumn);
        if (currentIndex < end) {
            return span;
        }
        return 0;
    };
    PrimaryColsListPanelItemDragFeature.prototype.getCurrentColumns = function () {
        if (this.currentDragColumn instanceof ProvidedColumnGroup) {
            return this.currentDragColumn.getLeafColumns();
        }
        return [this.currentDragColumn];
    };
    PrimaryColsListPanelItemDragFeature.prototype.getTargetIndex = function () {
        if (!this.lastHoveredColumnItem) {
            return null;
        }
        var columnItemComponent = this.lastHoveredColumnItem.component;
        var isBefore = this.lastHoveredColumnItem.position === 'top';
        var targetColumn;
        if (columnItemComponent instanceof ToolPanelColumnGroupComp) {
            var columns = columnItemComponent.getColumns();
            targetColumn = columns[0];
            isBefore = true;
        }
        else {
            targetColumn = columnItemComponent.getColumn();
        }
        var targetColumnIndex = this.columnModel.getAllGridColumns().indexOf(targetColumn);
        var adjustedTarget = isBefore ? targetColumnIndex : targetColumnIndex + 1;
        var diff = this.getMoveDiff(adjustedTarget);
        return adjustedTarget - diff;
    };
    PrimaryColsListPanelItemDragFeature.prototype.onDragLeave = function () {
        this.clearHoveredItems();
        this.autoScrollService.ensureCleared();
    };
    PrimaryColsListPanelItemDragFeature.prototype.clearHoveredItems = function () {
        var virtualListGui = this.virtualList.getGui();
        virtualListGui.querySelectorAll("." + PRIMARY_COLS_LIST_ITEM_HOVERED).forEach(function (el) {
            [
                PRIMARY_COLS_LIST_ITEM_HOVERED,
                'ag-item-highlight-top',
                'ag-item-highlight-bottom'
            ].forEach(function (cls) {
                el.classList.remove(cls);
            });
        });
        this.lastHoveredColumnItem = null;
    };
    __decorate([
        Autowired('columnModel')
    ], PrimaryColsListPanelItemDragFeature.prototype, "columnModel", void 0);
    __decorate([
        Autowired('dragAndDropService')
    ], PrimaryColsListPanelItemDragFeature.prototype, "dragAndDropService", void 0);
    __decorate([
        PostConstruct
    ], PrimaryColsListPanelItemDragFeature.prototype, "postConstruct", null);
    return PrimaryColsListPanelItemDragFeature;
}(BeanStub));
export { PrimaryColsListPanelItemDragFeature };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbWFyeUNvbHNMaXN0UGFuZWxJdGVtRHJhZ0ZlYXR1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29sdW1uVG9vbFBhbmVsL3ByaW1hcnlDb2xzTGlzdFBhbmVsSXRlbURyYWdGZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxpQkFBaUIsRUFDakIsU0FBUyxFQUNULFFBQVEsRUFJUixrQkFBa0IsRUFFbEIsY0FBYyxFQUVkLE1BQU0sRUFDTixtQkFBbUIsRUFDbkIsYUFBYSxFQUViLENBQUMsRUFDSixNQUFNLHlCQUF5QixDQUFDO0FBSWpDLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRXRFLElBQU0sOEJBQThCLEdBQUcsc0JBQXNCLENBQUM7QUFROUQ7SUFBeUQsdURBQVE7SUFTN0QsNkNBQ3FCLElBQTBCLEVBQzFCLFdBQXdCO1FBRjdDLFlBR0ksaUJBQU8sU0FBRztRQUZPLFVBQUksR0FBSixJQUFJLENBQXNCO1FBQzFCLGlCQUFXLEdBQVgsV0FBVyxDQUFhO1FBUHJDLHVCQUFpQixHQUF3QyxJQUFJLENBQUM7UUFDOUQsMkJBQXFCLEdBQTBCLElBQUksQ0FBQzs7SUFPL0MsQ0FBQztJQUdOLDJEQUFhLEdBQXJCO1FBQ0ksSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLGtDQUFrQyxFQUFFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNoSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsZ0NBQWdDLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRTVILElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxD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