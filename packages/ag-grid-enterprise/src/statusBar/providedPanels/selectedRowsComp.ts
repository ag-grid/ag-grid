import type { IProvidedStatusPanelParams, IStatusPanelComp, IStatusPanelParams } from 'ag-grid-community';
import { _formatNumberCommas, _isClientSideRowModel, _isServerSideRowModel, _warn } from 'ag-grid-community';

import { AgNameValue } from './agNameValue';

export class SelectedRowsComp extends AgNameValue implements IStatusPanelComp {
    public postConstruct(): void {
        const gos = this.gos;
        if (!_isClientSideRowModel(gos) && !_isServerSideRowModel(gos)) {
            _warn(223);
            return;
        }

        this.setLabel('selectedRows', 'Selected');

        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-selected-row-count');

        const eventListener = this.onRowSelectionChanged.bind(this);
        this.addManagedEventListeners({ modelUpdated: eventListener, selectionChanged: eventListener });
    }

    private onRowSelectionChanged() {
        const selectedRowCount = this.beans.selectionSvc?.getSelectionCount() ?? 0;
        this.setValue(selectedRowCount);

        if (selectedRowCount < 0) {
            this.setDisplayed(true);
            return;
        }

        this.setDisplayed(selectedRowCount > 0);
    }

    public init(params: IStatusPanelParams & IProvidedStatusPanelParams) {
        const valueFormatter =
            params.valueFormatter ??
            (({ value }) => {
                if (value < 0) {
                    return '?';
                }
                return _formatNumberCommas(value, this.getLocaleTextFunc.bind(this));
            });

        this.setValueFormatter(valueFormatter);
        this.onRowSelectionChanged();
    }

    public refresh(): boolean {
        return true;
    }
}
