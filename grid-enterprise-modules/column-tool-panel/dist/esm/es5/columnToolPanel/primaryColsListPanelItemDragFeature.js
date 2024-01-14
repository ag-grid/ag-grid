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
import { Autowired, BeanStub, DragSourceType, Events, ProvidedColumnGroup, PostConstruct, VirtualListDragFeature } from "@ag-grid-community/core";
import { ToolPanelColumnGroupComp } from "./toolPanelColumnGroupComp";
var PrimaryColsListPanelItemDragFeature = /** @class */ (function (_super) {
    __extends(PrimaryColsListPanelItemDragFeature, _super);
    function PrimaryColsListPanelItemDragFeature(comp, virtualList) {
        var _this = _super.call(this) || this;
        _this.comp = comp;
        _this.virtualList = virtualList;
        return _this;
    }
    PrimaryColsListPanelItemDragFeature.prototype.postConstruct = function () {
        var _this = this;
        this.createManagedBean(new VirtualListDragFeature(this.comp, this.virtualList, {
            dragSourceType: DragSourceType.ToolPanel,
            listItemDragStartEvent: Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START,
            listItemDragEndEvent: Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END,
            eventSource: this.eventService,
            getCurrentDragValue: function (listItemDragStartEvent) { return _this.getCurrentDragValue(listItemDragStartEvent); },
            isMoveBlocked: function (currentDragValue) { return _this.isMoveBlocked(currentDragValue); },
            getNumRows: function (comp) { return comp.getDisplayedColsList().length; },
            moveItem: function (currentDragValue, lastHoveredListItem) { return _this.moveItem(currentDragValue, lastHoveredListItem); }
        }));
    };
    PrimaryColsListPanelItemDragFeature.prototype.getCurrentDragValue = function (listItemDragStartEvent) {
        return listItemDragStartEvent.column;
    };
    PrimaryColsListPanelItemDragFeature.prototype.isMoveBlocked = function (currentDragValue) {
        var preventMoving = this.gridOptionsService.get('suppressMovableColumns');
        if (preventMoving) {
            return true;
        }
        var currentColumns = this.getCurrentColumns(currentDragValue);
        var hasNotMovable = currentColumns.find(function (col) {
            var colDef = col.getColDef();
            return !!colDef.suppressMovable || !!colDef.lockPosition;
        });
        return !!hasNotMovable;
    };
    PrimaryColsListPanelItemDragFeature.prototype.moveItem = function (currentDragValue, lastHoveredListItem) {
        var targetIndex = this.getTargetIndex(currentDragValue, lastHoveredListItem);
        var columnsToMove = this.getCurrentColumns(currentDragValue);
        if (targetIndex != null) {
            this.columnModel.moveColumns(columnsToMove, targetIndex, 'toolPanelUi');
        }
    };
    PrimaryColsListPanelItemDragFeature.prototype.getMoveDiff = function (currentDragValue, end) {
        var allColumns = this.columnModel.getAllGridColumns();
        var currentColumns = this.getCurrentColumns(currentDragValue);
        var currentColumn = currentColumns[0];
        var span = currentColumns.length;
        var currentIndex = allColumns.indexOf(currentColumn);
        if (currentIndex < end) {
            return span;
        }
        return 0;
    };
    PrimaryColsListPanelItemDragFeature.prototype.getCurrentColumns = function (currentDragValue) {
        if (currentDragValue instanceof ProvidedColumnGroup) {
            return currentDragValue.getLeafColumns();
        }
        return [currentDragValue];
    };
    PrimaryColsListPanelItemDragFeature.prototype.getTargetIndex = function (currentDragValue, lastHoveredListItem) {
        if (!lastHoveredListItem) {
            return null;
        }
        var columnItemComponent = lastHoveredListItem.component;
        var isBefore = lastHoveredListItem.position === 'top';
        var targetColumn;
        if (columnItemComponent instanceof ToolPanelColumnGroupComp) {
            var columns = columnItemComponent.getColumns();
            targetColumn = columns[0];
            isBefore = true;
        }
        else {
            targetColumn = columnItemComponent.getColumn();
        }
        // if the target col is in the cols to be moved, no index to move.
        var movingCols = this.getCurrentColumns(currentDragValue);
        if (movingCols.indexOf(targetColumn) !== -1) {
            return null;
        }
        var targetColumnIndex = this.columnModel.getAllGridColumns().indexOf(targetColumn);
        var adjustedTarget = isBefore ? targetColumnIndex : targetColumnIndex + 1;
        var diff = this.getMoveDiff(currentDragValue, adjustedTarget);
        return adjustedTarget - diff;
    };
    __decorate([
        Autowired('columnModel')
    ], PrimaryColsListPanelItemDragFeature.prototype, "columnModel", void 0);
    __decorate([
        Autowired('gridOptionsService')
    ], PrimaryColsListPanelItemDragFeature.prototype, "gridOptionsService", void 0);
    __decorate([
        PostConstruct
    ], PrimaryColsListPanelItemDragFeature.prototype, "postConstruct", null);
    return PrimaryColsListPanelItemDragFeature;
}(BeanStub));
export { PrimaryColsListPanelItemDragFeature };
