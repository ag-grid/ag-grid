import {
    Autowired,
    Events,
    EventService,
    GridApi,
    PostConstruct,
    IStatusPanelComp,
    IRowModel,
    ClientSideRowModel
} from 'ag-grid-community';
import { NameValueComp } from "./nameValueComp";

export class TotalAndFilteredRowsComp extends NameValueComp implements IStatusPanelComp {

    @Autowired('rowModel') gridRowModel: IRowModel;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridApi') private gridApi: GridApi;

    private clientSideRowModel: ClientSideRowModel;

    @PostConstruct
    protected postConstruct(): void {

        // this component is only really useful with client side row model
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn(`ag-Grid: agTotalAndFilteredRowCountComponent should only be used with the client side row model.`);
            return;
        } else {
            this.clientSideRowModel = this.gridRowModel as ClientSideRowModel;
        }

        this.setLabel('totalAndFilteredRows', 'Rows');

        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-total-and-filtered-row-count');

        this.setVisible(true);

        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onDataChanged.bind(this));
    }

    private onDataChanged() {
        const rowCount = this.clientSideRowModel.getRowCount();
        const totalRowCount = this.getTotalRowCount();

        //TODO we should add internationalization key for 'of'
        let displayValue = rowCount === totalRowCount ? `${rowCount}` : `${rowCount} of ${totalRowCount}`;
        this.setValue(displayValue);
    }

    private getTotalRowCount(): number {
        let totalRowCount = 0;
        this.gridApi.forEachNode(_ => totalRowCount++);
        return totalRowCount;
    }

    public init() {}
}