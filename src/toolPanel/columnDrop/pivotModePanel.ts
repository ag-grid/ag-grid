import {
    QuerySelector,
    Component,
    Autowired,
    ColumnController,
    GridOptionsWrapper,
    PostConstruct,
    EventService,
    Events,
    Context,
    AgCheckbox
} from "ag-grid/main";

export class PivotModePanel extends Component {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @QuerySelector('.ag-pivot-mode-select') private cbPivotMode: AgCheckbox;

    constructor() {
        super();
    }

    private createTemplate(): string {
        let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        return `<div class="ag-pivot-mode">
                <ag-checkbox class="ag-pivot-mode-select" label="${localeTextFunc('pivotMode', 'Pivot Mode')}"></ag-checkbox>
            </div>`;
    }

    @PostConstruct
    private init(): void {
        this.setTemplate(this.createTemplate());
        this.instantiate(this.context);

        this.cbPivotMode.setSelected(this.columnController.isPivotMode());

        this.addDestroyableEventListener(this.cbPivotMode, AgCheckbox.EVENT_CHANGED, this.onBtPivotMode.bind(this) );
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onPivotModeChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));
    }
    
    private onBtPivotMode(): void {
        let newValue = this.cbPivotMode.isSelected();
        if (newValue !== this.columnController.isPivotMode()) {
            this.columnController.setPivotMode(newValue, "toolPanelUi");
            this.gridOptionsWrapper.getApi().refreshHeader();
        }
    }
    
    private onPivotModeChanged(): void {
        let pivotModeActive = this.columnController.isPivotMode();
        this.cbPivotMode.setSelected(pivotModeActive);
    }
}