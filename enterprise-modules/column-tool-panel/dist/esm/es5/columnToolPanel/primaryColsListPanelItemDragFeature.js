var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
