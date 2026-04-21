import type { IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';
import { Component, _warn } from 'ag-grid-community';

export class RowGroupPanelToolbarItem extends Component implements IToolbarItemComp {
    constructor() {
        super({ tag: 'div', cls: 'ag-toolbar-item ag-toolbar-panel' });
    }

    public init(_params: IToolbarItemParams): void {
        const builder = this.beans.rowGroupPanelBuilder;
        if (!builder) {
            _warn(302, {
                itemName: 'rowGroupPanel',
                moduleName: 'RowGroupingPanel',
                ...this.gos.getModuleErrorParams(),
            });
            this.setDisplayed(false);
            return;
        }

        const panel = this.createManagedBean(builder.createRowGroupDropZone(true));
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
