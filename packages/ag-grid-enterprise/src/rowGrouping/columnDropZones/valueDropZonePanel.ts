import type { AgColumn, DragAndDropIcon, GridDraggingEvent } from 'ag-grid-community';
import { _createIconNoSpan } from 'ag-grid-community';

import type { BaseColumnToolPanelEdits } from '../../columnToolPanel/columnToolPanelEdits';
import { BaseDropZonePanel } from './baseDropZonePanel';

export class ValuesDropZonePanel extends BaseDropZonePanel {
    constructor(horizontal: boolean) {
        super(horizontal, 'aggregation');
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

        return column.isAllowValue() && (!column.isValueActive() || this.isSourceEventFromTarget(draggingEvent));
    }

    protected updateItems(columns: AgColumn[]): void {
        const { beans } = this;
        const strategy = (beans.columnToolPanelSyncEditStrategy ||
            beans.columnToolPanelDeferredEditStrategy) as BaseColumnToolPanelEdits;
        if (strategy) {
            strategy.setValueColumns(columns, 'toolPanelUi');
        } else {
            this.beans.valueColsSvc?.setColumns(columns, 'toolPanelUi');
        }
    }

    protected getExistingItems(): AgColumn[] {
        return this.beans.valueColsSvc?.columns ?? [];
    }
}
