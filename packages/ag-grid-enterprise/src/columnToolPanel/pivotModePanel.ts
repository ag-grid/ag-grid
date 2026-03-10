import type { ElementParams, GridCheckbox } from 'ag-grid-community';
import { AgToggleButtonSelector, Component, RefPlaceholder } from 'ag-grid-community';

import { getColumnToolPanelEditStrategy } from './columnToolPanelEditUtils';
import type { BaseColumnToolPanelEdits, ColumnToolPanelEditParams } from './columnToolPanelEditsTypes';

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
    private editStrategy?: BaseColumnToolPanelEdits;

    constructor(
        private readonly params: ColumnToolPanelEditParams,
        private readonly onPivotModeValueChanged?: () => void
    ) {
        super();
    }

    private getEditStrategy(): BaseColumnToolPanelEdits {
        return (this.editStrategy ??= getColumnToolPanelEditStrategy(this.beans, this.params.deferApply));
    }

    private getCurrentPivotMode(): boolean {
        return this.getEditStrategy().getPivotMode();
    }

    public syncFromGrid(): void {
        this.cbPivotMode.setValue(this.getCurrentPivotMode());
    }

    public refreshEditStrategy(): void {
        this.editStrategy = undefined;
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
            this.getEditStrategy().setPivotMode(newValue, 'toolPanelUi');
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
