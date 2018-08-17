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

export class FilteredRowCountComponent extends Component {

    private static TEMPLATE = `<div class="ag-status-bar-filtered-row-count">
                <ag-selected-row-count-comp key="filteredRowCount" default-value="Filtered" ref="filteredRowCountComp"></ag-selected-row-count-comp>
            </div>`;

    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('gridApi') private gridApi: GridApi;

    @RefSelector('filteredRowCountComp') private filteredRowCountComp: StatusBarValueComponent;

    constructor() {
        super(FilteredRowCountComponent.TEMPLATE);
    }

    @PreConstruct
    private preConstruct(): void {
        this.instantiate(this.context);
    }

    @PostConstruct
    private postConstruct(): void {
        // this component is only really useful with client side rowmodel
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn(`ag-Grid: agFilteredRowCountComponent should only be used with the client side row model.`);
            return;
        }

        this.filteredRowCountComp.setVisible(true);

        const listener = this.onDataChanged.bind(this);
        this.eventService.addEventListener(Events.EVENT_MODEL_UPDATED, listener);
    }

    private onDataChanged() {
        this.filteredRowCountComp.setValue(this.getRowCountValue())
    }

    private getRowCountValue(): string {
        let filteredRowCount = 0;
        this.gridApi.forEachNodeAfterFilter((node) => filteredRowCount += 1);

        return `${filteredRowCount}`;
    }

    public init() {
    }
}
