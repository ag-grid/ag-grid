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

export class TotalRowCountComponent extends Component {

    private static TEMPLATE = `<div class="ag-status-bar-total-row-count">
                <ag-selected-row-count-comp key="rowCount" default-value="Total Rows" ref="totalRowCountComp"></ag-selected-row-count-comp>
            </div>`;

    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('gridApi') private gridApi: GridApi;

    @RefSelector('totalRowCountComp') private totalRowCountComp: StatusBarValueComponent;

    constructor() {
        super(TotalRowCountComponent.TEMPLATE);
    }

    @PreConstruct
    private preConstruct(): void {
        this.instantiate(this.context);
    }

    @PostConstruct
    private postConstruct(): void {
        // this component is only really useful with client side rowmodel
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn(`ag-Grid: agTotalRowCountComponent should only be used with the client side row model.`);
            return;
        }

        this.totalRowCountComp.setVisible(true);

        const listener = this.onDataChanged.bind(this);
        this.eventService.addEventListener(Events.EVENT_MODEL_UPDATED, listener);
    }

    private onDataChanged() {
        this.totalRowCountComp.setValue(this.getRowCountValue())
    }

    private getRowCountValue(): string {
        let totalRowCount = 0;
        this.gridApi.forEachNode((node) => totalRowCount += 1);

        return `${totalRowCount}`;
    }

    public init() {
    }
}
