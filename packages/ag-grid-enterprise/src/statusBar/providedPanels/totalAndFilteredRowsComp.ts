import type { BeanCollection, IClientSideRowModel, IRowModel, IStatusPanelComp } from 'ag-grid-community';
import { _formatNumberCommas, _isClientSideRowModel, _warnOnce } from 'ag-grid-community';

import { AgNameValue } from './agNameValue';

export class TotalAndFilteredRowsComp extends AgNameValue implements IStatusPanelComp {
    private rowModel: IRowModel;

    public wireBeans(beans: BeanCollection) {
        this.rowModel = beans.rowModel;
    }

    public postConstruct(): void {
        if (!_isClientSideRowModel(this.gos)) {
            _warnOnce(`agTotalAndFilteredRowCountComponent should only be used with the client side row model.`);
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
        const rowCount = _formatNumberCommas(this.getFilteredRowCountValue(), this.localeService);
        const totalRowCount = _formatNumberCommas(this.getTotalRowCount(), this.localeService);

        if (rowCount === totalRowCount) {
            this.setValue(rowCount);
        } else {
            const localeTextFunc = this.localeService.getLocaleTextFunc();
            this.setValue(`${rowCount} ${localeTextFunc('of', 'of')} ${totalRowCount}`);
        }
    }

    private getFilteredRowCountValue(): number {
        let filteredRowCount = 0;
        (this.rowModel as IClientSideRowModel).forEachNodeAfterFilter((node) => {
            if (!node.group) {
                filteredRowCount++;
            }
        });
        return filteredRowCount;
    }

    private getTotalRowCount(): number {
        let totalRowCount = 0;
        this.rowModel.forEachNode((node) => {
            if (!node.group) {
                totalRowCount++;
            }
        });
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
