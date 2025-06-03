import type { ElementParams, FilterAction } from 'ag-grid-community';
import { Component, FilterButtonComp } from 'ag-grid-community';

const ButtonsElement: ElementParams = {
    tag: 'div',
    cls: 'ag-filters-tool-panel-buttons',
};

export class AgFiltersToolPanelButtons extends Component {
    private eButtons: FilterButtonComp;

    constructor() {
        super(ButtonsElement);
    }

    public postConstruct(): void {
        const eButtons = this.createManagedBean(new FilterButtonComp());
        const colFilter = this.beans.colFilter;
        const listener = ({ type }: { type: FilterAction }) => colFilter?.updateAllModels(type);
        this.addManagedListeners(eButtons, {
            apply: listener,
            clear: listener,
            reset: listener,
            cancel: listener,
        });
        this.appendChild(eButtons.getGui());
        this.eButtons = eButtons;
    }

    public refresh(buttons: FilterAction[]): void {
        this.eButtons.updateButtons(buttons);
    }
}
