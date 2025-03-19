import type { AgCheckbox, ElementParams } from 'ag-grid-community';
import { AgToggleButtonSelector, Component, RefPlaceholder } from 'ag-grid-community';

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
    private readonly cbPivotMode: AgCheckbox = RefPlaceholder;

    public postConstruct(): void {
        this.setTemplate(PivotModePanelElement, [AgToggleButtonSelector]);

        const cbPivotMode = this.cbPivotMode;
        const { colModel, ctrlsSvc, gos } = this.beans;

        cbPivotMode.setValue(colModel.isPivotMode());
        const localeTextFunc = this.getLocaleTextFunc();
        cbPivotMode.setLabel(localeTextFunc('pivotMode', 'Pivot Mode'));

        const onBtPivotMode = () => {
            const newValue = !!cbPivotMode.getValue();
            if (newValue !== colModel.isPivotMode()) {
                gos.updateGridOptions({ options: { pivotMode: newValue }, source: 'toolPanelUi' as any });
                ctrlsSvc.getHeaderRowContainerCtrls().forEach((c) => c.refresh());
            }
        };

        const onPivotModeChanged = () => {
            const pivotModeActive = colModel.isPivotMode();
            cbPivotMode.setValue(pivotModeActive);
        };

        this.addManagedListeners(cbPivotMode, { fieldValueChanged: onBtPivotMode });
        this.addManagedEventListeners({
            newColumnsLoaded: onPivotModeChanged,
            columnPivotModeChanged: onPivotModeChanged,
        });
    }
}
