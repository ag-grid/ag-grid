/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
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
exports.UndoRedoService = void 0;
const context_1 = require("../context/context");
const eventKeys_1 = require("../eventKeys");
const undoRedoStack_1 = require("./undoRedoStack");
const beanStub_1 = require("../context/beanStub");
let UndoRedoService = class UndoRedoService extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.cellValueChanges = [];
        this.activeCellEdit = null;
        this.activeRowEdit = null;
        this.isPasting = false;
        this.isRangeInAction = false;
        this.onCellValueChanged = (event) => {
            const eventCell = { column: event.column, rowIndex: event.rowIndex, rowPinned: event.rowPinned };
            const isCellEditing = this.activeCellEdit !== null && this.cellPositionUtils.equals(this.activeCellEdit, eventCell);
            const isRowEditing = this.activeRowEdit !== null && this.rowPositionUtils.sameRow(this.activeRowEdit, eventCell);
            const shouldCaptureAction = isCellEditing || isRowEditing || this.isPasting || this.isRangeInAction;
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
        if (!this.gridOptionsService.is('undoRedoCellEditing')) {
            return;
        }
        const undoRedoLimit = this.gridOptionsService.getNum('undoRedoCellEditingLimit');
        if (undoRedoLimit <= 0) {
            return;
        }
        this.undoStack = new undoRedoStack_1.UndoRedoStack(undoRedoLimit);
        this.redoStack = new undoRedoStack_1.UndoRedoStack(undoRedoLimit);
        this.addRowEditingListeners();
        this.addCellEditingListeners();
        this.addPasteListeners();
        this.addFillListeners();
        this.addCellKeyListeners();
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
        this.ctrlsService.whenReady(() => {
            this.gridBodyCtrl = this.ctrlsService.getGridBodyCtrl();
        });
    }
    getCurrentUndoStackSize() {
        return this.undoStack ? this.undoStack.getCurrentStackSize() : 0;
    }
    getCurrentRedoStackSize() {
        return this.redoStack ? this.redoStack.getCurrentStackSize() : 0;
    }
    undo(source) {
        const startEvent = {
            type: eventKeys_1.Events.EVENT_UNDO_STARTED,
            source
        };
        this.eventService.dispatchEvent(startEvent);
        const operationPerformed = this.undoRedo(this.undoStack, this.redoStack, 'initialRange', 'oldValue', 'undo');
        const endEvent = {
            type: eventKeys_1.Events.EVENT_UNDO_ENDED,
            source,
            operationPerformed
        };
        this.eventService.dispatchEvent(endEvent);
    }
    redo(source) {
        const startEvent = {
            type: eventKeys_1.Events.EVENT_REDO_STARTED,
            source
        };
        this.eventService.dispatchEvent(startEvent);
        const operationPerformed = this.undoRedo(this.redoStack, this.undoStack, 'finalRange', 'newValue', 'redo');
        const endEvent = {
            type: eventKeys_1.Events.EVENT_REDO_ENDED,
            source,
            operationPerformed
        };
        this.eventService.dispatchEvent(endEvent);
    }
    undoRedo(undoRedoStack, opposingUndoRedoStack, rangeProperty, cellValueChangeProperty, source) {
        if (!undoRedoStack) {
            return false;
        }
        const undoRedoAction = undoRedoStack.pop();
        if (!undoRedoAction || !undoRedoAction.cellValueChanges) {
            return false;
        }
        this.processAction(undoRedoAction, (cellValueChange) => cellValueChange[cellValueChangeProperty], source);
        if (undoRedoAction instanceof undoRedoStack_1.RangeUndoRedoAction) {
            this.processRange(undoRedoAction.ranges || [undoRedoAction[rangeProperty]]);
        }
        else {
            this.processCell(undoRedoAction.cellValueChanges);
        }
        opposingUndoRedoStack.push(undoRedoAction);
        return true;
    }
    processAction(action, valueExtractor, source) {
        action.cellValueChanges.forEach(cellValueChange => {
            const { rowIndex, rowPinned, columnId } = cellValueChange;
            const rowPosition = { rowIndex, rowPinned };
            const currentRow = this.getRowNode(rowPosition);
            // checks if the row has been filtered out
            if (!currentRow.displayed) {
                return;
            }
            currentRow.setDataValue(columnId, valueExtractor(cellValueChange), source);
        });
    }
    processRange(ranges) {
        let lastFocusedCell;
        this.rangeService.removeAllCellRanges(true);
        ranges.forEach((range, idx) => {
            if (!range) {
                return;
            }
            const startRow = range.startRow;
            const endRow = range.endRow;
            if (idx === ranges.length - 1) {
                lastFocusedCell = {
                    rowPinned: startRow.rowPinned,
                    rowIndex: startRow.rowIndex,
                    columnId: range.startColumn.getColId()
                };
                this.setLastFocusedCell(lastFocusedCell);
            }
            const cellRangeParams = {
                rowStartIndex: startRow.rowIndex,
                rowStartPinned: startRow.rowPinned,
                rowEndIndex: endRow.rowIndex,
                rowEndPinned: endRow.rowPinned,
                columnStart: range.startColumn,
                columns: range.columns
            };
            this.rangeService.addCellRange(cellRangeParams);
        });
    }
    processCell(cellValueChanges) {
        const cellValueChange = cellValueChanges[0];
        const { rowIndex, rowPinned } = cellValueChange;
        const rowPosition = { rowIndex, rowPinned };
        const row = this.getRowNode(rowPosition);
        const lastFocusedCell = {
            rowPinned: cellValueChange.rowPinned,
            rowIndex: row.rowIndex,
            columnId: cellValueChange.columnId
        };
        // when single cells are being processed, they should be considered
        // as ranges when the rangeService is present (singleCellRanges).
        // otherwise focus will be restore but the range will not.
        this.setLastFocusedCell(lastFocusedCell, !!this.rangeService);
    }
    setLastFocusedCell(lastFocusedCell, setRangeToCell) {
        const { rowIndex, columnId, rowPinned } = lastFocusedCell;
        const scrollFeature = this.gridBodyCtrl.getScrollFeature();
        const column = this.columnModel.getGridColumn(columnId);
        if (!column) {
            return;
        }
        scrollFeature.ensureIndexVisible(rowIndex);
        scrollFeature.ensureColumnVisible(column);
        const cellPosition = { rowIndex, column, rowPinned };
        this.focusService.setFocusedCell(Object.assign(Object.assign({}, cellPosition), { forceBrowserFocus: true }));
        if (setRangeToCell) {
            this.rangeService.setRangeToCell(cellPosition);
        }
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
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_CELL_EDITING_STOPPED, (e) => {
            this.activeCellEdit = null;
            const shouldPushAction = e.valueChanged && !this.activeRowEdit && !this.isPasting && !this.isRangeInAction;
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
            this.isRangeInAction = true;
        });
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_FILL_END, (event) => {
            const action = new undoRedoStack_1.RangeUndoRedoAction(this.cellValueChanges, event.initialRange, event.finalRange);
            this.pushActionsToUndoStack(action);
            this.isRangeInAction = false;
        });
    }
    addCellKeyListeners() {
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_START, () => {
            this.isRangeInAction = true;
        });
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_END, () => {
            let action;
            if (this.rangeService && this.gridOptionsService.isEnableRangeSelection()) {
                action = new undoRedoStack_1.RangeUndoRedoAction(this.cellValueChanges, undefined, undefined, [...this.rangeService.getCellRanges()]);
            }
            else {
                action = new undoRedoStack_1.UndoRedoAction(this.cellValueChanges);
            }
            this.pushActionsToUndoStack(action);
            this.isRangeInAction = false;
        });
    }
    pushActionsToUndoStack(action) {
        this.undoStack.push(action);
        this.cellValueChanges = [];
        this.redoStack.clear();
    }
    getRowNode(gridRow) {
        switch (gridRow.rowPinned) {
            case 'top':
                return this.pinnedRowModel.getPinnedTopRowData()[gridRow.rowIndex];
            case 'bottom':
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
    context_1.Autowired('ctrlsService')
], UndoRedoService.prototype, "ctrlsService", void 0);
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
    context_1.Autowired('columnModel')
], UndoRedoService.prototype, "columnModel", void 0);
__decorate([
    context_1.Optional('rangeService')
], UndoRedoService.prototype, "rangeService", void 0);
__decorate([
    context_1.PostConstruct
], UndoRedoService.prototype, "init", null);
UndoRedoService = __decorate([
    context_1.Bean('undoRedoService')
], UndoRedoService);
exports.UndoRedoService = UndoRedoService;
