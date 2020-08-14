import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { Events } from "../eventKeys";
import { CellValueChangedEvent, FillEndEvent } from "../events";
import { FocusController } from "../focusController";
import { IRowModel } from "../interfaces/iRowModel";
import { GridApi } from "../gridApi";
import { PinnedRowModel } from "../pinnedRowModel/pinnedRowModel";
import { CellValueChange, FillUndoRedoAction, LastFocusedCell, UndoRedoAction, UndoRedoStack } from "./undoRedoStack";
import { RowPosition } from "../entities/rowPosition";
import { RowNode } from "../entities/rowNode";
import { Constants } from "../constants/constants";
import { ModuleNames } from "../modules/moduleNames";
import { ModuleRegistry } from "../modules/moduleRegistry";
import { CellRange, CellRangeParams } from "../interfaces/iRangeController";
import { BeanStub } from "../context/beanStub";

@Bean('undoRedoService')
export class UndoRedoService extends BeanStub {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('focusController') private focusController: FocusController;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;

    private cellValueChanges: CellValueChange[] = [];

    private undoStack: UndoRedoStack;
    private redoStack: UndoRedoStack;

    private isCellEditing = false;
    private isRowEditing = false;
    private isPasting = false;
    private isFilling = false;

    @PostConstruct
    public init(): void {

        if (!this.gridOptionsWrapper.isUndoRedoCellEditing()) {
            return;
        }

        const undoRedoLimit = this.gridOptionsWrapper.getUndoRedoCellEditingLimit();
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
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_GROUP_OPENED, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PINNED, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.clearStacks);
        this.addManagedListener(this.eventService, Events.EVENT_ROW_DRAG_END, this.clearStacks);
    }

    private onCellValueChanged = (event: CellValueChangedEvent): void => {
        const shouldCaptureAction = this.isCellEditing || this.isRowEditing || this.isPasting || this.isFilling;
        if (!shouldCaptureAction) {
            return;
        }

        const { rowPinned, rowIndex, column, oldValue, value } = event;

        const cellValueChange: CellValueChange = {
            rowPinned: rowPinned,
            rowIndex: rowIndex,
            columnId: column.getColId(),
            oldValue: oldValue,
            newValue: value
        };

        this.cellValueChanges.push(cellValueChange);
    };

    private clearStacks = () => {
        this.undoStack.clear();
        this.redoStack.clear();
    };


    public getCurrentUndoStackSize(): number {
        return this.undoStack ? this.undoStack.getCurrentStackSize() : 0;
    }

    public getCurrentRedoStackSize(): number {
        return this.redoStack ? this.redoStack.getCurrentStackSize() : 0;
    }

    public undo() {
        if (!this.undoStack) {
            return;
        }

        const undoAction: UndoRedoAction = this.undoStack.pop();
        if (!undoAction || !undoAction.cellValueChanges) {
            return;
        }

        this.processAction(undoAction, (cellValueChange: CellValueChange) => cellValueChange.oldValue);

        if (undoAction instanceof FillUndoRedoAction) {
            this.processRangeAndCellFocus(undoAction.cellValueChanges, undoAction.initialRange);
        } else {
            this.processRangeAndCellFocus(undoAction.cellValueChanges);
        }

        this.redoStack.push(undoAction);
    }

    public redo() {
        if (!this.redoStack) {
            return;
        }

        const redoAction: UndoRedoAction = this.redoStack.pop();
        if (!redoAction || !redoAction.cellValueChanges) {
            return;
        }

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
            if (currentRow.rowTop == null) {
                return;
            }

            currentRow.setDataValue(columnId, valueExtractor(cellValueChange));
        });
    }

    private processRangeAndCellFocus(cellValueChanges: CellValueChange[], range?: CellRange) {
        if (range) {
            const startRow = range.startRow;
            const endRow = range.endRow;

            const lastFocusedCell: LastFocusedCell = {
                rowPinned: startRow.rowPinned,
                rowIndex: startRow.rowIndex,
                columnId: range.startColumn.getColId()
            };

            this.setLastFocusedCell(lastFocusedCell);

            const cellRangeParams: CellRangeParams = {
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
        const rowPosition: RowPosition = { rowIndex, rowPinned };
        const row = this.getRowNode(rowPosition);

        const lastFocusedCell: LastFocusedCell = {
            rowPinned: cellValueChange.rowPinned,
            rowIndex: row.rowIndex,
            columnId: cellValueChange.columnId
        };

        this.setLastFocusedCell(lastFocusedCell);
    }

    private setLastFocusedCell(lastFocusedCell: LastFocusedCell) {
        const { rowIndex, columnId, rowPinned } = lastFocusedCell;

        this.gridApi.ensureIndexVisible(rowIndex);
        this.gridApi.ensureColumnVisible(columnId);

        if (ModuleRegistry.isRegistered(ModuleNames.RangeSelectionModule)) {
            this.gridApi.clearRangeSelection();
        }

        this.focusController.setFocusedCell(rowIndex, columnId, rowPinned, true);
    }

    private addRowEditingListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_ROW_EDITING_STARTED, () => {
            this.isRowEditing = true;
        });
        this.addManagedListener(this.eventService, Events.EVENT_ROW_EDITING_STOPPED, () => {
            const action = new UndoRedoAction(this.cellValueChanges);
            this.pushActionsToUndoStack(action);
            this.isRowEditing = false;
        });
    }

    private addCellEditingListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_CELL_EDITING_STARTED, () => {
            this.isCellEditing = true;
        });
        this.addManagedListener(this.eventService, Events.EVENT_CELL_EDITING_STOPPED, () => {
            this.isCellEditing = false;

            const shouldPushAction = !this.isRowEditing && !this.isPasting && !this.isFilling;
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

    private pushActionsToUndoStack(action: UndoRedoAction) {
        this.undoStack.push(action);

        this.cellValueChanges = [];
        this.redoStack.clear();
    }

    private getRowNode(gridRow: RowPosition): RowNode | null {
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
