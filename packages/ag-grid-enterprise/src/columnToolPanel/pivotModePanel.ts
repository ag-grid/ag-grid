import type { ElementParams, GridCheckbox } from 'ag-grid-community';
import { AgToggleButtonSelector, Component, RefPlaceholder } from 'ag-grid-community';

import { getColumnToolPanelUpdates } from './updates/columnToolPanelUpdateUtils';
import type { ColumnToolPanelUpdateParams } from './updates/columnToolPanelUpdatesTypes';

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
        private readonly params: ColumnToolPanelUpdateParams,
        private readonly onPivotModeValueChanged?: () => void
    ) {
        super();
    }

    private getCurrentPivotMode(): boolean {
        return getColumnToolPanelUpdates(this.beans).getPivotMode(!!this.params.deferApply);
    }

    public syncFromGrid(): void {
        this.cbPivotMode.setValue(this.getCurrentPivotMode());
    }

    public refreshEditStrategy(): void {
        this.syncFromGrid();
    }

    public postConstruct(): void {
        this.setTemplate(PivotModePanelElement, [AgToggleButtonSelector]);

        const cbPivotMode = this.cbPivotMode;

        cbPivotMode.setValue(this.getCurrentPivotMode());
        const localeTextFunc = this.getLocaleTextFunc();
        cbPivotMode.setLabel(localeTextFunc('pivotMode', 'Pivot Mode'));

        const onBtPivotMode = () => {
            const newValue = !!cbPivotMode.getValue();
            getColumnToolPanelUpdates(this.beans).setPivotMode(!!this.params.deferApply, newValue, 'toolPanelUi');
            this.onPivotModeValueChanged?.();
        };

        const onPivotModeChanged = () => {
            cbPivotMode.setValue(this.getCurrentPivotMode());
        };

        this.addManagedListeners(cbPivotMode, { fieldValueChanged: onBtPivotMode });
        this.addManagedEventListeners({
            newColumnsLoaded: onPivotModeChanged,
            columnPivotModeChanged: onPivotModeChanged,
        });
    }
}
