import { Column, DraggingEvent, DropTarget, PillDropZonePanel, PillDropZonePanelParams, DragItem, ColumnModel, ColumnEventType, DragSourceType } from "@ag-grid-community/core";
import { DropZoneColumnComp } from "./dropZoneColumnComp";
export type TDropZone = 'rowGroup' | 'pivot' | 'aggregation';
export declare abstract class BaseDropZonePanel extends PillDropZonePanel<DropZoneColumnComp, Column> {
    private dropZonePurpose;
    protected readonly columnModel: ColumnModel;
    constructor(horizontal: boolean, dropZonePurpose: TDropZone);
    init(params: PillDropZonePanelParams): void;
    protected getItems(dragItem: DragItem): Column[];
    protected isInterestedIn(type: DragSourceType): boolean;
    protected minimumAllowedNewInsertIndex(): number;
    private showOrHideColumnOnExit;
    protected handleDragEnterEnd(draggingEvent: DraggingEvent): void;
    protected handleDragLeaveEnd(draggingEvent: DraggingEvent): void;
    setColumnsVisible(columns: Column[] | null | undefined, visible: boolean, source: ColumnEventType): void;
    private isRowGroupPanel;
    protected refreshOnDragStop(): boolean;
    protected createPillComponent(column: Column, dropTarget: DropTarget, ghost: boolean, horizontal: boolean): DropZoneColumnComp;
}
