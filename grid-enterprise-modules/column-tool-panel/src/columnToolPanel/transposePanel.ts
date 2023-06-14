import {
    AgCheckbox,
    Autowired,
    ColumnModel,
    Component,
    Events,
    PreConstruct,
    RefSelector
} from "@ag-grid-community/core";

export class TransposePanel extends Component {

    @Autowired('columnModel') private columnModel: ColumnModel;

    @RefSelector('cbTransposeMode') private cbTransposeMode: AgCheckbox;

    private createTemplate(): string {
        return /* html */ `<div class="ag-transpose-mode-panel">
                <ag-toggle-button ref="cbTransposeMode" class="ag-transpose-mode-select"></ag-toggle-button>
            </div>`;
    }

    @PreConstruct
    public init(): void {
        this.setTemplate(this.createTemplate());

        this.cbTransposeMode.setValue(this.columnModel.isTransposeMode());
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.cbTransposeMode.setLabel(localeTextFunc('transposeMode', 'Transpose Mode'));

        this.addManagedListener(this.cbTransposeMode, AgCheckbox.EVENT_CHANGED, this.onBtTransposeMode.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onTransposeModeChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_TRANSPOSE_MODE_CHANGED, this.onTransposeModeChanged.bind(this));
    }

    private onBtTransposeMode(): void {
        const newValue = !!this.cbTransposeMode.getValue();
        if (newValue !== this.columnModel.isTransposeMode()) {
            this.columnModel.setTransposeMode(newValue, "toolPanelUi");
            const api = this.gridOptionsService.api;
            if (api) {
                api.refreshHeader();
            }
        }
    }

    private onTransposeModeChanged(): void {
        const transposeModeActive = this.columnModel.isTransposeMode();
        this.cbTransposeMode.setValue(transposeModeActive);
    }
}
