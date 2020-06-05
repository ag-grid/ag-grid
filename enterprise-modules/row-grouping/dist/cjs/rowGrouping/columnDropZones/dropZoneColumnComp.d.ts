import { PopupService, Component, ColumnController, DragAndDropService, GridOptionsWrapper, DropTarget, Column, AgEvent, IAggFuncService } from "@ag-grid-community/core";
export interface ColumnRemoveEvent extends AgEvent {
}
export declare class DropZoneColumnComp extends Component {
    private column;
    private dragSourceDropTarget;
    private ghost;
    private valueColumn;
    private horizontal;
    static EVENT_COLUMN_REMOVE: string;
    private static TEMPLATE;
    dragAndDropService: DragAndDropService;
    columnController: ColumnController;
    popupService: PopupService;
    aggFuncService: IAggFuncService;
    gridOptionsWrapper: GridOptionsWrapper;
    private columnApi;
    private gridApi;
    private eText;
    private eDragHandle;
    private eButton;
    private displayName;
    private popupShowing;
    constructor(column: Column, dragSourceDropTarget: DropTarget, ghost: boolean, valueColumn: boolean, horizontal: boolean);
    init(): void;
    private addDragSource;
    private createDragItem;
    private setupComponents;
    private setupRemove;
    private setTextValue;
    private onShowAggFuncSelection;
    private createAggSelect;
    private addElementClasses;
}
