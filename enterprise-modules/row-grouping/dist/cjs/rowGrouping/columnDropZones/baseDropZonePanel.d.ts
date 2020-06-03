import { Column, Component, Context, DragAndDropService, EventService, GridOptionsWrapper, LoggerFactory } from "@ag-grid-community/core";
export interface BaseDropZonePanelParams {
    dragAndDropIcon: string;
    emptyMessage: string;
    title: string;
    icon: HTMLElement;
}
export interface BaseDropZonePanelBeans {
    gridOptionsWrapper: GridOptionsWrapper;
    eventService: EventService;
    context: Context;
    loggerFactory: LoggerFactory;
    dragAndDropService: DragAndDropService;
}
export declare abstract class BaseDropZonePanel extends Component {
    private horizontal;
    private valueColumn;
    private static STATE_NOT_DRAGGING;
    private static STATE_NEW_COLUMNS_IN;
    private static STATE_REARRANGE_COLUMNS;
    private state;
    private dropTarget;
    private potentialDndColumns;
    private guiDestroyFunctions;
    private params;
    private beans;
    private childColumnComponents;
    private insertIndex;
    private eColumnDropList;
    protected abstract isColumnDroppable(column: Column): boolean;
    protected abstract updateColumns(columns: Column[]): void;
    protected abstract getExistingColumns(): Column[];
    protected abstract getIconName(): string;
    constructor(horizontal: boolean, valueColumn: boolean);
    isHorizontal(): boolean;
    setBeans(beans: BaseDropZonePanelBeans): void;
    protected destroy(): void;
    private destroyGui;
    init(params: BaseDropZonePanelParams): void;
    private addElementClasses;
    private setupDropTarget;
    private isInterestedIn;
    private checkInsertIndex;
    private getNewHorizontalInsertIndex;
    private getNewVerticalInsertIndex;
    private checkDragStartedBySelf;
    private onDragging;
    private onDragEnter;
    protected isPotentialDndColumns(): boolean;
    private onDragLeave;
    private onDragStop;
    private removeColumns;
    private addColumns;
    private rearrangeColumns;
    refreshGui(): void;
    private getNonGhostColumns;
    private addColumnsToGui;
    private createColumnComponent;
    private addIconAndTitleToGui;
    private isExistingColumnsEmpty;
    private addEmptyMessageToGui;
    private addArrow;
}
