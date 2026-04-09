import type { IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';
import { Component } from 'ag-grid-community';

import { RowGroupDropZonePanel } from '../../rowGrouping/columnDropZones/rowGroupDropZonePanel';

export class RowGroupPanelToolbarItem extends Component implements IToolbarItemComp {
    constructor() {
        super({ tag: 'div', cls: 'ag-toolbar-item ag-toolbar-panel' });
    }

    public init(_params: IToolbarItemParams): void {
        const panel = this.createManagedBean(new RowGroupDropZonePanel(true));
        this.getGui().appendChild(panel.getGui());

        // Keep the inner panel always visible — the wrapper controls visibility
        panel.setDisplayed(true);
        this.addManagedListeners(panel, {
            displayChanged: () => panel.setDisplayed(true),
        });
    }

    public refresh(_params: IToolbarItemParams): boolean {
        return true;
    }
}
