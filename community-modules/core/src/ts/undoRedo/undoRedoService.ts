import { Autowired, Bean, Optional, PostConstruct } from "../context/context";
import { Events } from "../eventKeys";
import { CellEditingStartedEvent, CellValueChangedEvent, FillEndEvent, RowEditingStartedEvent } from "../events";
import { FocusService } from "../focusService";
import { IRowModel } from "../interfaces/iRowModel";
import { PinnedRowModel } from "../pinnedRowModel/pinnedRowModel";
import { CellValueChange, FillUndoRedoAction, LastFocusedCell, UndoRedoAction, UndoRedoStack } from "./undoRedoStack";
import { RowPosition, RowPositionUtils } from "../entities/rowPosition";
import { RowNode } from "../entities/rowNode";
import { Constants } from "../constants/constants";
import { CellRange, CellRangeParams, IRangeService } from "../interfaces/IRangeService";
import { BeanStub } from "../context/beanStub";
import { CellPosition, CellPositionUtils } from "../entities/cellPosition";
import { Column } from '../entities/column';
import { ColumnModel } from "../columns/columnModel";
import { CtrlsService } from "../ctrlsService";
import { GridBodyCtrl } from "../gridBodyComp/gridBodyCtrl";

@Bean('undoRedoService')
export class UndoRedoService extends BeanStub {

    @Autowired('focusService') private focusService: FocusService;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;
    @Autowired('cellPositionUtils') private cellPositionUtils: CellPositionUtils;
    @Autowired('rowPositionUtils') private rowPositionUtils: RowPositionUtils;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Optional('rangeService') private readonly rangeService: IRangeService;

    private gridBodyCtrl: GridBodyCtrl;

    private cellValueChanges: CellValueChange[] = [];

    private undoStack: UndoRedoStack;
    private redoStack: UndoRedoStack;

    private activeCellEdit: CellPosition | null = null;
    private activeRowEdit: RowPosition | null = null;

    private isPasting = false;
    private isFilling = false;
    private isChangeFromKeyShortcuts = false;

    @PostConstruct
    public init(): void {
        if (!this.gridOptionsWrapper.isUndoRedoCellEditing()) { return; }

        const undoRedoLimit = this.gridOptionsWrapper.getUndoRedoCellEditingLimit();

        if (undoRedoLimit! <= 0) { return; }

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
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, e => {
            if (!e.keepUndoRedoStack) {
                this.clearStacks();
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

        this.ctrlsService.whenReady(() => {
            this.gridBodyCtrl = this.ctrlsService.getGridBodyCtrl();
        });
    }

    private onCellValueChanged = (event: CellValueChangedEvent): void => {
        const eventCell: CellPosition = { column: event.column, rowIndex: event.rowIndex!, rowPinned: event.rowPinned };
        const isCellEditing = this.activeCellEdit !== null && this.cellPositionUtils.equals(this.activeCellEdit, eventCell);
        const isRowEditing = this.activeRowEdit !== null && this.rowPositionUtils.sameRow(this.activeRowEdit, eventCell);

        const shouldCaptureAction = isCellEditing || isRowEditing || this.isPasting || this.isFilling || this.isChangeFromKeyShortcuts;

        if (!shouldCaptureAction) { return; }

        const { rowPinned, rowIndex, column, oldValue, value } = event;

        const cellValueChange: CellValueChange = {
            rowPinned,
            rowIndex: rowIndex!,
            columnId: column.getColId(),
            newValue: value,
            oldValue
        };

        this.cellValueChanges.push(cellValueChange);
    }

    private clearStacks = () => {
        this.undoStack.clear();
        this.redoStack.clear();
    }

    public getCurrentUndoStackSize(): number {
        return this.undoStack ? this.undoStack.getCurrentStackSize() : 0;
    }

    public getCurrentRedoStackSize(): number {
        return this.redoStack ? this.redoStack.getCurrentStackSize() : 0;
    }

    public undo() {
        if (!this.undoStack) { return; }

        const undoAction: UndoRedoAction | undefined = this.undoStack.pop();

        if (!undoAction || !undoAction.cellValueChanges) { return; }

        this.processAction(undoAction, (cellValueChange: CellValueChange) => cellValueChange.oldValue);

        if (undoAction instanceof FillUndoRedoAction) {
            this.processRangeAndCellFocus(undoAction.cellValueChanges, undoAction.initialRange);
        } else {
            this.processRangeAndCellFocus(undoAction.cellValueChanges);
        }

        this.redoStack.push(undoAction);
    }

    public redo() {
        if (!this.redoStack) { return; }

        const redoAction: UndoRedoAction | undefined = this.redoStack.pop();

        if (!redoAction || !redoAction.cellValueChanges) { return; }

        this.processAction(redoAction, (cellValueChange: CellValueChange) => cellValueChange.newValue);

        if (redoAction instanceof FillUndoRedoAction) {
            this.processRangeAndCellFocus(redoAction.cellValueChanges, redoAction.finalRange);
        } else {
            this.processRangeAndCellFocus(redoAction.cellValueChanges);
        }

        this.undoStack.push(redoAction);
    }

    private processAction(action: UndoRedoAction, valueExtractor: (cellValueChange: CellValueChange) => any) {
        action.cellValueChanges.forEach(cellValueChange => {
            const { rowIndex, rowPinned, columnId } = cellValueChange;
            const rowPosition: RowPosition = { rowIndex, rowPinned };
            const currentRow = this.getRowNode(rowPosition);

            // checks if the row has been filtered out
            if (!currentRow!.displayed) { return; }

            const extractedValue = valueExtractor(cellValueChange);

            // when values are 'complex objects' we need to invoke their `toString()` to obtain value
            const value = (typeof extractedValue.toString === 'function') ? extractedValue.toString() : extractedValue;

            currentRow!.setDataValue(columnId, value);
        });
    }

    private processRangeAndCellFocus(cellValueChanges: CellValueChange[], range?: CellRange) {
        let lastFocusedCell: LastFocusedCell;

        if (range) {
            const startRow = range.startRow;
            const endRow = range.endRow;

            lastFocusedCell = {
                rowPinned: startRow!.rowPinned,
                rowIndex: startRow!.rowIndex,
                columnId: range.startColumn.getColId()
            };

            this.setLastFocusedCell(lastFocusedCell);

            const cellRangeParams: CellRangeParams = {
                rowStartIndex: startRow!.rowIndex,
                rowStartPinned: startRow!.rowPinned,
                rowEndIndex: endRow!.rowIndex,
                rowEndPinned: endRow!.rowPinned,
                columnStart: range.startColumn,
                columns: range.columns
            };

            this.rangeService.addCellRange(cellRangeParams);

            return;
        }

        const cellValueChange = cellValueChanges[0];
        const { rowIndex, rowPinned } = cellValueChange;
        const rowPosition: RowPosition = { rowIndex, rowPinned };
        const row = this.getRowNode(rowPosition);

        lastFocusedCell = {
            rowPinned: cellValueChange.rowPinned,
            rowIndex: row!.rowIndex!,
            columnId: cellValueChange.columnId
        };

        this.setLastFocusedCell(lastFocusedCell);
    }

    private setLastFocusedCell(lastFocusedCell: LastFocusedCell) {
        const { rowIndex, columnId, rowPinned } = lastFocusedCell;
        const isRangeEnabled = this.rangeService && this.gridOptionsWrapper.isEnableRangeSelection();
        const scrollFeature = this.gridBodyCtrl.getScrollFeature();

        const column: Column | null = this.columnModel.getGridColumn(columnId);

        if (!column) { return; }

        scrollFeature.ensureIndexVisible(rowIndex);
        scrollFeature.ensureColumnVisible(column);

        const cellPosition: CellPosition = { rowIndex, column, rowPinned };
        this.focusService.setFocusedCell({ ...cellPosition, forceBrowserFocus: true });

        if (isRangeEnabled) {
            this.rangeService.setRangeToCell(cellPosition);
        }
    }

    private addRowEditingListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_ROW_EDITING_STARTED, (e: RowEditingStartedEvent) => {
            this.activeRowEdit = { rowIndex: e.rowIndex!, rowPinned: e.rowPinned};
        });

        this.addManagedListener(this.eventService, Events.EVENT_ROW_EDITING_STOPPED, () => {
            const action = new UndoRedoAction(this.cellValueChanges);
            this.pushActionsToUndoStack(action);
            this.activeRowEdit = null;
        });
    }

