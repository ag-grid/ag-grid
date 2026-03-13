import type { AgColumn, DragAndDropIcon, FocusableContainer, GridDraggingEvent } from 'ag-grid-community';
import { _addFocusableContainerListener, _createIconNoSpan } from 'ag-grid-community';

import { refreshDeferredToolPanelUi } from '../../columnToolPanel/toolPanelDeferredUiUtils';
import type { ColumnStateUpdateParams } from '../../columnToolPanel/updates/columnStateUpdateTypes';
import { BaseDropZonePanel } from './baseDropZonePanel';

export class RowGroupDropZonePanel extends BaseDropZonePanel implements FocusableContainer {
    constructor(horizontal: boolean, params?: ColumnStateUpdateParams) {
        super(horizontal, 'rowGroup', params);
    }

    public postConstruct(): void {
        const localeTextFunc = this.getLocaleTextFunc();
        const emptyMessage = localeTextFunc('rowGroupColumnsEmptyMessage', 'Drag here to set row groups');
        const title = localeTextFunc('groups', 'Row Groups');

        super.init({
            icon: _createIconNoSpan('rowGroupPanel', this.beans, null)!,
            emptyMessage: emptyMessage,
            title,
        });

        // only the top (horizontal) drop zone participates in core grid container tabbing.
        if (this.horizontal) {
            _addFocusableContainerListener(this.beans, this, this.getGui());
        }

        this.addManagedEventListeners({ columnRowGroupChanged: this.refreshGui.bind(this) });
    }

    protected getAriaLabel(): string {
        const translate = this.getLocaleTextFunc();
        const label = translate('ariaRowGroupDropZonePanelLabel', 'Row Groups');

        return label;
    }

    protected isItemDroppable(column: AgColumn, draggingEvent: GridDraggingEvent): boolean {
        // we never allow grouping of secondary columns or already-grouped columns
        if (this.gos.get('functionsReadOnly') || !column.isPrimary() || column.colDef.showRowGroup) {
            return false;
        }

        const isActive = this.beans.columnStateUpdateStrategy
            .getRowGroupColumns(!!this.updateParams?.deferApply)
            .includes(column);
        return column.isAllowRowGroup() && (!isActive || this.isSourceEventFromTarget(draggingEvent));
    }

    protected updateItems(columns: AgColumn[]) {
        this.beans.columnStateUpdateStrategy.setRowGroupColumns(
            !!this.updateParams?.deferApply,
            columns,
            'toolPanelUi'
        );
        refreshDeferredToolPanelUi(this.beans, this.updateParams);
    }

    protected getIconName(): DragAndDropIcon {
        return this.isPotentialDndItems() ? 'group' : 'notAllowed';
    }

    protected getExistingItems(): AgColumn[] {
        return this.beans.columnStateUpdateStrategy.getRowGroupColumns(!!this.updateParams?.deferApply);
    }

    public getFocusableContainerName(): 'rowGroupToolbar' {
        return 'rowGroupToolbar';
    }
}
