// Type definitions for @ag-grid-community/core v22.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare class UndoRedoService {
    private gridOptionsWrapper;
    private focusedCellController;
    private eventService;
    private gridApi;
    private rowModel;
    private pinnedRowModel;
    private cellValueChanges;
    private undoStack;
    private redoStack;
    private isCellEditing;
    private isRowEditing;
    private isPasting;
    private isFilling;
    init(): void;
    private onCellValueChanged;
    private clearStacks;
    undo(): void;
    redo(): void;
    private processAction;
    private processRangeAndCellFocus;
    private setLastFocusedCell;
    private addRowEditingListeners;
    private addCellEditingListeners;
    private addPasteListeners;
    private addFillListeners;
    private pushActionsToUndoStack;
    private getRowNode;
}
