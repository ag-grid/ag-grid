import type {
    IProvidedStatusPanelParams,
    IStatusPanelComp,
    IStatusPanelParams,
    IStatusPanelValueFormatterParams,
    IWithSupportedRowModels,
} from 'ag-grid-community';
import { _formatNumberCommas } from 'ag-grid-community';

import { AgNameValue } from './agNameValue';
import { _getTotalRowCount, supportsCurrentRowModel } from './utils';

export class TotalRowsComp extends AgNameValue implements IStatusPanelComp, IWithSupportedRowModels {
    supportedRowModels = new Set(['clientSide'] as const);
    public postConstruct(): void {
        this.setLabel('totalRows', 'Total Rows');

        if (!supportsCurrentRowModel(this.gos, this.supportedRowModels, [225])) {
            return;
        }

        this.addCss('ag-status-panel');
        this.addCss('ag-status-panel-total-row-count');

        this.setDisplayed(true);

        this.addManagedEventListeners({ modelUpdated: this.onDataChanged.bind(this) });
    }

    private onDataChanged() {
        const totalRow = _getTotalRowCount(this.beans.rowModel);
        this.setValue(totalRow, totalRow);
    }

    public init(params: IStatusPanelParams & IProvidedStatusPanelParams) {
        if (!supportsCurrentRowModel(this.gos, this.supportedRowModels, [225])) {
            return;
        }

        this.refresh(params);
        this.onDataChanged();
    }

    private updateValueFormatter(valueFormatter?: (params: IStatusPanelValueFormatterParams) => string): void {
        this.valueFormatter =
            valueFormatter ?? (({ value }) => _formatNumberCommas(value, this.getLocaleTextFunc.bind(this)));
    }

    public refresh(params: IStatusPanelParams & IProvidedStatusPanelParams): boolean {
        const { key, valueFormatter } = params;
        this.key = key;
        this.updateValueFormatter(valueFormatter);
        return true;
    }
}
