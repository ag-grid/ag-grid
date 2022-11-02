import {
    Autowired,
    Events,
    GridApi,
    PostConstruct,
    IStatusPanelComp,
    getLocaleTextFunc,
    _
} from '@ag-grid-community/core';
import { NameValueComp } from "./nameValueComp";

export class FilteredRowsComp extends NameValueComp implements IStatusPanelComp {

    @Autowired('gridApi') private gridApi: GridApi;

    @PostConstruct
    protected postConstruct(): void {
        this.setLabel('filteredRows', 'Filtered');

        // this component is only really useful with client side row model
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn(`AG Grid: agFilteredRowCountComponent should only be used with the client side row model.`);
            return;
        }

        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-filtered-row-count');

        this.setDisplayed(true);

        const listener = this.onDataChanged.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, listener);
        listener();
    }

    private onDataChanged() {
        const totalRowCountValue = this.getTotalRowCountValue();
        const filteredRowCountValue = this.getFilteredRowCountValue();
        const localeTextFunc = getLocaleTextFunc(this.gridOptionsService);
        const thousandSeparator = localeTextFunc('thousandSeparator', ',');
        const decimalSeparator = localeTextFunc('decimalSeparator', '.');

        this.setValue(_.formatNumberCommas(filteredRowCountValue, thousandSeparator, decimalSeparator));
        this.setDisplayed(totalRowCountValue !== filteredRowCountValue);
    }

    private getTotalRowCountValue(): number {
        let totalRowCount = 0;
        this.gridApi.forEachNode((node) => totalRowCount += 1);
        return totalRowCount;
    }

    private getFilteredRowCountValue(): number {
        let filteredRowCount = 0;

        this.gridApi.forEachNodeAfterFilter((node) => {
            if (!node.group) {
                filteredRowCount += 1;
            }
        });
        return filteredRowCount;
    }

    public init() {}

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

}
