import type {
    BeanCollection,
    Column,
    ColumnEventType,
    ColumnModel,
    DragItem,
    DraggingEvent,
    DropTarget,
    FuncColsService,
} from '@ag-grid-community/core';
import { DragSourceType, Events } from '@ag-grid-community/core';
import type { PillDropZonePanelParams } from '@ag-grid-enterprise/core';
import { PillDropZonePanel } from '@ag-grid-enterprise/core';

import { DropZoneColumnComp } from './dropZoneColumnComp';

export type TDropZone = 'rowGroup' | 'pivot' | 'aggregation';

export abstract class BaseDropZonePanel extends PillDropZonePanel<DropZoneColumnComp, Column> {
    protected columnModel: ColumnModel;
    protected funcColsService: FuncColsService;

    public wireBeans(beans: BeanCollection) {
        this.columnModel = beans.columnModel;
        this.funcColsService = beans.funcColsService;
    }

    constructor(
        horizontal: boolean,
        private dropZonePurpose: TDropZone
    ) {
        super(horizontal);
    }

    public init(params: PillDropZonePanelParams): void {
        super.init(params);

        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.refreshGui.bind(this));

        this.addManagedPropertyListeners(
            ['functionsReadOnly', 'rowGroupPanelSuppressSort', 'groupLockGroupColumns'],
            this.refreshGui.bind(this)
        );
    }

    protected getItems(dragItem: DragItem): Column[] {
        return dragItem.columns ?? [];
    }

    protected isInterestedIn(type: DragSourceType): boolean {
        // not interested in row drags
        return type === DragSourceType.HeaderCell || type === DragSourceType.ToolPanel;
    }

    protected minimumAllowedNewInsertIndex(): number {
        const numberOfLockedCols = this.gos.get('groupLockGroupColumns');
        const numberOfGroupCols = this.funcColsService.getRowGroupColumns().length;
        if (numberOfLockedCols === -1) {
            return numberOfGroupCols;
        }
        return Math.min(numberOfLockedCols, numberOfGroupCols);
    }

    private showOrHideColumnOnExit(draggingEvent: DraggingEvent): boolean {
        return this.isRowGroupPanel() && !this.gos.get('suppressRowGroupHidesColumns') && !draggingEvent.fromNudge;
    }

    protected handleDragEnterEnd(draggingEvent: DraggingEvent): void {
        const hideColumnOnExit = this.showOrHideColumnOnExit(draggingEvent);

        if (hideColumnOnExit) {
            const dragItem = draggingEvent.dragSource.getDragItem();
            const columns = dragItem.columns;
            this.setColumnsVisible(columns, false, 'uiColumnDragged');
        }
    }

    protected handleDragLeaveEnd(draggingEvent: DraggingEvent): void {
        const showColumnOnExit = this.showOrHideColumnOnExit(draggingEvent);

        if (showColumnOnExit) {
            const dragItem = draggingEvent.dragSource.getDragItem();

            this.setColumnsVisible(dragItem.columns, true, 'uiColumnDragged');
        }
    }

    public setColumnsVisible(columns: Column[] | null | undefined, visible: boolean, source: ColumnEventType) {
        if (columns) {
            const allowedCols = columns.filter((c) => !c.getColDef().lockVisible);
            this.columnModel.setColsVisible(allowedCols, visible, source);
        }
    }

    private isRowGroupPanel() {
        return this.dropZonePurpose === 'rowGroup';
    }

    protected createPillComponent(
        column: Column,
        dropTarget: DropTarget,
        ghost: boolean,
        horizontal: boolean
    ): DropZoneColumnComp {
        return new DropZoneColumnComp(column, dropTarget, ghost, this.dropZonePurpose, horizontal);
    }
}
