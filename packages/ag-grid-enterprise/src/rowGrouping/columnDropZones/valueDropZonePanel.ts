import type { AgColumn, DragAndDropIcon, GridDraggingEvent, IAggFunc } from 'ag-grid-community';
import { _createIconNoSpan } from 'ag-grid-community';

import { BaseDropZonePanel } from './baseDropZonePanel';

export class ValuesDropZonePanel extends BaseDropZonePanel {
    /** Accept deferred-mode overrides for staged value updates and aggregation-function state. */
    constructor(
        horizontal: boolean,
        onUpdateItems?: (columns: AgColumn[]) => boolean,
        private readonly getExistingItemsOverride?: () => AgColumn[],
        onAggregationFunctionChange?: (column: AgColumn, aggFunc: string) => boolean,
        getPendingAggregationFunction?: (column: AgColumn) => string | IAggFunc | null | undefined
    ) {
        super(
            horizontal,
            'aggregation',
            onUpdateItems ? (_dropZone, columns) => onUpdateItems(columns) : undefined,
            onAggregationFunctionChange,
            getPendingAggregationFunction
        );
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
        /** Skip live service update when deferred mode handles staging. */
        if (this.handleUpdateItems(columns)) {
            return;
        }
        this.beans.valueColsSvc?.setColumns(columns, 'toolPanelUi');
    }

    protected getExistingItems(): AgColumn[] {
        /** Read pending value items in deferred mode so UI reflects staged order. */
        const override = this.getExistingItemsOverride?.();
        if (override) {
            return override;
        }
        return this.beans.valueColsSvc?.columns ?? [];
    }
}
