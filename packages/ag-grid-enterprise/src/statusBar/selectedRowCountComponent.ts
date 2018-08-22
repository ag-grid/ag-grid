import {Autowired, Events, EventService, GridApi, PostConstruct} from 'ag-grid-community';
import {StatusBarValueComponent} from "./statusBarValueComponent";

export class SelectedRowCountComponent extends StatusBarValueComponent {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridApi') private gridApi: GridApi;

    constructor() {
        super('selectedRowCount', 'Selected');
    }

    @PostConstruct
    protected postConstruct(): void {
        super.postConstruct();

        // this component is only really useful with client side rowmodel
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn(`ag-Grid: agSelectedRowCountComponent should only be used with the client side row model.`);
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

    private onRowSelectionChanged() {
        const selectedRowCount = this.gridApi.getSelectedRows().length;
        this.setValue(selectedRowCount);
        this.setVisible(selectedRowCount > 0);
    }

    public init() {
    }
}
