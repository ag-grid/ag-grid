import {Autowired, GridApi, Component, Context, Events, EventService, PreConstruct, PostConstruct, RefSelector} from 'ag-grid';
import {StatusBarValueComponent} from "./statusBarValueComponent";

export class SelectedRowCountComponent extends Component {

    private static TEMPLATE = `<div class="ag-status-bar-selected-row-count">
                <ag-selected-row-count-comp key="selectedRowCount" default-value="Selected" ref="selectedRowCountComp"></ag-selected-row-count-comp>
            </div>`;

    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('gridApi') private gridApi: GridApi;

    @RefSelector('selectedRowCountComp') private selectedRowCountComp: StatusBarValueComponent;

    constructor() {
        super(SelectedRowCountComponent.TEMPLATE);
    }

    @PreConstruct
    private preConstruct(): void {
        this.instantiate(this.context);
    }

    @PostConstruct
    private postConstruct(): void {
        // this component is only really useful with client side rowmodel
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn(`ag-Grid: agSelectedRowCountComponent should only be used with the client side row model.`);
            return;
        }

        this.selectedRowCountComp.setValue(this.gridApi.getSelectedRows().length);
        this.selectedRowCountComp.setVisible(true);

        let eventListener = this.onRowSelectionChanged.bind(this);
        this.eventService.addEventListener(Events.EVENT_MODEL_UPDATED, eventListener);
        this.eventService.addEventListener(Events.EVENT_ROW_SELECTED, eventListener);
    }

    private onRowSelectionChanged() {
        this.selectedRowCountComp.setValue(this.gridApi.getSelectedRows().length);
    }

    public init() {
    }
}
