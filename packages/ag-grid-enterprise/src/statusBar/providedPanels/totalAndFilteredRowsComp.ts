import { Autowired, Events, EventService, GridApi, PostConstruct, IStatusPanelComp } from 'ag-grid-community';
import { NameValueComp } from "./nameValueComp";

export class TotalAndFilteredRowsComp extends NameValueComp implements IStatusPanelComp {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridApi') private gridApi: GridApi;

    @PostConstruct
    protected postConstruct(): void {

        // this component is only really useful with client side rowmodel
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn(`ag-Grid: agTotalAndFilteredRowCountComponent should only be used with the client side row model.`);
            return;
        }

        this.setLabel('totalAndFilteredRows', 'Rows');

        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-total-and-filtered-row-count');

        this.setVisible(true);

        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onDataChanged.bind(this));
    }

    private onDataChanged() {
        const filteredRowCount = this.getFilteredRowCountValue();
        let displayValue:any = this.getTotalRowCountValue();

        if (filteredRowCount !== displayValue) {
            displayValue = `${filteredRowCount} of ` + displayValue;
        }

        this.setValue(displayValue)
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
                filteredRowCount += 1
            }});
        return filteredRowCount;
    }

    public init() {
    }
}
