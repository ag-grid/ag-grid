import type { BeanCollection, IClientSideRowModel, IRowModel, IStatusPanelComp } from 'ag-grid-community';
import { _formatNumberCommas, _isClientSideRowModel, _warnOnce } from 'ag-grid-community';

import { AgNameValue } from './agNameValue';

export class TotalRowsComp extends AgNameValue implements IStatusPanelComp {
    private rowModel: IRowModel;

    public wireBeans(beans: BeanCollection) {
        this.rowModel = beans.rowModel;
    }

    public postConstruct(): void {
        this.setLabel('totalRows', 'Total Rows');

        if (!_isClientSideRowModel(this.gos)) {
            _warnOnce('agTotalRowCountComponent should only be used with the client side row model.');
            return;
        }

        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-total-row-count');

        this.setDisplayed(true);

        this.addManagedEventListeners({ modelUpdated: this.onDataChanged.bind(this) });
        this.onDataChanged();
    }

    private onDataChanged() {
        this.setValue(_formatNumberCommas(this.getRowCountValue(), this.localeService));
    }

    private getRowCountValue(): number {
        let totalRowCount = 0;
        (this.rowModel as IClientSideRowModel).forEachLeafNode(() => (totalRowCount += 1));
        return totalRowCount;
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
