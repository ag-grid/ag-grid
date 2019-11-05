import { Autowired, Events, EventService, GridApi, IStatusPanelComp, PostConstruct, _ } from '@ag-grid-community/core';
import { NameValueComp } from "./nameValueComp";

export class TotalRowsComp extends NameValueComp implements IStatusPanelComp {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridApi') private gridApi: GridApi;

    @PostConstruct
    protected postConstruct(): void {
        this.setLabel('totalRows', 'Total Rows');

        // this component is only really useful with client side row model
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn(`ag-Grid: agTotalRowCountComponent should only be used with the client side row model.`);
            return;
        }

        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-total-row-count');

        this.setDisplayed(true);

        const listener = this.onDataChanged.bind(this);
        this.eventService.addEventListener(Events.EVENT_MODEL_UPDATED, listener);
    }

    private onDataChanged() {
        this.setValue(_.formatNumberCommas(this.getRowCountValue()));
    }

    private getRowCountValue(): number {
        let totalRowCount = 0;
        this.gridApi.forEachLeafNode((node) => totalRowCount += 1);
        return totalRowCount;
    }

    public init() {
    }
}
