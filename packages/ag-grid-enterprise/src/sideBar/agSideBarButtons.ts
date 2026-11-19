import { _clearElement } from 'ag-stack';

import type { AgEvent, ComponentSelector, ElementParams, ToolPanelDef } from 'ag-grid-community';
import { Component } from 'ag-grid-community';

import { SideBarButtonComp } from './sideBarButtonComp';

export interface SideBarButtonClickedEvent extends AgEvent<'sideBarButtonClicked'> {
    toolPanelId: string;
}

type AgSideBarButtonsEvent = 'sideBarButtonClicked';

const SideBarElement: ElementParams = { tag: 'div', cls: 'ag-side-buttons', role: 'tablist' };
export class AgSideBarButtons extends Component<AgSideBarButtonsEvent> {
    private buttonComps: SideBarButtonComp[] = [];

    constructor() {
        super(SideBarElement);
    }

    public setActiveButton(id: string | undefined): void {
        const { buttonComps } = this;
        // one Tab stop, the selected button or the first while no panel is open: arrow keys move between them
        const tabStop = buttonComps.find((comp) => comp.getToolPanelId() === id) ?? buttonComps[0];
        for (const comp of buttonComps) {
            comp.setSelected(comp.getToolPanelId() === id);
            comp.setTabStop(comp === tabStop);
        }
    }

    public addButtonComp(def: ToolPanelDef): SideBarButtonComp {
        const buttonComp = this.createBean(new SideBarButtonComp(def));
        this.buttonComps.push(buttonComp);
        buttonComp.setTabStop(this.buttonComps.length === 1);
        this.appendChild(buttonComp);

        buttonComp.addEventListener('toggleButtonClicked', () => {
            this.dispatchLocalEvent({
                type: 'sideBarButtonClicked',
                toolPanelId: def.id,
            });
        });

        return buttonComp;
    }

    public clearButtons(): void {
        this.buttonComps = this.destroyBeans(this.buttonComps);
        _clearElement(this.getGui());
    }

    public override destroy(): void {
        this.clearButtons();
        super.destroy();
    }
}

export const AgSideBarButtonsSelector: ComponentSelector = {
    selector: 'AG-SIDE-BAR-BUTTONS',
    component: AgSideBarButtons,
};
