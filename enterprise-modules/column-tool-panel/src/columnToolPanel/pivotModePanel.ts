import type { AgCheckbox, ColumnModel, GridApi } from '@ag-grid-community/core';
import { AgToggleButton, Autowired, Component, Events, RefSelector } from '@ag-grid-community/core';

export class PivotModePanel extends Component {
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('gridApi') private api: GridApi;

    @RefSelector('cbPivotMode') private cbPivotMode: AgCheckbox;

    private createTemplate(): string {
        return /* html */ `<div class="ag-pivot-mode-panel">
                <ag-toggle-button ref="cbPivotMode" class="ag-pivot-mode-select"></ag-toggle-button>
            </div>`;
    }

    public postConstruct(): void {
        this.setTemplate(this.createTemplate(), [AgToggleButton]);

        this.cbPivotMode.setValue(this.columnModel.isPivotMode());
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.cbPivotMode.setLabel(localeTextFunc('pivotMode', 'Pivot Mode'));

        this.addManagedListener(this.cbPivotMode, Events.EVENT_FIELD_VALUE_CHANGED, this.onBtPivotMode.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onPivotModeChanged.bind(this));
        this.addManagedListener(
            this.eventService,
            Events.EVENT_COLUMN_PIVOT_MODE_CHANGED,
            this.onPivotModeChanged.bind(this)
        );
    }

    private onBtPivotMode(): void {
        const newValue = !!this.cbPivotMode.getValue();
        if (newValue !== this.columnModel.isPivotMode()) {
            this.gos.updateGridOptions({ options: { pivotMode: newValue }, source: 'toolPanelUi' as any });
            const { api } = this;
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
