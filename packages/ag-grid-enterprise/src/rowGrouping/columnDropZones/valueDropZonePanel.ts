import type { AgColumn, DragAndDropIcon, GridDraggingEvent } from 'ag-grid-community';
import { _createIconNoSpan } from 'ag-grid-community';

import type { ColumnToolPanelUpdateParams } from '../../columnToolPanel/updates/columnToolPanelUpdatesTypes';
import { getColumnToolPanelUpdates } from '../../columnToolPanel/updates/columnToolPanelUpdateUtils';
import { BaseDropZonePanel } from './baseDropZonePanel';

export class ValuesDropZonePanel extends BaseDropZonePanel {
    constructor(horizontal: boolean, params?: ColumnToolPanelUpdateParams) {
        super(horizontal, 'aggregation', params);
    }

    public postConstruct(): void {
        const localeTextFunc = this.getLocaleTextFunc();
        const emptyMessage = localeTextFunc('valueColumnsEmptyMessage', 'Drag here to aggregate');
        const title = localeTextFunc('values', 'Values');

        super.init({
            icon: _createIconNoSpan('valuePanel', this.beans, null)!,
            emptyMessage: emptyMessage,
            title: title,
        });

        this.addManagedEventListeners({ columnValueChanged: this.refreshGui.bind(this) });
    }

    protected getAriaLabel(): string {
        const translate = this.getLocaleTextFunc();
        const label = translate('ariaValuesDropZonePanelLabel', 'Values');

        return label;
    }

    protected getIconName(): DragAndDropIcon {
        return this.isPotentialDndItems() ? 'aggregate' : 'notAllowed';
    }

    protected isItemDroppable(column: AgColumn, draggingEvent: GridDraggingEvent): boolean {
        // we never allow grouping of secondary columns
        if (this.gos.get('functionsReadOnly') || !column.isPrimary()) {
            return false;
        }

        const isActive = getColumnToolPanelUpdates(this.beans)
            .getValueColumns(!!this.updateParams?.deferApply)
            .includes(column);
        return column.isAllowValue() && (!isActive || this.isSourceEventFromTarget(draggingEvent));
    }

    protected updateItems(columns: AgColumn[]): void {
        getColumnToolPanelUpdates(this.beans).setValueColumns(!!this.updateParams?.deferApply, columns, 'toolPanelUi');
    }

    protected getExistingItems(): AgColumn[] {
        return getColumnToolPanelUpdates(this.beans).getValueColumns(!!this.updateParams?.deferApply);
    }
}
