import { RefPlaceholder } from 'ag-stack';

import type { ElementParams, GridCheckbox } from 'ag-grid-community';
import { AgToggleButtonSelector, Component } from 'ag-grid-community';

import { isDeferredMode } from './toolPanelDeferredUiUtils';
import type { ColumnStateUpdateParams } from './updates/columnStateUpdateTypes';

const PivotModePanelElement: ElementParams = {
    tag: 'div',
    cls: 'ag-pivot-mode-panel',
    children: [
        {
            tag: 'ag-toggle-button',
            ref: 'cbPivotMode',
            cls: 'ag-pivot-mode-select',
        },
    ],
};
export class PivotModePanel extends Component {
    private readonly cbPivotMode: GridCheckbox = RefPlaceholder;

    constructor(
        private readonly params: ColumnStateUpdateParams,
        private readonly onPivotModeValueChanged?: () => void
    ) {
        super();
    }

    private getCurrentPivotMode(): boolean {
        return this.beans.columnStateUpdateStrategy.getPivotMode(isDeferredMode(this.params));
    }

    public syncFromGrid(): void {
        this.cbPivotMode.setValue(this.getCurrentPivotMode());
    }

    public refreshEditStrategy(): void {
        this.syncFromGrid();
    }

    public postConstruct(): void {
        const { columnStateUpdateStrategy, ctrlsSvc } = this.beans;
        this.setTemplate(PivotModePanelElement, [AgToggleButtonSelector]);

        const cbPivotMode = this.cbPivotMode;

        cbPivotMode.setValue(this.getCurrentPivotMode());
        const localeTextFunc = this.getLocaleTextFunc();
        cbPivotMode.setLabel(localeTextFunc('pivotMode', 'Pivot Mode'));

        const onBtPivotMode = () => {
            const newValue = !!cbPivotMode.getValue();

            columnStateUpdateStrategy.setPivotMode(isDeferredMode(this.params), newValue, 'toolPanelUi');

            this.onPivotModeValueChanged?.();
        };

        const onPivotModeChanged = () => {
            cbPivotMode.setValue(this.getCurrentPivotMode());
            ctrlsSvc.getHeaderRowContainerCtrl()?.refresh();
        };

        this.addManagedListeners(cbPivotMode, { fieldValueChanged: onBtPivotMode });
        this.addManagedEventListeners({
            newColumnsLoaded: onPivotModeChanged,
            columnPivotModeChanged: onPivotModeChanged,
        });
    }
}
