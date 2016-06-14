import {QuerySelector, Component, Autowired, ColumnController, PostConstruct, EventService, Events, Context, AgCheckbox} from "ag-grid/main";

export class PivotModePanel extends Component {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    @QuerySelector('.ag-pivot-mode-select') private cbPivotMode: AgCheckbox;

    constructor() {
        super(this.createTemplate());
    }

    private createTemplate(): string {
        return `<div class="ag-pivot-mode">
                <ag-checkbox class="ag-pivot-mode-select" label="Pivot Mode"></ag-checkbox>
            </div>`;
    }

    @PostConstruct
    private init(): void {
        this.instantiate(this.context);

        this.addDestroyableEventListener(this.cbPivotMode, AgCheckbox.EVENT_CHANGED, this.onRbReduce.bind(this) );
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onReduceChanged.bind(this));
    }
    
    private onRbReduce(): void {
        var newValue = this.cbPivotMode.isSelected();
        if (newValue !== this.columnController.isPivotMode()) {
            this.columnController.setPivotMode(newValue);
        }
    }
    
    private onReduceChanged(): void {
        var pivotModeActive = this.columnController.isPivotMode();
        this.cbPivotMode.setSelected(pivotModeActive);
    }
}