import type { BeanCollection, ISelectionService, IStatusPanelComp } from 'ag-grid-community';
import { _formatNumberCommas, _isClientSideRowModel, _isServerSideRowModel, _warnOnce } from 'ag-grid-community';

import { AgNameValue } from './agNameValue';

export class SelectedRowsComp extends AgNameValue implements IStatusPanelComp {
    private selectionService?: ISelectionService;

    public wireBeans(beans: BeanCollection) {
        this.selectionService = beans.selectionService;
    }

    public postConstruct(): void {
        if (!_isClientSideRowModel(this.gos) && !_isServerSideRowModel(this.gos)) {
            _warnOnce(`agSelectedRowCountComponent should only be used with the client and server side row model.`);
            return;
        }

        this.setLabel('selectedRows', 'Selected');

        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-selected-row-count');

        this.onRowSelectionChanged();

        const eventListener = this.onRowSelectionChanged.bind(this);
        this.addManagedEventListeners({ modelUpdated: eventListener, selectionChanged: eventListener });
    }

    private onRowSelectionChanged() {
        const selectedRowCount = this.selectionService?.getSelectionCount() ?? 0;
        if (selectedRowCount < 0) {
            this.setValue('?');
            this.setDisplayed(true);
            return;
        }
        this.setValue(_formatNumberCommas(selectedRowCount, this.localeService));
        this.setDisplayed(selectedRowCount > 0);
    }

    public init() {}

    public refresh(): boolean {
        return true;
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public override destroy(): void {
        super.destroy();
    }
}
