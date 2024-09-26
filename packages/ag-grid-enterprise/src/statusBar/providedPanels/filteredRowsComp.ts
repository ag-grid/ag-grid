import type { BeanCollection, IClientSideRowModel, IRowModel, IStatusPanelComp } from 'ag-grid-community';
import { _formatNumberCommas, _isClientSideRowModel, _warnOnce } from 'ag-grid-community';

import { AgNameValue } from './agNameValue';

export class FilteredRowsComp extends AgNameValue implements IStatusPanelComp {
    private rowModel: IRowModel;

    public wireBeans(beans: BeanCollection) {
        this.rowModel = beans.rowModel;
    }

    public postConstruct(): void {
        this.setLabel('filteredRows', 'Filtered');

        if (!_isClientSideRowModel(this.gos)) {
            _warnOnce(`agFilteredRowCountComponent should only be used with the client side row model.`);
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
        const totalRowCountValue = this.getTotalRowCountValue();
        const filteredRowCountValue = this.getFilteredRowCountValue();
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const thousandSeparator = localeTextFunc('thousandSeparator', ',');
        const decimalSeparator = localeTextFunc('decimalSeparator', '.');

        this.setValue(_formatNumberCommas(filteredRowCountValue, thousandSeparator, decimalSeparator));
        this.setDisplayed(totalRowCountValue !== filteredRowCountValue);
    }

    private getTotalRowCountValue(): number {
        let totalRowCount = 0;
        this.rowModel.forEachNode(() => (totalRowCount += 1));
        return totalRowCount;
    }

    private getFilteredRowCountValue(): number {
        let filteredRowCount = 0;

        (this.rowModel as IClientSideRowModel).forEachNodeAfterFilter((node) => {
            if (!node.group) {
                filteredRowCount += 1;
            }
        });
        return filteredRowCount;
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
