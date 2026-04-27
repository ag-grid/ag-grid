import type { AgColumn, ColumnEventType, DragItem, DropTarget, GridDraggingEvent } from 'ag-grid-community';
import { DragSourceType, _shouldUpdateColVisibilityAfterGroup } from 'ag-grid-community';

import { isDeferredMode } from '../../columnToolPanel/toolPanelDeferredUiUtils';
import type { ColumnStateUpdateParams } from '../../columnToolPanel/updates/columnStateUpdateTypes';
import type { PillDropZonePanelParams } from '../../widgets/pillDropZonePanel';
import { PillDropZonePanel } from '../../widgets/pillDropZonePanel';
import { DropZoneColumnComp } from './dropZoneColumnComp';

export type TDropZone = 'rowGroup' | 'pivot' | 'aggregation';

export abstract class BaseDropZonePanel extends PillDropZonePanel<DropZoneColumnComp, AgColumn> {
    protected readonly embedded: boolean;

    constructor(
        horizontal: boolean,
        private readonly dropZonePurpose: TDropZone,
        protected readonly updateParams?: ColumnStateUpdateParams,
        embedded = false
    ) {
        super(horizontal);
        this.embedded = embedded;
        this.addElementClasses(this.getGui(), this.dropZonePurpose.toLowerCase());
    }

    public override init(params: PillDropZonePanelParams): void {
        super.init(params);

        this.addManagedEventListeners({ newColumnsLoaded: this.refreshGui.bind(this) });

        this.addManagedPropertyListeners(
            ['functionsReadOnly', 'rowGroupPanelSuppressSort', 'groupLockGroupColumns'],
            this.refreshGui.bind(this)
        );
    }

    protected getItems(dragItem: DragItem): AgColumn[] {
        return (dragItem.columns as AgColumn[]) ?? [];
    }

    protected isInterestedIn(type: DragSourceType, sourceElement: Element): boolean {
        if (type === DragSourceType.HeaderCell) {
            return true;
        }

        if (type !== DragSourceType.ToolPanel) {
            return false;
        }

        if (!this.horizontal) {
            return true;
        }

        return !sourceElement.hasAttribute('data-column-tool-panel-deferred');
    }

    protected override minimumAllowedNewInsertIndex(): number {
        const { gos, rowGroupColsSvc } = this.beans;
        const numberOfLockedCols = gos.get('groupLockGroupColumns');
        const numberOfGroupCols = rowGroupColsSvc?.columns.length ?? 0;
        if (numberOfLockedCols === -1) {
            return numberOfGroupCols;
        }
        return Math.min(numberOfLockedCols, numberOfGroupCols);
    }

    private shouldToggleColumnVisibility(draggingEvent: GridDraggingEvent, isGrouped: boolean): boolean {
        return (
            this.isRowGroupPanel() &&
            _shouldUpdateColVisibilityAfterGroup(this.gos, isGrouped) &&
            !draggingEvent.fromNudge
        );
    }

    protected override handleDragEnterEnd(draggingEvent: GridDraggingEvent): void {
        if (this.shouldToggleColumnVisibility(draggingEvent, true)) {
            const dragItem = draggingEvent.dragSource.getDragItem();
            const columns = dragItem.columns as AgColumn[];
            this.setColumnsVisible(columns, false, 'uiColumnDragged');
        }
    }

    protected override handleDragLeaveEnd(draggingEvent: GridDraggingEvent): void {
        if (this.shouldToggleColumnVisibility(draggingEvent, false)) {
            const dragItem = draggingEvent.dragSource.getDragItem();

            this.setColumnsVisible(dragItem.columns as AgColumn[], true, 'uiColumnDragged');
        }
    }

    public setColumnsVisible(columns: AgColumn[] | null | undefined, visible: boolean, source: ColumnEventType) {
        if (!columns) {
            return;
        }
        // In deferred mode, skip visibility changes from drag-and-drop — they will be
        // applied when the deferred state is committed. Creating hide patches here leaves
        // stale state when a column is removed then re-added to row groups.
        if (isDeferredMode(this.updateParams)) {
            return;
        }
        const allowedCols = columns.filter((c) => !c.colDef.lockVisible);
        this.beans.columnStateUpdateStrategy.setColumnsVisible(false, allowedCols, visible, source);
    }

    private isRowGroupPanel() {
        return this.dropZonePurpose === 'rowGroup';
    }

    protected createPillComponent(
        column: AgColumn,
        dropTarget: DropTarget,
        ghost: boolean,
        horizontal: boolean
    ): DropZoneColumnComp {
        return new DropZoneColumnComp(column, dropTarget, ghost, this.dropZonePurpose, horizontal, this.updateParams);
    }
}
