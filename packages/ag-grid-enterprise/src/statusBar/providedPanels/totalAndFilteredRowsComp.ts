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

export class TotalAndFilteredRowsComp extends AgNameValue implements IStatusPanelComp {
    public postConstruct(): void {
        if (!_isClientSideRowModel(this.gos)) {
            _warn(224);
            return;
        }

        this.setLabel('totalAndFilteredRows', 'Rows');

        this.addCss('ag-status-panel');
        this.addCss('ag-status-panel-total-and-filtered-row-count');

        this.setDisplayed(true);

        this.addManagedEventListeners({ modelUpdated: this.onDataChanged.bind(this) });
    }

    private onDataChanged() {
        const { rowModel } = this.beans;

        const rowCount = _getFilteredRowCount(rowModel as IClientSideRowModel);
        const totalRowCount = _getTotalRowCount(rowModel);

        this.setValue(rowCount, totalRowCount);
    }

    public init(params: IStatusPanelParams & IProvidedStatusPanelParams) {
        this.refresh(params);
        this.onDataChanged();
    }

    private updateValueFormatter(valueFormatter?: (params: IStatusPanelValueFormatterParams) => string): void {
        this.valueFormatter =
            valueFormatter ??
            (({ value, totalRows }) => {
                const getLocaleTextFunc = this.getLocaleTextFunc.bind(this);
                const rowCount = _formatNumberCommas(value, getLocaleTextFunc);
                const totalRowCount = _formatNumberCommas(totalRows ?? value, getLocaleTextFunc);

                if (value === totalRows) {
                    return rowCount;
                }

                const localeTextFunc = getLocaleTextFunc();
                return `${rowCount} ${localeTextFunc('of', 'of')} ${totalRowCount}`;
            });
    }

    public refresh(params: IStatusPanelParams & IProvidedStatusPanelParams): boolean {
        const { key, valueFormatter } = params;
        this.key = key;
        this.updateValueFormatter(valueFormatter);
        return true;
    }
}
