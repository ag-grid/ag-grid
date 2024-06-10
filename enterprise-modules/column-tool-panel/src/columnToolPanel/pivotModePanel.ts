import type { AgCheckbox, BeanCollection, ColumnModel, CtrlsService } from '@ag-grid-community/core';
import { AgToggleButtonClass, Component, RefPlaceholder } from '@ag-grid-community/core';

export class PivotModePanel extends Component {
    private columnModel: ColumnModel;
    private ctrlsService: CtrlsService;

    public wireBeans(beans: BeanCollection) {
        this.columnModel = beans.columnModel;
        this.ctrlsService = beans.ctrlsService;
    }

    private readonly cbPivotMode: AgCheckbox = RefPlaceholder;

    private createTemplate(): string {
        return /* html */ `<div class="ag-pivot-mode-panel">
                <ag-toggle-button data-ref="cbPivotMode" class="ag-pivot-mode-select"></ag-toggle-button>
            </div>`;
    }

    public postConstruct(): void {
        this.setTemplate(this.createTemplate(), [AgToggleButtonClass]);

        this.cbPivotMode.setValue(this.columnModel.isPivotMode());
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.cbPivotMode.setLabel(localeTextFunc('pivotMode', 'Pivot Mode'));

        this.addManagedListeners(this.cbPivotMode, { fieldValueChanged: this.onBtPivotMode.bind(this) });
        const listener = this.onPivotModeChanged.bind(this);
        this.addManagedEventListeners({
            newColumnsLoaded: listener,
            columnPivotModeChanged: listener,
        });
    }

    private onBtPivotMode(): void {
        const newValue = !!this.cbPivotMode.getValue();
        if (newValue !== this.columnModel.isPivotMode()) {
            this.gos.updateGridOptions({ options: { pivotMode: newValue }, source: 'toolPanelUi' as any });
            this.ctrlsService.getHeaderRowContainerCtrls().forEach((c) => c.refresh());
        }
    }

    private onPivotModeChanged(): void {
        const pivotModeActive = this.columnModel.isPivotMode();
        this.cbPivotMode.setValue(pivotModeActive);
    }
}
