// ag-grid-enterprise v16.0.1
import { Component, EventService, GridOptionsWrapper, Context, LoggerFactory, DragAndDropService, Column } from "ag-grid/main";
export interface AbstractColumnDropPanelParams {
    dragAndDropIcon: string;
    emptyMessage: string;
    title: string;
    icon: HTMLElement;
}
export interface AbstractColumnDropPanelBeans {
    gridOptionsWrapper: GridOptionsWrapper;
    eventService: EventService;
    context: Context;
    loggerFactory: LoggerFactory;
    dragAndDropService: DragAndDropService;
}
export declare abstract class AbstractColumnDropPanel extends Component {
    private static STATE_NOT_DRAGGING;
    private static STATE_NEW_COLUMNS_IN;
    private static STATE_REARRANGE_COLUMNS;
    private static CHAR_LEFT_ARROW;
    private static CHAR_RIGHT_ARROW;
    private state;
    private logger;
    private dropTarget;
    private potentialDndColumns;
    private guiDestroyFunctions;
    private params;
    private beans;
    private childColumnComponents;
    private insertIndex;
    private horizontal;
    private valueColumn;
    protected abstract isColumnDroppable(column: Column): boolean;
    protected abstract updateColumns(columns: Column[]): void;
    protected abstract getExistingColumns(): Column[];
    protected abstract getIconName(): string;
    constructor(horizontal: boolean, valueColumn: boolean, name: string);
    isHorizontal(): boolean;
    setBeans(beans: AbstractColumnDropPanelBeans): void;
    destroy(): void;
    private destroyGui();
    init(params: AbstractColumnDropPanelParams): void;
    private setupDropTarget();
    private isInterestedIn(type);
    private checkInsertIndex(draggingEvent);
    private getNewHorizontalInsertIndex(draggingEvent);
    private getNewVerticalInsertIndex(draggingEvent);
    private checkDragStartedBySelf(draggingEvent);
    private onDragging(draggingEvent);
    private onDragEnter(draggingEvent);
    protected isPotentialDndColumns(): boolean;
    private onDragLeave(draggingEvent);
    private onDragStop();
    private removeColumns(columnsToRemove);
    private addColumns(columnsToAdd);
    private rearrangeColumns(columnsToAdd);
    refreshGui(): void;
    private getNonGhostColumns();
    private addColumnsToGui();
    private createColumnComponent(column, ghost);
    private addIconAndTitleToGui();
    private isExistingColumnsEmpty();
    private addEmptyMessageToGui();
    private addArrowToGui();
}
