import type { IProvidedStatusPanelParams, IStatusPanelComp, IStatusPanelParams } from 'ag-grid-community';
import { _formatNumberCommas, _isClientSideRowModel, _warn } from 'ag-grid-community';

import { AgNameValue } from './agNameValue';
import { _getTotalRowCount } from './utils';

export class TotalRowsComp extends AgNameValue implements IStatusPanelComp {
    public postConstruct(): void {
        this.setLabel('totalRows', 'Total Rows');

        if (!_isClientSideRowModel(this.gos)) {
            _warn(225);
            return;
        }

        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-total-row-count');

        this.setDisplayed(true);

        this.addManagedEventListeners({ modelUpdated: this.onDataChanged.bind(this) });
    }

    private onDataChanged() {
        this.setValue(_getTotalRowCount(this.beans.rowModel));
    }

    public init(params: IStatusPanelParams & IProvidedStatusPanelParams) {
        const valueFormatter =
            params.valueFormatter ?? (({ value }) => _formatNumberCommas(value, this.getLocaleTextFunc.bind(this)));

        this.setValueFormatter(valueFormatter);
        this.onDataChanged();
    }

    public refresh(): boolean {
        return true;
    }
}
