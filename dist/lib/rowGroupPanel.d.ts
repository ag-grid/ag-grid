// ag-grid-enterprise v4.0.7
import { Component } from "ag-grid/main";
import { ColumnController } from "ag-grid/main";
import { EventService } from "ag-grid/main";
import { Context } from "ag-grid/main";
import { LoggerFactory } from "ag-grid/main";
import { DragAndDropService } from "ag-grid/main";
import { GridOptionsWrapper } from "ag-grid/main";
import { GridPanel } from "ag-grid/main";
export declare class RowGroupPanel extends Component {
    columnController: ColumnController;
    context: Context;
    loggerFactory: LoggerFactory;
    dragAndDropService: DragAndDropService;
    gridOptionsWrapper: GridOptionsWrapper;
    gridPanel: GridPanel;
    globalEventService: EventService;
    private logger;
    private dropTarget;
    private ePotentialDropGui;
    constructor();
    agWire(): void;
    init(): void;
    private setupDropTarget();
    private onDragging();
    private onDragEnter(draggingEvent);
    private onDragLeave(draggingEvent);
    private onDragStop(draggingEvent);
    private onColumnChanged();
    private removePotentialDropFromGui();
    private addPotentialDropToGui(column);
    private addColumnsToGui(columns);
    private addEmptyMessageToGui();
}
