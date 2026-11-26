import type { ITooltipFeature } from 'ag-stack';
import { RefPlaceholder } from 'ag-stack';

import type { ElementParams, GridCheckbox } from 'ag-grid-community';
import { AgToggleButtonSelector, Component } from 'ag-grid-community';

import type { ColumnToolPanelChildParams } from './columnToolPanel';
import { isDeferredMode } from './toolPanelDeferredUiUtils';

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
    private pivotModeTooltip?: ITooltipFeature;

    constructor(
        private readonly params: ColumnToolPanelChildParams,
        private readonly onPivotModeValueChanged?: () => void
    ) {
        super();
    }

    private getCurrentPivotMode(): boolean {
        return this.beans.columnStateUpdateStrategy.getPivotMode(isDeferredMode(this.params));
    }

    public syncFromGrid(): void {
        this.cbPivotMode.setValue(this.getCurrentPivotMode());
        this.pivotModeTooltip?.refreshTooltip();
    }

    public refreshEditStrategy(): void {
        this.syncFromGrid();
    }

    public postConstruct(): void {
        const columnStateUpdateStrategy = this.beans.columnStateUpdateStrategy;
        this.setTemplate(PivotModePanelElement, [AgToggleButtonSelector]);

        const cbPivotMode = this.cbPivotMode;

        cbPivotMode.setValue(this.getCurrentPivotMode());
        const localeTextFunc = this.getLocaleTextFunc();
        cbPivotMode.setLabel(localeTextFunc('pivotMode', 'Pivot Mode'));
        this.pivotModeTooltip = this.addTooltip({
            getGui: () => cbPivotMode.getGui(),
            getAriaElement: () => cbPivotMode.getInputElement(),
            getLocation: () => 'columnToolPanelColumn',
            control: 'pivotMode',
            getTooltip: () => ({
                value: cbPivotMode.getValue()
                    ? localeTextFunc('tooltipTurnOffPivotMode', 'Turn off pivot mode')
                    : localeTextFunc('tooltipTurnOnPivotMode', 'Turn on pivot mode'),
            }),
            getTooltipAccessibleName: () => localeTextFunc('pivotMode', 'Pivot Mode'),
        });

        const onBtPivotMode = () => {
            const newValue = !!cbPivotMode.getValue();

            columnStateUpdateStrategy.setPivotMode(isDeferredMode(this.params), newValue, 'toolPanelUi');
            this.pivotModeTooltip?.refreshTooltip();

            this.onPivotModeValueChanged?.();
        };

        const onPivotModeChanged = () => this.syncFromGrid();

        this.addManagedListeners(cbPivotMode, { fieldValueChanged: onBtPivotMode });
        this.addManagedEventListeners({
            newColumnsLoaded: onPivotModeChanged,
            columnPivotModeChanged: onPivotModeChanged,
        });
    }
}