    private addCellEditingListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_CELL_EDITING_STARTED, (e: CellEditingStartedEvent) => {
            this.activeCellEdit = { column: e.column, rowIndex: e.rowIndex!, rowPinned: e.rowPinned };
        });

        this.addManagedListener(this.eventService, Events.EVENT_CELL_EDITING_STOPPED, () => {
            this.activeCellEdit = null;

            const shouldPushAction = !this.activeRowEdit && !this.isPasting && !this.isFilling && !this.isChangeFromKeyShortcuts;

            if (shouldPushAction) {
                const action = new UndoRedoAction(this.cellValueChanges);
                this.pushActionsToUndoStack(action);
            }
        });
    }

    private addPasteListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_PASTE_START, () => {
            this.isPasting = true;
        });

        this.addManagedListener(this.eventService, Events.EVENT_PASTE_END, () => {
            const action = new UndoRedoAction(this.cellValueChanges);
            this.pushActionsToUndoStack(action);
            this.isPasting = false;
        });
    }

    private addFillListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_FILL_START, () => {
            this.isFilling = true;
        });

        this.addManagedListener(this.eventService, Events.EVENT_FILL_END, (event: FillEndEvent) => {
            const action = new FillUndoRedoAction(this.cellValueChanges, event.initialRange, event.finalRange);
            this.pushActionsToUndoStack(action);
            this.isFilling = false;
        });
    }

    private addCellKeyListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_START, () => {
            this.isChangeFromKeyShortcuts = true;
        });

        this.addManagedListener(this.eventService, Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_END, () => {
            const action = new UndoRedoAction(this.cellValueChanges);
            this.pushActionsToUndoStack(action);
            this.isChangeFromKeyShortcuts = false;
        });
    }

    private pushActionsToUndoStack(action: UndoRedoAction) {
        this.undoStack.push(action);

        this.cellValueChanges = [];
        this.redoStack.clear();
    }

    private getRowNode(gridRow: RowPosition): RowNode | undefined {
        switch (gridRow.rowPinned) {
            case Constants.PINNED_TOP:
                return this.pinnedRowModel.getPinnedTopRowData()[gridRow.rowIndex];
            case Constants.PINNED_BOTTOM:
                return this.pinnedRowModel.getPinnedBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    }
}
