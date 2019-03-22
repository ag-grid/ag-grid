import {
    AgCheckbox,
    Autowired,
    ColumnController,
    Component,
    Context,
    Events,
    EventService,
    GridOptionsWrapper,
    PreConstruct,
    QuerySelector, RefSelector
} from "ag-grid-community/main";

export class PivotModePanel extends Component {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('cbPivotMode') private cbPivotMode: AgCheckbox;

    constructor() {
        super();
    }

    private createTemplate(): string {
        return `<div class="ag-pivot-mode-panel">
                <ag-checkbox ref="cbPivotMode" class="ag-pivot-mode-select"></ag-checkbox>
            </div>`;
    }

    @PreConstruct
    public init(): void {
        this.setTemplate(this.createTemplate());

        this.cbPivotMode.setSelected(this.columnController.isPivotMode());
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        this.cbPivotMode.setLabel(localeTextFunc('pivotMode', 'Pivot Mode'));

        this.addDestroyableEventListener(this.cbPivotMode, AgCheckbox.EVENT_CHANGED, this.onBtPivotMode.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onPivotModeChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));
    }

    private onBtPivotMode(): void {
        const newValue = this.cbPivotMode.isSelected();
        if (newValue !== this.columnController.isPivotMode()) {
            this.columnController.setPivotMode(newValue, "toolPanelUi");
            const api = this.gridOptionsWrapper.getApi();
            if (api) {
                api.refreshHeader();
            }
        }
    }

    private onPivotModeChanged(): void {
        const pivotModeActive = this.columnController.isPivotMode();
        this.cbPivotMode.setSelected(pivotModeActive);
    }
}