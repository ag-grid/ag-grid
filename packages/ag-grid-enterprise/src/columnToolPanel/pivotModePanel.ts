import type { ElementParams, GridCheckbox } from 'ag-grid-community';
import { AgToggleButtonSelector, Component, RefPlaceholder } from 'ag-grid-community';

import {
    type BaseColumnToolPanelEdits,
    ColumnToolPanelDeferredEdit,
    type ColumnToolPanelEditParams,
} from './columnToolPanelEdits';

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

    constructor(private readonly params: ColumnToolPanelEditParams) {
        super();
    }

    private getCurrentPivotMode(): boolean {
        if (this.params.deferApply) {
            const deferred = this.beans.colToolPanelDeferredEdit as ColumnToolPanelDeferredEdit | undefined;
            return deferred?.getDraftPivotMode() ?? this.beans.colModel.isPivotMode();
        }

        return this.beans.colModel.isPivotMode();
    }

    public syncFromGrid(): void {
        this.cbPivotMode.setValue(this.getCurrentPivotMode());
    }

    public postConstruct(): void {
        this.setTemplate(PivotModePanelElement, [AgToggleButtonSelector]);

        const cbPivotMode = this.cbPivotMode;

        cbPivotMode.setValue(this.getCurrentPivotMode());
        const localeTextFunc = this.getLocaleTextFunc();
        cbPivotMode.setLabel(localeTextFunc('pivotMode', 'Pivot Mode'));

        const onBtPivotMode = () => {
            const newValue = !!cbPivotMode.getValue();
            const strategy = (
                this.params.deferApply ? this.beans.colToolPanelDeferredEdit : this.beans.colToolPanelSynchronousEdit
            ) as BaseColumnToolPanelEdits | undefined;
            strategy?.setPivotMode(newValue, 'toolPanelUi');
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
