import type {
    IClientSideRowModel,
    IProvidedStatusPanelParams,
    IStatusPanelComp,
    IStatusPanelParams,
    IStatusPanelValueFormatterParams,
} from 'ag-grid-community';
import { _formatNumberCommas, _isClientSideRowModel, _warn } from 'ag-grid-community';

import { AgNameValue } from './agNameValue';
import { _getFilteredRowCount, _getTotalRowCount } from './utils';

export class FilteredRowsComp extends AgNameValue implements IStatusPanelComp {
    public postConstruct(): void {
        this.setLabel('filteredRows', 'Filtered');

        if (!_isClientSideRowModel(this.gos)) {
            _warn(222);
            return;
        }

        this.addCss('ag-status-panel');
        this.addCss('ag-status-panel-filtered-row-count');

        this.setDisplayed(true);

        const listener = this.onDataChanged.bind(this);
        this.addManagedEventListeners({ modelUpdated: listener });
    }

    private onDataChanged() {
        const { rowModel } = this.beans;
        const totalRowCountValue = _getTotalRowCount(rowModel);
        const filteredRowCountValue = _getFilteredRowCount(rowModel as IClientSideRowModel);

        this.setValue(filteredRowCountValue, totalRowCountValue);
        this.setDisplayed(totalRowCountValue !== filteredRowCountValue);
    }

    public init(params: IStatusPanelParams & IProvidedStatusPanelParams) {
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
