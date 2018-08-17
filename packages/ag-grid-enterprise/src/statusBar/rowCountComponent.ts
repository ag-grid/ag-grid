import {
    Autowired,
    Component,
    Context,
    Events,
    EventService,
    GridApi,
    PostConstruct,
    PreConstruct,
    RefSelector
} from 'ag-grid';
import {StatusBarValueComponent} from "./statusBarValueComponent";

export class RowCountComponent extends Component {

    private static TEMPLATE = `<div class="ag-status-bar-row-count">
                <ag-selected-row-count-comp key="rowCount" default-value="Row Count" ref="selectedRowCountComp"></ag-selected-row-count-comp>
            </div>`;

    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('gridApi') private gridApi: GridApi;

    @RefSelector('selectedRowCountComp') private selectedRowCountComp: StatusBarValueComponent;

    constructor() {
        super(RowCountComponent.TEMPLATE);
    }

    @PreConstruct
    private preConstruct(): void {
        this.instantiate(this.context);
    }

    @PostConstruct
    private postConstruct(): void {
        // this component is only really useful with client side rowmodel
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn(`ag-Grid: agRowCountComponent should only be used with the client side row model.`);
            return;
        }

        this.selectedRowCountComp.setVisible(true);

        const listener = this.onDataChanged.bind(this);
        this.eventService.addEventListener(Events.EVENT_MODEL_UPDATED, listener);
    }

    private onDataChanged() {
        this.selectedRowCountComp.setValue(this.getRowCountValue())
    }

    private getRowCountValue(): string {
        let totalRowCount = 0;
        this.gridApi.forEachNode((node) => totalRowCount += 1);

        let filteredRowCount = 0;
        this.gridApi.forEachNodeAfterFilter((node) => filteredRowCount += 1);

        return `${filteredRowCount} / ${totalRowCount}`;
    }

    public init() {
    }
}
