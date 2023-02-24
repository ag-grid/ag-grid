import { Autowired, Events, GridApi, IStatusPanelComp, PostConstruct, _ } from '@ag-grid-community/core';
import { NameValueComp } from "./nameValueComp";

export class TotalRowsComp extends NameValueComp implements IStatusPanelComp {

    @Autowired('gridApi') private gridApi: GridApi;

    @PostConstruct
    protected postConstruct(): void {
        this.setLabel('totalRows', 'Total Rows');

        // this component is only really useful with client side row model
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn(`AG Grid: agTotalRowCountComponent should only be used with the client side row model.`);
            return;
        }

        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-total-row-count');

        this.setDisplayed(true);

        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onDataChanged.bind(this));
        this.onDataChanged();
    }

    private onDataChanged() {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const thousandSeparator = localeTextFunc('thousandSeparator', ',');
        const decimalSeparator = localeTextFunc('decimalSeparator', '.');
        this.setValue(_.formatNumberCommas(this.getRowCountValue(), thousandSeparator, decimalSeparator));
    }

    private getRowCountValue(): number {
        let totalRowCount = 0;
        this.gridApi.forEachLeafNode((node) => totalRowCount += 1);
        return totalRowCount;
    }

    public init() {
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

}
