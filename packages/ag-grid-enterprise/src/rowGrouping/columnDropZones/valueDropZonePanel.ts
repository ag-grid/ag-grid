import type { AgColumn, DragAndDropIcon, GridDraggingEvent } from 'ag-grid-community';
import { _createIconNoSpan } from 'ag-grid-community';

import type {
    ColumnToolPanelDeferredEdit,
    ColumnToolPanelEditParams,
} from '../../columnToolPanel/columnToolPanelEdits';
import { addDeferredDraftChangedListener } from '../../columnToolPanel/columnToolPanelEdits';
import { BaseDropZonePanel } from './baseDropZonePanel';

export class ValuesDropZonePanel extends BaseDropZonePanel {
    constructor(horizontal: boolean, params?: ColumnToolPanelEditParams) {
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
        if (this.deferApply) {
            addDeferredDraftChangedListener(this, this.refreshGui.bind(this));
        }
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
        const strategy = this.getEdits();
        if (strategy) {
            strategy.setValueColumns(columns, 'toolPanelUi');
        } else {
            this.beans.valueColsSvc?.setColumns(columns, 'toolPanelUi');
        }
    }

    protected getExistingItems(): AgColumn[] {
        if (this.deferApply) {
            return (this.getEdits() as ColumnToolPanelDeferredEdit).getDraftValueColumns();
        }

        return this.beans.valueColsSvc?.columns ?? [];
    }
}
