import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Autowired, Bean, PostConstruct} from "../context/context";
import {EventService} from "../eventService";
import {Events} from "../eventKeys";
import {CellValueChangedEvent, FillEndEvent} from "../events";
import {FocusedCellController} from "../focusedCellController";
import {IRowModel} from "../interfaces/iRowModel";
import {GridApi} from "../gridApi";
import {_} from "../utils";
import {PinnedRowModel} from "../pinnedRowModel/pinnedRowModel";
import {CellValueChange, FillUndoRedoAction, LastFocusedCell, UndoRedoAction, UndoRedoStack} from "./undoRedoStack";
import {RowPosition} from "../entities/rowPosition";
import {RowNode} from "../entities/rowNode";
import {Constants} from "../constants";
import {ModuleNames} from "../modules/moduleNames";
import {ModuleRegistry} from "../modules/moduleRegistry";

@Bean('undoRedoService')
export class UndoRedoService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Autowired('eventService') private eventService: EventService;
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
        this.undoStack = new UndoRedoStack(undoRedoLimit);
        this.redoStack = new UndoRedoStack(undoRedoLimit);

        this.addRowEditingListeners();
        this.addCellEditingListeners();
        this.addPasteListeners();
        this.addFillListeners();

        this.eventService.addEventListener(Events.EVENT_CELL_VALUE_CHANGED, this.onCellValueChanged);
    }

    private onCellValueChanged = (event: CellValueChangedEvent): void => {
        const shouldCaptureAction = this.isCellEditing || this.isRowEditing || this.isPasting || this.isFilling;
        if (!shouldCaptureAction) {
            return;
        }

        const {rowPinned, rowIndex, column, oldValue, value} = event;

        const cellValueChange: CellValueChange = {
            rowPinned: rowPinned,
            rowIndex: rowIndex,
            columnId: column.getColId(),
            oldValue: oldValue,
            newValue: value
        };

        this.cellValueChanges.push(cellValueChange);
    };

    public undo() {
        const undoAction: UndoRedoAction = this.undoStack.pop();
        if (!undoAction || !undoAction.cellValueChanges) return;

        this.processAction(undoAction, (cellValueChange: CellValueChange) => cellValueChange.oldValue);

        this.redoStack.push(undoAction);
    }

    public redo() {
        const redoAction: UndoRedoAction = this.redoStack.pop();
        if (!redoAction || !redoAction.cellValueChanges) {
            return;
        }

        this.processAction(redoAction, (cellValueChange: CellValueChange) => cellValueChange.newValue);

        this.undoStack.push(redoAction);
    }

    private processAction(action: UndoRedoAction, valueExtractor: (cellValueChange: CellValueChange) => any) {
        action.cellValueChanges.forEach(cellValueChange => {
            const {rowIndex, rowPinned, columnId} = cellValueChange;
            const rowPosition: RowPosition = {rowIndex, rowPinned};
            const currentRow = this.getRowNode(rowPosition);

            // checks if the row has been filtered out
            if (currentRow.rowTop == null) {
                return;
            }

            currentRow.setDataValue(columnId, valueExtractor(cellValueChange));
        });

        if (action instanceof FillUndoRedoAction) {
            this.setLastFocusedCell(action.lastFocusedCell);
            return;
        }

        const cellValueChange = action.cellValueChanges[0];
        const {rowIndex, rowPinned} = cellValueChange;
        const rowPosition: RowPosition = {rowIndex, rowPinned};
        const row = this.getRowNode(rowPosition);

        const lastFocusedCell: LastFocusedCell = {
            rowPinned: cellValueChange.rowPinned,
            rowIndex: row.rowIndex,
            columnId: cellValueChange.columnId
        };

        this.setLastFocusedCell(lastFocusedCell);
    }

    private setLastFocusedCell(lastFocusedCell: LastFocusedCell) {
        const {rowIndex, columnId, rowPinned} = lastFocusedCell;

        this.gridApi.ensureIndexVisible(rowIndex);
        this.gridApi.ensureColumnVisible(columnId);

        if (ModuleRegistry.isRegistered(ModuleNames.RangeSelectionModule)) {
            this.gridApi.clearRangeSelection();
        }

        this.focusedCellController.setFocusedCell(rowIndex, columnId, rowPinned, true);
    }

    private addRowEditingListeners() {
        this.eventService.addEventListener(Events.EVENT_ROW_EDITING_STARTED, () => {
            this.isRowEditing = true;
        });

        this.eventService.addEventListener(Events.EVENT_ROW_EDITING_STOPPED, () => {
            const action = new UndoRedoAction(this.cellValueChanges);
            this.pushActionsToUndoStack(action);
            this.isRowEditing = false;
        });
    }

    private addCellEditingListeners() {
        this.eventService.addEventListener(Events.EVENT_CELL_EDITING_STARTED, () => {
            this.isCellEditing = true;
        });

        this.eventService.addEventListener(Events.EVENT_CELL_EDITING_STOPPED, () => {
            this.isCellEditing = false;

            const shouldPushAction = !this.isRowEditing && !this.isPasting && !this.isFilling;
            if (shouldPushAction) {
                const action = new UndoRedoAction(this.cellValueChanges);
                this.pushActionsToUndoStack(action);
            }
        });
    }

    private addPasteListeners() {
        this.eventService.addEventListener(Events.EVENT_PASTE_START, () => {
            this.isPasting = true;
        });

        this.eventService.addEventListener(Events.EVENT_PASTE_END, () => {
            const action = new UndoRedoAction(this.cellValueChanges);
            this.pushActionsToUndoStack(action);
            this.isPasting = false;
        });
    }

    private addFillListeners() {
        this.eventService.addEventListener(Events.EVENT_FILL_START, () => {
            this.isFilling = true;
        });

        this.eventService.addEventListener(Events.EVENT_FILL_END, (event: FillEndEvent) => {
            const row = event.initialRange.endRow;
            const column = _.last(event.initialRange.columns);

            const lastFocusedCell: LastFocusedCell = {
                rowIndex: row.rowIndex,
                columnId: column.getColId()
            };

            const action = new FillUndoRedoAction(this.cellValueChanges, lastFocusedCell);
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
