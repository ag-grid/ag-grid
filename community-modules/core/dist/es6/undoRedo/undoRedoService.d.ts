// Type definitions for @ag-grid-community/core v23.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare class UndoRedoService {
    private gridOptionsWrapper;
    private focusController;
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
    private events;
    init(): void;
    destroy(): void;
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
