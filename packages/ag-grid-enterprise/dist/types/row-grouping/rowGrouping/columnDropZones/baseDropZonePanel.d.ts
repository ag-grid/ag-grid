import type { AgColumn, BeanCollection, ColumnEventType, ColumnModel, DragItem, DraggingEvent, DropTarget, FuncColsService } from 'ag-grid-community';
import { DragSourceType } from 'ag-grid-community';
import type { PillDropZonePanelParams } from 'ag-grid-enterprise';
import { PillDropZonePanel } from 'ag-grid-enterprise';
import { DropZoneColumnComp } from './dropZoneColumnComp';
export type TDropZone = 'rowGroup' | 'pivot' | 'aggregation';
export declare abstract class BaseDropZonePanel extends PillDropZonePanel<DropZoneColumnComp, AgColumn> {
    private dropZonePurpose;
    protected columnModel: ColumnModel;
    protected funcColsService: FuncColsService;
    wireBeans(beans: BeanCollection): void;
    constructor(horizontal: boolean, dropZonePurpose: TDropZone);
    init(params: PillDropZonePanelParams): void;
    protected getItems(dragItem: DragItem): AgColumn[];
    protected isInterestedIn(type: DragSourceType): boolean;
    protected minimumAllowedNewInsertIndex(): number;
    private showOrHideColumnOnExit;
    protected handleDragEnterEnd(draggingEvent: DraggingEvent): void;
    protected handleDragLeaveEnd(draggingEvent: DraggingEvent): void;
    setColumnsVisible(columns: AgColumn[] | null | undefined, visible: boolean, source: ColumnEventType): void;
    private isRowGroupPanel;
    protected createPillComponent(column: AgColumn, dropTarget: DropTarget, ghost: boolean, horizontal: boolean): DropZoneColumnComp;
}
