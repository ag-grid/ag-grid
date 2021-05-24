/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
import { Autowired, Bean, PostConstruct } from "../context/context";
import { Events } from "../eventKeys";
import { FillUndoRedoAction, UndoRedoAction, UndoRedoStack } from "./undoRedoStack";
import { Constants } from "../constants/constants";
import { ModuleNames } from "../modules/moduleNames";
import { ModuleRegistry } from "../modules/moduleRegistry";
import { BeanStub } from "../context/beanStub";
var UndoRedoService = /** @class */ (function (_super) {
    __extends(UndoRedoService, _super);
    function UndoRedoService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cellValueChanges = [];
        _this.isCellEditing = false;
        _this.isRowEditing = false;
        _this.isPasting = false;
        _this.isFilling = false;
        _this.onCellValueChanged = function (event) {
            var shouldCaptureAction = _this.isCellEditing || _this.isRowEditing || _this.isPasting || _this.isFilling;
            if (!shouldCaptureAction) {
                return;
            }
            var rowPinned = event.rowPinned, rowIndex = event.rowIndex, column = event.column, oldValue = event.oldValue, value = event.value;
            var cellValueChange = {
                rowPinned: rowPinned,
                rowIndex: rowIndex,
                columnId: column.getColId(),
                newValue: value,
                oldValue: oldValue
            };
            _this.cellValueChanges.push(cellValueChange);
        };
        _this.clearStacks = function () {
            _this.undoStack.clear();
            _this.redoStack.clear();
        };
        return _this;
    }
    UndoRedoService.prototype.init = function () {
        if (!this.gridOptionsWrapper.isUndoRedoCellEditing()) {
            return;
        }
        var undoRedoLimit = this.gridOptionsWrapper.getUndoRedoCellEditingLimit();
        if (undoRedoLimit <= 0) {
            return;
        }
        this.undoStack = new UndoRedoStack(undoRedoLimit);
        this.redoStack = new UndoRedoStack(undoRedoLimit);
        this.addRowEditingListeners();
        this.addCellEditingListeners();
        this.addPasteListeners();
        this.addFillListeners();
        this.addManagedListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.onCellValueChanged);
        // undo / redo is restricted to actual editing so we clear the stacks when other operations are
        // performed that change the order of the row / cols.
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_GROUP_OPENED, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PINNED, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_ROW_DRAG_END, this.clearStacks);
    };
    UndoRedoService.prototype.getCurrentUndoStackSize = function () {
        return this.undoStack ? this.undoStack.getCurrentStackSize() : 0;
    };
    UndoRedoService.prototype.getCurrentRedoStackSize = function () {
        return this.redoStack ? this.redoStack.getCurrentStackSize() : 0;
    };
    UndoRedoService.prototype.undo = function () {
        if (!this.undoStack) {
            return;
        }
        var undoAction = this.undoStack.pop();
        if (!undoAction || !undoAction.cellValueChanges) {
            return;
        }
        this.processAction(undoAction, function (cellValueChange) { return cellValueChange.oldValue; });
        if (undoAction instanceof FillUndoRedoAction) {
            this.processRangeAndCellFocus(undoAction.cellValueChanges, undoAction.initialRange);
        }
        else {
            this.processRangeAndCellFocus(undoAction.cellValueChanges);
        }
        this.redoStack.push(undoAction);
    };
    UndoRedoService.prototype.redo = function () {
        if (!this.redoStack) {
            return;
        }
        var redoAction = this.redoStack.pop();
        if (!redoAction || !redoAction.cellValueChanges) {
            return;
        }
        this.processAction(redoAction, function (cellValueChange) { return cellValueChange.newValue; });
        if (redoAction instanceof FillUndoRedoAction) {
            this.processRangeAndCellFocus(redoAction.cellValueChanges, redoAction.finalRange);
        }
        else {
            this.processRangeAndCellFocus(redoAction.cellValueChanges);
        }
        this.undoStack.push(redoAction);
    };
    UndoRedoService.prototype.processAction = function (action, valueExtractor) {
        var _this = this;
        action.cellValueChanges.forEach(function (cellValueChange) {
            var rowIndex = cellValueChange.rowIndex, rowPinned = cellValueChange.rowPinned, columnId = cellValueChange.columnId;
            var rowPosition = { rowIndex: rowIndex, rowPinned: rowPinned };
            var currentRow = _this.getRowNode(rowPosition);
            // checks if the row has been filtered out
            if (!currentRow.displayed) {
                return;
            }
            currentRow.setDataValue(columnId, valueExtractor(cellValueChange));
        });
    };
    UndoRedoService.prototype.processRangeAndCellFocus = function (cellValueChanges, range) {
        var lastFocusedCell;
        if (range) {
            var startRow = range.startRow;
            var endRow = range.endRow;
            lastFocusedCell = {
                rowPinned: startRow.rowPinned,
                rowIndex: startRow.rowIndex,
                columnId: range.startColumn.getColId()
            };
            this.setLastFocusedCell(lastFocusedCell);
            var cellRangeParams = {
                rowStartIndex: startRow.rowIndex,
                rowStartPinned: startRow.rowPinned,
                rowEndIndex: endRow.rowIndex,
                rowEndPinned: endRow.rowPinned,
                columnStart: range.startColumn,
                columns: range.columns
            };
            this.gridApi.addCellRange(cellRangeParams);
            return;
        }
        var cellValueChange = cellValueChanges[0];
        var rowIndex = cellValueChange.rowIndex, rowPinned = cellValueChange.rowPinned;
        var rowPosition = { rowIndex: rowIndex, rowPinned: rowPinned };
        var row = this.getRowNode(rowPosition);
        lastFocusedCell = {
            rowPinned: cellValueChange.rowPinned,
            rowIndex: row.rowIndex,
            columnId: cellValueChange.columnId
        };
        this.setLastFocusedCell(lastFocusedCell);
    };
    UndoRedoService.prototype.setLastFocusedCell = function (lastFocusedCell) {
        var rowIndex = lastFocusedCell.rowIndex, columnId = lastFocusedCell.columnId, rowPinned = lastFocusedCell.rowPinned;
        this.gridApi.ensureIndexVisible(rowIndex);
        this.gridApi.ensureColumnVisible(columnId);
        if (ModuleRegistry.isRegistered(ModuleNames.RangeSelectionModule)) {
            this.gridApi.clearRangeSelection();
        }
        this.focusController.setFocusedCell(rowIndex, columnId, rowPinned, true);
    };
    UndoRedoService.prototype.addRowEditingListeners = function () {
        var _this = this;
        this.addManagedListener(this.eventService, Events.EVENT_ROW_EDITING_STARTED, function () {
            _this.isRowEditing = true;
        });
        this.addManagedListener(this.eventService, Events.EVENT_ROW_EDITING_STOPPED, function () {
            var action = new UndoRedoAction(_this.cellValueChanges);
            _this.pushActionsToUndoStack(action);
            _this.isRowEditing = false;
        });
    };
    UndoRedoService.prototype.addCellEditingListeners = function () {
        var _this = this;
        this.addManagedListener(this.eventService, Events.EVENT_CELL_EDITING_STARTED, function () {
            _this.isCellEditing = true;
        });
        this.addManagedListener(this.eventService, Events.EVENT_CELL_EDITING_STOPPED, function () {
            _this.isCellEditing = false;
            var shouldPushAction = !_this.isRowEditing && !_this.isPasting && !_this.isFilling;
            if (shouldPushAction) {
                var action = new UndoRedoAction(_this.cellValueChanges);
                _this.pushActionsToUndoStack(action);
            }
        });
    };
    UndoRedoService.prototype.addPasteListeners = function () {
        var _this = this;
        this.addManagedListener(this.eventService, Events.EVENT_PASTE_START, function () {
            _this.isPasting = true;
        });
        this.addManagedListener(this.eventService, Events.EVENT_PASTE_END, function () {
            var action = new UndoRedoAction(_this.cellValueChanges);
            _this.pushActionsToUndoStack(action);
            _this.isPasting = false;
        });
    };
    UndoRedoService.prototype.addFillListeners = function () {
        var _this = this;
        this.addManagedListener(this.eventService, Events.EVENT_FILL_START, function () {
            _this.isFilling = true;
        });
        this.addManagedListener(this.eventService, Events.EVENT_FILL_END, function (event) {
            var action = new FillUndoRedoAction(_this.cellValueChanges, event.initialRange, event.finalRange);
            _this.pushActionsToUndoStack(action);
            _this.isFilling = false;
        });
    };
    UndoRedoService.prototype.pushActionsToUndoStack = function (action) {
        this.undoStack.push(action);
        this.cellValueChanges = [];
        this.redoStack.clear();
    };
    UndoRedoService.prototype.getRowNode = function (gridRow) {
        switch (gridRow.rowPinned) {
            case Constants.PINNED_TOP:
                return this.pinnedRowModel.getPinnedTopRowData()[gridRow.rowIndex];
            case Constants.PINNED_BOTTOM:
                return this.pinnedRowModel.getPinnedBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    };
    __decorate([
        Autowired('focusController')
    ], UndoRedoService.prototype, "focusController", void 0);
    __decorate([
        Autowired('gridApi')
    ], UndoRedoService.prototype, "gridApi", void 0);
    __decorate([
        Autowired('rowModel')
    ], UndoRedoService.prototype, "rowModel", void 0);
    __decorate([
        Autowired('pinnedRowModel')
    ], UndoRedoService.prototype, "pinnedRowModel", void 0);
    __decorate([
        PostConstruct
    ], UndoRedoService.prototype, "init", null);
    UndoRedoService = __decorate([
        Bean('undoRedoService')
    ], UndoRedoService);
    return UndoRedoService;
}(BeanStub));
export { UndoRedoService };
