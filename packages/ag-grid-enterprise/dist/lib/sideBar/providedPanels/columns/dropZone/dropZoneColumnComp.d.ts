// ag-grid-enterprise v21.2.2
import { PopupService, Component, ColumnController, EventService, DragAndDropService, GridOptionsWrapper, DropTarget, Column, AgEvent } from "ag-grid-community";
import { AggFuncService } from "../../../../aggregation/aggFuncService";
export interface ColumnRemoveEvent extends AgEvent {
}
export declare class DropZoneColumnComp extends Component {
    static EVENT_COLUMN_REMOVE: string;
    private static TEMPLATE;
    dragAndDropService: DragAndDropService;
    columnController: ColumnController;
    popupService: PopupService;
    aggFuncService: AggFuncService;
    gridOptionsWrapper: GridOptionsWrapper;
    eventService: EventService;
    private columnApi;
    private gridApi;
    private eText;
    private eDragHandle;
    private btRemove;
    private column;
    private dragSourceDropTarget;
    private ghost;
    private displayName;
    private valueColumn;
    private popupShowing;
    constructor(column: Column, dragSourceDropTarget: DropTarget, ghost: boolean, valueColumn: boolean);
    init(): void;
    private addDragSource;
    private createDragItem;
    private setupComponents;
    private setupRemove;
    private setTextValue;
    private onShowAggFuncSelection;
    private createAggSelect;
}
