import {
    AgCheckbox,
    Autowired,
    ColumnController,
    Component,
    Events,
    GridOptionsWrapper,
    PreConstruct,
    RefSelector
} from "@ag-grid-community/core";

export class PivotModePanel extends Component {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('cbPivotMode') private cbPivotMode: AgCheckbox;

    private createTemplate(): string {
        return /* html */ `<div class="ag-pivot-mode-panel">
                <ag-toggle-button ref="cbPivotMode" class="ag-pivot-mode-select"></ag-toggle-button>
            </div>`;
    }

    @PreConstruct
    public init(): void {
        this.setTemplate(this.createTemplate());

        this.cbPivotMode.setInputAriaLabel('Toggle Pivot Mode');
        this.cbPivotMode.setValue(this.columnController.isPivotMode());
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        this.cbPivotMode.setLabel(localeTextFunc('pivotMode', 'Pivot Mode'));

        this.addManagedListener(this.cbPivotMode, AgCheckbox.EVENT_CHANGED, this.onBtPivotMode.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onPivotModeChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));
    }

    private onBtPivotMode(): void {
        const newValue = this.cbPivotMode.getValue();
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
        this.cbPivotMode.setValue(pivotModeActive);
    }
}
