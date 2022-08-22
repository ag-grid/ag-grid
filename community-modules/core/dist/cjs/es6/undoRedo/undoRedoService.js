/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("../context/context");
const eventKeys_1 = require("../eventKeys");
const undoRedoStack_1 = require("./undoRedoStack");
const constants_1 = require("../constants/constants");
const moduleNames_1 = require("../modules/moduleNames");
const moduleRegistry_1 = require("../modules/moduleRegistry");
const beanStub_1 = require("../context/beanStub");
let UndoRedoService = class UndoRedoService extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.cellValueChanges = [];
        this.activeCellEdit = null;
        this.activeRowEdit = null;
        this.isPasting = false;
        this.isFilling = false;
        this.onCellValueChanged = (event) => {
            const eventCell = { column: event.column, rowIndex: event.rowIndex, rowPinned: event.rowPinned };
            const isCellEditing = this.activeCellEdit !== null && this.cellPositionUtils.equals(this.activeCellEdit, eventCell);
            const isRowEditing = this.activeRowEdit !== null && this.rowPositionUtils.sameRow(this.activeRowEdit, eventCell);
            const shouldCaptureAction = isCellEditing || isRowEditing || this.isPasting || this.isFilling;
            if (!shouldCaptureAction) {
                return;
            }
            const { rowPinned, rowIndex, column, oldValue, value } = event;
            const cellValueChange = {
                rowPinned,
                rowIndex: rowIndex,
                columnId: column.getColId(),
                newValue: value,
                oldValue
            };
            this.cellValueChanges.push(cellValueChange);
        };
        this.clearStacks = () => {
            this.undoStack.clear();
            this.redoStack.clear();
        };
    }
    init() {
        if (!this.gridOptionsWrapper.isUndoRedoCellEditing()) {
            return;
        }
        const undoRedoLimit = this.gridOptionsWrapper.getUndoRedoCellEditingLimit();
        if (undoRedoLimit <= 0) {
            return;
        }
        this.undoStack = new undoRedoStack_1.UndoRedoStack(undoRedoLimit);
        this.redoStack = new undoRedoStack_1.UndoRedoStack(undoRedoLimit);
        this.addRowEditingListeners();
        this.addCellEditingListeners();
        this.addPasteListeners();
        this.addFillListeners();
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_CELL_VALUE_CHANGED, this.onCellValueChanged);
        // undo / redo is restricted to actual editing so we clear the stacks when other operations are
        // performed that change the order of the row / cols.
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_MODEL_UPDATED, e => {
            if (!e.keepUndoRedoStack) {
                this.clearStacks();
            }
        });
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.clearStacks);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_NEW_COLUMNS_LOADED, this.clearStacks);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_GROUP_OPENED, this.clearStacks);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.clearStacks);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_MOVED, this.clearStacks);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_PINNED, this.clearStacks);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_VISIBLE, this.clearStacks);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_ROW_DRAG_END, this.clearStacks);
    }
    getCurrentUndoStackSize() {
        return this.undoStack ? this.undoStack.getCurrentStackSize() : 0;
    }
    getCurrentRedoStackSize() {
        return this.redoStack ? this.redoStack.getCurrentStackSize() : 0;
    }
    undo() {
        if (!this.undoStack) {
            return;
        }
        const undoAction = this.undoStack.pop();
        if (!undoAction || !undoAction.cellValueChanges) {
            return;
        }
        this.processAction(undoAction, (cellValueChange) => cellValueChange.oldValue);
        if (undoAction instanceof undoRedoStack_1.FillUndoRedoAction) {
            this.processRangeAndCellFocus(undoAction.cellValueChanges, undoAction.initialRange);
        }
        else {
            this.processRangeAndCellFocus(undoAction.cellValueChanges);
        }
        this.redoStack.push(undoAction);
    }
    redo() {
        if (!this.redoStack) {
            return;
        }
        const redoAction = this.redoStack.pop();
        if (!redoAction || !redoAction.cellValueChanges) {
            return;
        }
        this.processAction(redoAction, (cellValueChange) => cellValueChange.newValue);
        if (redoAction instanceof undoRedoStack_1.FillUndoRedoAction) {
            this.processRangeAndCellFocus(redoAction.cellValueChanges, redoAction.finalRange);
        }
        else {
            this.processRangeAndCellFocus(redoAction.cellValueChanges);
        }
        this.undoStack.push(redoAction);
    }
    processAction(action, valueExtractor) {
        action.cellValueChanges.forEach(cellValueChange => {
            const { rowIndex, rowPinned, columnId } = cellValueChange;
            const rowPosition = { rowIndex, rowPinned };
            const currentRow = this.getRowNode(rowPosition);
            // checks if the row has been filtered out
            if (!currentRow.displayed) {
                return;
            }
            currentRow.setDataValue(columnId, valueExtractor(cellValueChange));
        });
    }
    processRangeAndCellFocus(cellValueChanges, range) {
        let lastFocusedCell;
        if (range) {
            const startRow = range.startRow;
            const endRow = range.endRow;
            lastFocusedCell = {
                rowPinned: startRow.rowPinned,
                rowIndex: startRow.rowIndex,
                columnId: range.startColumn.getColId()
            };
            this.setLastFocusedCell(lastFocusedCell);
            const cellRangeParams = {
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
        const cellValueChange = cellValueChanges[0];
        const { rowIndex, rowPinned } = cellValueChange;
        const rowPosition = { rowIndex, rowPinned };
        const row = this.getRowNode(rowPosition);
        lastFocusedCell = {
            rowPinned: cellValueChange.rowPinned,
            rowIndex: row.rowIndex,
            columnId: cellValueChange.columnId
        };
        this.setLastFocusedCell(lastFocusedCell);
    }
    setLastFocusedCell(lastFocusedCell) {
        const { rowIndex, columnId, rowPinned } = lastFocusedCell;
        this.gridApi.ensureIndexVisible(rowIndex);
        this.gridApi.ensureColumnVisible(columnId);
        if (moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.RangeSelectionModule)) {
            this.gridApi.clearRangeSelection();
        }
        this.focusService.setFocusedCell({ rowIndex: rowIndex, column: columnId, rowPinned, forceBrowserFocus: true });
    }
    addRowEditingListeners() {
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_ROW_EDITING_STARTED, (e) => {
            this.activeRowEdit = { rowIndex: e.rowIndex, rowPinned: e.rowPinned };
        });
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_ROW_EDITING_STOPPED, () => {
            const action = new undoRedoStack_1.UndoRedoAction(this.cellValueChanges);
            this.pushActionsToUndoStack(action);
            this.activeRowEdit = null;
        });
    }
    addCellEditingListeners() {
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_CELL_EDITING_STARTED, (e) => {
            this.activeCellEdit = { column: e.column, rowIndex: e.rowIndex, rowPinned: e.rowPinned };
        });
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_CELL_EDITING_STOPPED, () => {
            this.activeCellEdit = null;
            const shouldPushAction = !this.activeRowEdit && !this.isPasting && !this.isFilling;
            if (shouldPushAction) {
                const action = new undoRedoStack_1.UndoRedoAction(this.cellValueChanges);
                this.pushActionsToUndoStack(action);
            }
        });
    }
    addPasteListeners() {
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_PASTE_START, () => {
            this.isPasting = true;
        });
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_PASTE_END, () => {
            const action = new undoRedoStack_1.UndoRedoAction(this.cellValueChanges);
            this.pushActionsToUndoStack(action);
            this.isPasting = false;
        });
    }
    addFillListeners() {
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_FILL_START, () => {
            this.isFilling = true;
        });
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_FILL_END, (event) => {
            const action = new undoRedoStack_1.FillUndoRedoAction(this.cellValueChanges, event.initialRange, event.finalRange);
            this.pushActionsToUndoStack(action);
            this.isFilling = false;
        });
    }
    pushActionsToUndoStack(action) {
        this.undoStack.push(action);
        this.cellValueChanges = [];
        this.redoStack.clear();
    }
    getRowNode(gridRow) {
        switch (gridRow.rowPinned) {
            case constants_1.Constants.PINNED_TOP:
                return this.pinnedRowModel.getPinnedTopRowData()[gridRow.rowIndex];
            case constants_1.Constants.PINNED_BOTTOM:
                return this.pinnedRowModel.getPinnedBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    }
};
__decorate([
    context_1.Autowired('focusService')
], UndoRedoService.prototype, "focusService", void 0);
__decorate([
    context_1.Autowired('gridApi')
], UndoRedoService.prototype, "gridApi", void 0);
__decorate([
    context_1.Autowired('rowModel')
], UndoRedoService.prototype, "rowModel", void 0);
__decorate([
    context_1.Autowired('pinnedRowModel')
], UndoRedoService.prototype, "pinnedRowModel", void 0);
__decorate([
    context_1.Autowired('cellPositionUtils')
], UndoRedoService.prototype, "cellPositionUtils", void 0);
__decorate([
    context_1.Autowired('rowPositionUtils')
], UndoRedoService.prototype, "rowPositionUtils", void 0);
__decorate([
    context_1.PostConstruct
], UndoRedoService.prototype, "init", null);
UndoRedoService = __decorate([
    context_1.Bean('undoRedoService')
], UndoRedoService);
exports.UndoRedoService = UndoRedoService;
