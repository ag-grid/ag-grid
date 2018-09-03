import {Autowired, Events, EventService, GridApi, PostConstruct} from 'ag-grid-community';
import {NameValueComp} from "./nameValueComp";

export class SelectedComp extends NameValueComp {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridApi') private gridApi: GridApi;

    constructor() {
        super('selectedRowCount', 'Selected');
    }

    @PostConstruct
    protected postConstruct(): void {
        super.postConstruct();

        if (!this.isValidRowModel()) {
            console.warn(`ag-Grid: agSelectedRowCountComponent should only be used with the client and server side row model.`);
            return;
        }

        this.addCssClass('ag-status-panel-selected-row-count');

        const selectedRowCount = this.gridApi.getSelectedRows().length;
        this.setValue(selectedRowCount);
        this.setVisible(selectedRowCount > 0);

        let eventListener = this.onRowSelectionChanged.bind(this);
        this.eventService.addEventListener(Events.EVENT_MODEL_UPDATED, eventListener);
        this.eventService.addEventListener(Events.EVENT_ROW_SELECTED, eventListener);
    }

    private isValidRowModel() {
        // this component is only really useful with client or server side rowmodels
        const rowModelType = this.gridApi.getModel().getType();
        return rowModelType === 'clientSide' || rowModelType !== 'serverSide';
    }

    private onRowSelectionChanged() {
        const selectedRowCount = this.gridApi.getSelectedRows().length;
        this.setValue(selectedRowCount);
        this.setVisible(selectedRowCount > 0);
    }

    public init() {
    }
}
