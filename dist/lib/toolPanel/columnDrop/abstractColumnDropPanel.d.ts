// ag-grid-enterprise v5.2.0
import { Component, EventService, GridOptionsWrapper, Context, LoggerFactory, DragAndDropService, Column } from "ag-grid/main";
export interface AbstractColumnDropPanelParams {
    dragAndDropIcon: string;
    emptyMessage: string;
    title: string;
    iconFactory: () => HTMLImageElement;
}
export interface AbstractColumnDropPanelBeans {
    gridOptionsWrapper: GridOptionsWrapper;
    eventService: EventService;
    context: Context;
    loggerFactory: LoggerFactory;
    dragAndDropService: DragAndDropService;
}
export declare abstract class AbstractColumnDropPanel extends Component {
    private logger;
    private dropTarget;
    private potentialDndColumns;
    private guiDestroyFunctions;
    private params;
    private beans;
    private horizontal;
    private valueColumn;
    protected abstract isColumnDroppable(column: Column): boolean;
    protected abstract removeColumns(columns: Column[]): void;
    protected abstract addColumns(columns: Column[]): void;
    protected abstract getExistingColumns(): Column[];
    protected abstract getIconName(): string;
    constructor(horizontal: boolean, valueColumn: boolean);
    isHorizontal(): boolean;
    setBeans(beans: AbstractColumnDropPanelBeans): void;
    destroy(): void;
    private destroyGui();
    init(params: AbstractColumnDropPanelParams): void;
    private setupDropTarget();
    private onDragging();
    private onDragEnter(draggingEvent);
    protected isPotentialDndColumns(): boolean;
    private onDragLeave(draggingEvent);
    private onDragStop();
    refreshGui(): void;
    private addPotentialDragItemsToGui();
    private addExistingColumnsToGui();
    private addIconAndTitleToGui();
    private isExistingColumnsEmpty();
    private addEmptyMessageToGui();
    private addArrowToGui();
}
