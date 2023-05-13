/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
import { Autowired, Bean, Optional, PostConstruct } from "../context/context";
import { Events } from "../eventKeys";
import { RangeUndoRedoAction, UndoRedoAction, UndoRedoStack } from "./undoRedoStack";
import { BeanStub } from "../context/beanStub";
var UndoRedoService = /** @class */ (function (_super) {
    __extends(UndoRedoService, _super);
    function UndoRedoService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cellValueChanges = [];
        _this.activeCellEdit = null;
        _this.activeRowEdit = null;
        _this.isPasting = false;
        _this.isRangeInAction = false;
        _this.onCellValueChanged = function (event) {
            var eventCell = { column: event.column, rowIndex: event.rowIndex, rowPinned: event.rowPinned };
            var isCellEditing = _this.activeCellEdit !== null && _this.cellPositionUtils.equals(_this.activeCellEdit, eventCell);
            var isRowEditing = _this.activeRowEdit !== null && _this.rowPositionUtils.sameRow(_this.activeRowEdit, eventCell);
            var shouldCaptureAction = isCellEditing || isRowEditing || _this.isPasting || _this.isRangeInAction;
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
        var _this = this;
        if (!this.gridOptionsService.is('undoRedoCellEditing')) {
            return;
        }
        var undoRedoLimit = this.gridOptionsService.getNum('undoRedoCellEditingLimit');
        if (undoRedoLimit <= 0) {
            return;
        }
        this.undoStack = new UndoRedoStack(undoRedoLimit);
        this.redoStack = new UndoRedoStack(undoRedoLimit);
        this.addRowEditingListeners();
        this.addCellEditingListeners();
        this.addPasteListeners();
        this.addFillListeners();
        this.addCellKeyListeners();
        this.addManagedListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.onCellValueChanged);
        // undo / redo is restricted to actual editing so we clear the stacks when other operations are
        // performed that change the order of the row / cols.
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, function (e) {
            if (!e.keepUndoRedoStack) {
                _this.clearStacks();
            }
        });
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_GROUP_OPENED, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PINNED, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_ROW_DRAG_END, this.clearStacks);
        this.ctrlsService.whenReady(function () {
            _this.gridBodyCtrl = _this.ctrlsService.getGridBodyCtrl();
        });
    };
    UndoRedoService.prototype.getCurrentUndoStackSize = function () {
        return this.undoStack ? this.undoStack.getCurrentStackSize() : 0;
    };
    UndoRedoService.prototype.getCurrentRedoStackSize = function () {
        return this.redoStack ? this.redoStack.getCurrentStackSize() : 0;
    };
    UndoRedoService.prototype.undo = function (source) {
        var startEvent = {
            type: Events.EVENT_UNDO_STARTED,
            source: source
        };
        this.eventService.dispatchEvent(startEvent);
        var operationPerformed = this.undoRedo(this.undoStack, this.redoStack, 'initialRange', 'oldValue', 'undo');
        var endEvent = {
            type: Events.EVENT_UNDO_ENDED,
            source: source,
            operationPerformed: operationPerformed
        };
        this.eventService.dispatchEvent(endEvent);
    };
    UndoRedoService.prototype.redo = function (source) {
        var startEvent = {
            type: Events.EVENT_REDO_STARTED,
            source: source
        };
        this.eventService.dispatchEvent(startEvent);
        var operationPerformed = this.undoRedo(this.redoStack, this.undoStack, 'finalRange', 'newValue', 'redo');
        var endEvent = {
            type: Events.EVENT_REDO_ENDED,
            source: source,
            operationPerformed: operationPerformed
        };
        this.eventService.dispatchEvent(endEvent);
    };
    UndoRedoService.prototype.undoRedo = function (undoRedoStack, opposingUndoRedoStack, rangeProperty, cellValueChangeProperty, source) {
        if (!undoRedoStack) {
            return false;
        }
        var undoRedoAction = undoRedoStack.pop();
        if (!undoRedoAction || !undoRedoAction.cellValueChanges) {
            return false;
        }
        this.processAction(undoRedoAction, function (cellValueChange) { return cellValueChange[cellValueChangeProperty]; }, source);
        if (undoRedoAction instanceof RangeUndoRedoAction) {
            this.processRange(undoRedoAction.ranges || [undoRedoAction[rangeProperty]]);
        }
        else {
            this.processCell(undoRedoAction.cellValueChanges);
        }
        opposingUndoRedoStack.push(undoRedoAction);
        return true;
    };
    UndoRedoService.prototype.processAction = function (action, valueExtractor, source) {
        var _this = this;
        action.cellValueChanges.forEach(function (cellValueChange) {
            var rowIndex = cellValueChange.rowIndex, rowPinned = cellValueChange.rowPinned, columnId = cellValueChange.columnId;
            var rowPosition = { rowIndex: rowIndex, rowPinned: rowPinned };
            var currentRow = _this.getRowNode(rowPosition);
            // checks if the row has been filtered out
            if (!currentRow.displayed) {
                return;
            }
            currentRow.setDataValue(columnId, valueExtractor(cellValueChange), source);
        });
    };
    UndoRedoService.prototype.processRange = function (ranges) {
        var _this = this;
        var lastFocusedCell;
        this.rangeService.removeAllCellRanges(true);
        ranges.forEach(function (range, idx) {
            if (!range) {
                return;
            }
            var startRow = range.startRow;
            var endRow = range.endRow;
            if (idx === ranges.length - 1) {
                lastFocusedCell = {
                    rowPinned: startRow.rowPinned,
                    rowIndex: startRow.rowIndex,
                    columnId: range.startColumn.getColId()
                };
                _this.setLastFocusedCell(lastFocusedCell);
            }
            var cellRangeParams = {
                rowStartIndex: startRow.rowIndex,
                rowStartPinned: startRow.rowPinned,
                rowEndIndex: endRow.rowIndex,
                rowEndPinned: endRow.rowPinned,
                columnStart: range.startColumn,
                columns: range.columns
            };
            _this.rangeService.addCellRange(cellRangeParams);
        });
    };
    UndoRedoService.prototype.processCell = function (cellValueChanges) {
        var cellValueChange = cellValueChanges[0];
        var rowIndex = cellValueChange.rowIndex, rowPinned = cellValueChange.rowPinned;
        var rowPosition = { rowIndex: rowIndex, rowPinned: rowPinned };
        var row = this.getRowNode(rowPosition);
        var lastFocusedCell = {
            rowPinned: cellValueChange.rowPinned,
            rowIndex: row.rowIndex,
            columnId: cellValueChange.columnId
        };
        // when single cells are being processed, they should be considered
        // as ranges when the rangeService is present (singleCellRanges).
        // otherwise focus will be restore but the range will not.
        this.setLastFocusedCell(lastFocusedCell, !!this.rangeService);
    };
    UndoRedoService.prototype.setLastFocusedCell = function (lastFocusedCell, setRangeToCell) {
        var rowIndex = lastFocusedCell.rowIndex, columnId = lastFocusedCell.columnId, rowPinned = lastFocusedCell.rowPinned;
        var scrollFeature = this.gridBodyCtrl.getScrollFeature();
        var column = this.columnModel.getGridColumn(columnId);
        if (!column) {
            return;
        }
        scrollFeature.ensureIndexVisible(rowIndex);
        scrollFeature.ensureColumnVisible(column);
        var cellPosition = { rowIndex: rowIndex, column: column, rowPinned: rowPinned };
        this.focusService.setFocusedCell(__assign(__assign({}, cellPosition), { forceBrowserFocus: true }));
        if (setRangeToCell) {
            this.rangeService.setRangeToCell(cellPosition);
        }
    };
    UndoRedoService.prototype.addRowEditingListeners = function () {
        var _this = this;
        this.addManagedListener(this.eventService, Events.EVENT_ROW_EDITING_STARTED, function (e) {
            _this.activeRowEdit = { rowIndex: e.rowIndex, rowPinned: e.rowPinned };
        });
        this.addManagedListener(this.eventService, Events.EVENT_ROW_EDITING_STOPPED, function () {
            var action = new UndoRedoAction(_this.cellValueChanges);
            _this.pushActionsToUndoStack(action);
            _this.activeRowEdit = null;
        });
    };
    UndoRedoService.prototype.addCellEditingListeners = function () {
        var _this = this;
        this.addManagedListener(this.eventService, Events.EVENT_CELL_EDITING_STARTED, function (e) {
            _this.activeCellEdit = { column: e.column, rowIndex: e.rowIndex, rowPinned: e.rowPinned };
        });
        this.addManagedListener(this.eventService, Events.EVENT_CELL_EDITING_STOPPED, function (e) {
            _this.activeCellEdit = null;
            var shouldPushAction = e.valueChanged && !_this.activeRowEdit && !_this.isPasting && !_this.isRangeInAction;
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
            _this.isRangeInAction = true;
        });
        this.addManagedListener(this.eventService, Events.EVENT_FILL_END, function (event) {
            var action = new RangeUndoRedoAction(_this.cellValueChanges, event.initialRange, event.finalRange);
            _this.pushActionsToUndoStack(action);
            _this.isRangeInAction = false;
        });
    };
    UndoRedoService.prototype.addCellKeyListeners = function () {
        var _this = this;
        this.addManagedListener(this.eventService, Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_START, function () {
            _this.isRangeInAction = true;
        });
        this.addManagedListener(this.eventService, Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_END, function () {
            var action;
            if (_this.rangeService && _this.gridOptionsService.isEnableRangeSelection()) {
                action = new RangeUndoRedoAction(_this.cellValueChanges, undefined, undefined, __spread(_this.rangeService.getCellRanges()));
            }
            else {
                action = new UndoRedoAction(_this.cellValueChanges);
            }
            _this.pushActionsToUndoStack(action);
            _this.isRangeInAction = false;
        });
    };
    UndoRedoService.prototype.pushActionsToUndoStack = function (action) {
        this.undoStack.push(action);
        this.cellValueChanges = [];
        this.redoStack.clear();
    };
    UndoRedoService.prototype.getRowNode = function (gridRow) {
        switch (gridRow.rowPinned) {
            case 'top':
                return this.pinnedRowModel.getPinnedTopRowData()[gridRow.rowIndex];
            case 'bottom':
                return this.pinnedRowModel.getPinnedBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    };
    __decorate([
        Autowired('focusService')
    ], UndoRedoService.prototype, "focusService", void 0);
    __decorate([
        Autowired('ctrlsService')
    ], UndoRedoService.prototype, "ctrlsService", void 0);
    __decorate([
        Autowired('rowModel')
    ], UndoRedoService.prototype, "rowModel", void 0);
    __decorate([
        Autowired('pinnedRowModel')
    ], UndoRedoService.prototype, "pinnedRowModel", void 0);
    __decorate([
        Autowired('cellPositionUtils')
    ], UndoRedoService.prototype, "cellPositionUtils", void 0);
    __decorate([
        Autowired('rowPositionUtils')
    ], UndoRedoService.prototype, "rowPositionUtils", void 0);
    __decorate([
        Autowired('columnModel')
    ], UndoRedoService.prototype, "columnModel", void 0);
    __decorate([
        Optional('rangeService')
    ], UndoRedoService.prototype, "rangeService", void 0);
    __decorate([
        PostConstruct
    ], UndoRedoService.prototype, "init", null);
    UndoRedoService = __decorate([
        Bean('undoRedoService')
    ], UndoRedoService);
    return UndoRedoService;
}(BeanStub));
export { UndoRedoService };
