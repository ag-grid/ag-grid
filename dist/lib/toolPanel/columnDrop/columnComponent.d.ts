// ag-grid-enterprise v16.0.1
import { PopupService, Component, ColumnController, Context, EventService, DragAndDropService, GridPanel, GridOptionsWrapper, DropTarget, Column, AgEvent } from "ag-grid/main";
import { AggFuncService } from "../../aggregation/aggFuncService";
export interface ColumnRemoveEvent extends AgEvent {
}
export declare class ColumnComponent extends Component {
    static EVENT_COLUMN_REMOVE: string;
    private static TEMPLATE;
    dragAndDropService: DragAndDropService;
    columnController: ColumnController;
    gridPanel: GridPanel;
    context: Context;
    popupService: PopupService;
    aggFuncService: AggFuncService;
    gridOptionsWrapper: GridOptionsWrapper;
    eventService: EventService;
    private columnApi;
    private gridApi;
    private eText;
    private btRemove;
    private column;
    private dragSourceDropTarget;
    private ghost;
    private displayName;
    private valueColumn;
    private popupShowing;
    constructor(column: Column, dragSourceDropTarget: DropTarget, ghost: boolean, valueColumn: boolean);
    init(): void;
    private addDragSource();
    private createDragItem();
    private setupComponents();
    private setupRemove();
    private setTextValue();
    private onShowAggFuncSelection();
    private createAggSelect(hidePopup, value);
}
