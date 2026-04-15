import type { IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';
import { Component, _warn } from 'ag-grid-community';

import { RowGroupDropZonePanel } from '../../rowGrouping/columnDropZones/rowGroupDropZonePanel';

export class RowGroupPanelToolbarItem extends Component implements IToolbarItemComp {
    constructor() {
        super({ tag: 'div', cls: 'ag-toolbar-item ag-toolbar-panel' });
    }

    public init(_params: IToolbarItemParams): void {
        if (!this.gos.isModuleRegistered('RowGrouping')) {
            _warn(303, { itemName: 'rowGroupPanel', moduleName: 'RowGrouping' });
            this.setDisplayed(false);
            return;
        }

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
