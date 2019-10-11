import {
    Autowired,
    Events,
    EventService,
    GridApi,
    IStatusPanelComp,
    PostConstruct
} from 'ag-grid-community';
import {NameValueComp} from "./nameValueComp";

export class TotalAndFilteredRowsComp extends NameValueComp implements IStatusPanelComp {

    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('eventService') private eventService: EventService;

    @PostConstruct
    protected postConstruct(): void {

        // this component is only really useful with client side row model
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn(`ag-Grid: agTotalAndFilteredRowCountComponent should only be used with the client side row model.`);
            return;
        }

        this.setLabel('totalAndFilteredRows', 'Rows');

        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-total-and-filtered-row-count');

        this.setDisplayed(true);

        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onDataChanged.bind(this));
    }

    private onDataChanged() {
        const rowCount = this.getFilteredRowCountValue();
        const totalRowCount = this.getTotalRowCount();

        if (rowCount === totalRowCount) {
            this.setValue(rowCount);
        } else {
            const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            this.setValue(`${rowCount} ${localeTextFunc('of', 'of')} ${totalRowCount}`);
        }
    }

    private getFilteredRowCountValue(): number {
        let filteredRowCount = 0;
        this.gridApi.forEachNodeAfterFilter((node) => {
            if (!node.group) { filteredRowCount++; }
        });
        return filteredRowCount;
    }

    private getTotalRowCount(): number {
        let totalRowCount = 0;
        this.gridApi.forEachNode(node => {
            if (!node.group) { totalRowCount++; }
        });
        return totalRowCount;
    }

    public init() {}
}
