import type { IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';
import { Component } from 'ag-grid-community';

import { getRowGroupPanelBuilder } from './toolbarItemUtils';

export class PivotPanelToolbarItem extends Component implements IToolbarItemComp {
    constructor() {
        super({ tag: 'div', cls: 'ag-toolbar-item ag-toolbar-panel' });
    }

    public init(_params: IToolbarItemParams): void {
        if (!this.gos.isModuleRegistered('Pivot')) {
            this.beans.log.error(302, {
                itemName: 'agPivotPanelToolbarItem',
                moduleName: 'Pivot',
                ...this.gos.getModuleErrorParams(),
            });
            this.setDisplayed(false);
            return;
        }

        const builder = getRowGroupPanelBuilder(this.beans, 'agPivotPanelToolbarItem');
        if (!builder) {
            this.setDisplayed(false);
            return;
        }

        const panel = this.createManagedBean(builder.createPivotDropZone(true, true));
        this.getGui().appendChild(panel.getGui());

        // Keep the inner panel always visible — the wrapper controls visibility
        panel.setDisplayed(true);
        this.addManagedListeners(panel, {
            displayChanged: () => panel.setDisplayed(true),
        });

        // Hide the toolbar item when not in pivot mode
        this.setDisplayed(this.beans.colModel.pivotMode);
        this.addManagedEventListeners({
            columnPivotModeChanged: () => this.setDisplayed(this.beans.colModel.pivotMode),
        });
    }

    public refresh(_params: IToolbarItemParams): boolean {
        return true;
    }
}
