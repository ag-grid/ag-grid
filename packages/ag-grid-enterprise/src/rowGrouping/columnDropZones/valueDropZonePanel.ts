import type { AgColumn, DragAndDropIcon, GridDraggingEvent } from 'ag-grid-community';
import { _createIconNoSpan } from 'ag-grid-community';

import type {
    ColumnToolPanelUpdateParams,
    IColumnToolPanelUpdateStrategy,
} from '../../columnToolPanel/updates/columnToolPanelUpdatesTypes';
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

        const strategy = this.beans.colToolPanelUpdateStrategy as IColumnToolPanelUpdateStrategy | undefined;
        const isActive =
            strategy?.getValueColumns(!!this.updateParams?.deferApply).includes(column) ?? column.isValueActive();
        return column.isAllowValue() && (!isActive || this.isSourceEventFromTarget(draggingEvent));
    }

    protected updateItems(columns: AgColumn[]): void {
        const strategy = this.beans.colToolPanelUpdateStrategy as IColumnToolPanelUpdateStrategy | undefined;
        if (strategy) {
            strategy.setValueColumns(!!this.updateParams?.deferApply, columns, 'toolPanelUi');
        } else {
            this.beans.valueColsSvc?.setColumns(columns, 'toolPanelUi');
        }
    }

    protected getExistingItems(): AgColumn[] {
        const strategy = this.beans.colToolPanelUpdateStrategy as IColumnToolPanelUpdateStrategy | undefined;
        return strategy?.getValueColumns(!!this.updateParams?.deferApply) ?? this.beans.valueColsSvc?.columns ?? [];
    }
}
