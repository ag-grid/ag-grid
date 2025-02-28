import type { IStatusPanelComp } from 'ag-grid-community';
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
        this.onDataChanged();
    }

    private onDataChanged() {
        this.setValue(_formatNumberCommas(_getTotalRowCount(this.beans.rowModel), this.getLocaleTextFunc.bind(this)));
    }

    public init() {}

    public refresh(): boolean {
        return true;
    }
}
