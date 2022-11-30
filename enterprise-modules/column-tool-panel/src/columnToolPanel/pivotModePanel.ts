import {
    AgCheckbox,
    Autowired,
    ColumnModel,
    Component,
    Events,
    PreConstruct,
    RefSelector
} from "@ag-grid-community/core";

export class PivotModePanel extends Component {

    @Autowired('columnModel') private columnModel: ColumnModel;

    @RefSelector('cbPivotMode') private cbPivotMode: AgCheckbox;

    private createTemplate(): string {
        return /* html */ `<div class="ag-pivot-mode-panel">
                <ag-toggle-button ref="cbPivotMode" class="ag-pivot-mode-select"></ag-toggle-button>
            </div>`;
    }

    @PreConstruct
    public init(): void {
        this.setTemplate(this.createTemplate());

        this.cbPivotMode.setValue(this.columnModel.isPivotMode());
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.cbPivotMode.setLabel(localeTextFunc('pivotMode', 'Pivot Mode'));

        this.addManagedListener(this.cbPivotMode, AgCheckbox.EVENT_CHANGED, this.onBtPivotMode.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onPivotModeChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));
    }

    private onBtPivotMode(): void {
        const newValue = !!this.cbPivotMode.getValue();
        if (newValue !== this.columnModel.isPivotMode()) {
            this.columnModel.setPivotMode(newValue, "toolPanelUi");
            const api = this.gridOptionsService.get('api');
            if (api) {
                api.refreshHeader();
            }
        }
    }

    private onPivotModeChanged(): void {
        const pivotModeActive = this.columnModel.isPivotMode();
        this.cbPivotMode.setValue(pivotModeActive);
    }
}
