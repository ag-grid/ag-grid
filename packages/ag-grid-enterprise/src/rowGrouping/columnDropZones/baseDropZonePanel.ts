import type { AgColumn, ColumnEventType, DragItem, DropTarget, GridDraggingEvent } from 'ag-grid-community';
import { DragSourceType, _shouldUpdateColVisibilityAfterGroup } from 'ag-grid-community';

import { getColumnToolPanelEditStrategy } from '../../columnToolPanel/columnToolPanelEditUtils';
import type { BaseColumnToolPanelEdits, ColumnToolPanelEditParams } from '../../columnToolPanel/columnToolPanelEditsTypes';
import type { PillDropZonePanelParams } from '../../widgets/pillDropZonePanel';
import { PillDropZonePanel } from '../../widgets/pillDropZonePanel';
import { DropZoneColumnComp } from './dropZoneColumnComp';

export type TDropZone = 'rowGroup' | 'pivot' | 'aggregation';

export abstract class BaseDropZonePanel extends PillDropZonePanel<DropZoneColumnComp, AgColumn> {
    constructor(
        horizontal: boolean,
        private readonly dropZonePurpose: TDropZone,
        private readonly editParams?: ColumnToolPanelEditParams
    ) {
        super(horizontal);
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

    /**
     * Drop zones are shared between header panels and the Columns Tool Panel.
     * The column tool panel edit beans are not guaranteed to exist in all module combinations,
     * so this accessor must stay optional and callers must fall back to core services.
     *
     * If we later introduce a global deferred mode, extract common behaviour behind a shared abstraction
     * rather than hard-coupling drop zones directly to column tool panel beans.
     */
    protected getEditStrategy(): BaseColumnToolPanelEdits | null {
        return getColumnToolPanelEditStrategy(this.beans, !!this.editParams?.deferApply) ?? null;
    }

    protected getItems(dragItem: DragItem): AgColumn[] {
        return (dragItem.columns as AgColumn[]) ?? [];
    }

    protected isInterestedIn(type: DragSourceType): boolean {
        // not interested in row drags
        return type === DragSourceType.HeaderCell || (!!this.editParams && type === DragSourceType.ToolPanel);
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

    private showOrHideColumnOnExit(draggingEvent: GridDraggingEvent): boolean {
        return (
            this.isRowGroupPanel() && _shouldUpdateColVisibilityAfterGroup(this.gos, true) && !draggingEvent.fromNudge
        );
    }

    protected override handleDragEnterEnd(draggingEvent: GridDraggingEvent): void {
        const hideColumnOnExit = this.showOrHideColumnOnExit(draggingEvent);

        if (hideColumnOnExit) {
            const dragItem = draggingEvent.dragSource.getDragItem();
            const columns = dragItem.columns as AgColumn[];
            this.setColumnsVisible(columns, false, 'uiColumnDragged');
        }
    }

    protected override handleDragLeaveEnd(draggingEvent: GridDraggingEvent): void {
        const showColumnOnExit = this.showOrHideColumnOnExit(draggingEvent);

        if (showColumnOnExit) {
            const dragItem = draggingEvent.dragSource.getDragItem();

            this.setColumnsVisible(dragItem.columns as AgColumn[], true, 'uiColumnDragged');
        }
    }

    public setColumnsVisible(columns: AgColumn[] | null | undefined, visible: boolean, source: ColumnEventType) {
        if (!columns) {
            return;
        }
        const allowedCols = columns.filter((c) => !c.getColDef().lockVisible);
        const strategy = this.getEditStrategy();
        if (strategy) {
            strategy.setColumnsVisible(allowedCols, visible, source);
        } else {
            this.beans.colModel.setColsVisible(allowedCols, visible, source);
        }
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
        return new DropZoneColumnComp(column, dropTarget, ghost, this.dropZonePurpose, horizontal, this.editParams);
    }
}
