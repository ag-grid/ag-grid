import type { IClientSideRowModel, IStatusPanelComp } from 'ag-grid-community';
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

        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-total-and-filtered-row-count');

        this.setDisplayed(true);

        this.addManagedEventListeners({ modelUpdated: this.onDataChanged.bind(this) });
        this.onDataChanged();
    }

    private onDataChanged() {
        const { rowModel } = this.beans;
        const getLocaleTextFunc = this.getLocaleTextFunc.bind(this);
        const rowCount = _formatNumberCommas(_getFilteredRowCount(rowModel as IClientSideRowModel), getLocaleTextFunc);
        const totalRowCount = _formatNumberCommas(_getTotalRowCount(rowModel), getLocaleTextFunc);

        if (rowCount === totalRowCount) {
            this.setValue(rowCount);
        } else {
            const localeTextFunc = this.getLocaleTextFunc();
            this.setValue(`${rowCount} ${localeTextFunc('of', 'of')} ${totalRowCount}`);
        }
    }

    public init() {}

    public refresh(): boolean {
        return true;
    }
}
