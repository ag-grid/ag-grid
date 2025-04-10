import type {
    IProvidedStatusPanelParams,
    IStatusPanelComp,
    IStatusPanelParams,
    IStatusPanelValueFormatterParams,
} from 'ag-grid-community';
import { _formatNumberCommas, _isClientSideRowModel, _isServerSideRowModel, _warn } from 'ag-grid-community';

import { AgNameValue } from './agNameValue';
import { _getTotalRowCount } from './utils';

export class SelectedRowsComp extends AgNameValue implements IStatusPanelComp {
    public postConstruct(): void {
        const gos = this.gos;
        if (!_isClientSideRowModel(gos) && !_isServerSideRowModel(gos)) {
            _warn(223);
            return;
        }

        this.setLabel('selectedRows', 'Selected');

        this.addCss('ag-status-panel');
        this.addCss('ag-status-panel-selected-row-count');

        const eventListener = this.onRowSelectionChanged.bind(this);
        this.addManagedEventListeners({ modelUpdated: eventListener, selectionChanged: eventListener });
    }

    private onRowSelectionChanged() {
        const { selectionSvc, rowModel } = this.beans;
        const selectedRowCount = selectionSvc?.getSelectionCount() ?? 0;
        const totalRowCount = _getTotalRowCount(rowModel);

        this.setValue(selectedRowCount, totalRowCount);

        if (selectedRowCount < 0) {
            this.setDisplayed(true);
            return;
        }

        this.setDisplayed(selectedRowCount > 0);
    }

    public init(params: IStatusPanelParams & IProvidedStatusPanelParams) {
        this.refresh(params);
        this.onRowSelectionChanged();
    }

    private updateValueFormatter(valueFormatter?: (params: IStatusPanelValueFormatterParams) => string): void {
        this.valueFormatter =
            valueFormatter ??
            (({ value }) => {
                if (value == null || value >= 0) {
                    return _formatNumberCommas(value, this.getLocaleTextFunc.bind(this));
                }
                return this.getLocaleTextFunc()('statusBarLastRowUnknown', '?');
            });
    }

    public refresh(params: IStatusPanelParams & IProvidedStatusPanelParams): boolean {
        const { key, valueFormatter } = params;
        this.key = key;
        this.updateValueFormatter(valueFormatter);
        return true;
    }
}
