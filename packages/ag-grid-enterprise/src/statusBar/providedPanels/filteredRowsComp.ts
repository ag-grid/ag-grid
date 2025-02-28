import type { IClientSideRowModel, IStatusPanelComp } from 'ag-grid-community';
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

        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-filtered-row-count');

        this.setDisplayed(true);

        const listener = this.onDataChanged.bind(this);
        this.addManagedEventListeners({ modelUpdated: listener });
        listener();
    }

    private onDataChanged() {
        const { rowModel } = this.beans;
        const totalRowCountValue = _getTotalRowCount(rowModel);
        const filteredRowCountValue = _getFilteredRowCount(rowModel as IClientSideRowModel);

        this.setValue(_formatNumberCommas(filteredRowCountValue, this.getLocaleTextFunc.bind(this)));
        this.setDisplayed(totalRowCountValue !== filteredRowCountValue);
    }

    public init() {}

    public refresh(): boolean {
        return true;
    }
}
