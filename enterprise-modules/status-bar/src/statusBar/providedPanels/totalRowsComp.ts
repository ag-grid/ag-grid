import type { BeanCollection, IClientSideRowModel, IRowModel, IStatusPanelComp } from '@ag-grid-community/core';
import { _formatNumberCommas, _warnOnce } from '@ag-grid-community/core';

import { AgNameValue } from './agNameValue';

export class TotalRowsComp extends AgNameValue implements IStatusPanelComp {
    private rowModel: IRowModel;

    public wireBeans(beans: BeanCollection) {
        this.rowModel = beans.rowModel;
    }

    public postConstruct(): void {
        this.setLabel('totalRows', 'Total Rows');

        // this component is only really useful with client side row model
        if (this.rowModel.getType() !== 'clientSide') {
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
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const thousandSeparator = localeTextFunc('thousandSeparator', ',');
        const decimalSeparator = localeTextFunc('decimalSeparator', '.');
        this.setValue(_formatNumberCommas(this.getRowCountValue(), thousandSeparator, decimalSeparator));
    }

    private getRowCountValue(): number {
        let totalRowCount = 0;
        (this.rowModel as IClientSideRowModel).forEachLeafNode((node) => (totalRowCount += 1));
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
