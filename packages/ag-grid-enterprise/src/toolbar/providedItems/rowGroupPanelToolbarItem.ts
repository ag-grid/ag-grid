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
                itemName: 'agRowGroupPanelToolbarItem',
                moduleName: 'RowGroupingPanel',
                ...this.gos.getModuleErrorParams(),
            });
            this.setDisplayed(false);
            return;
        }

        const panel = this.createManagedBean(builder.createRowGroupDropZone(true, true));
        this.getGui().appendChild(panel.getGui());
    }

    public refresh(_params: IToolbarItemParams): boolean {
        return true;
    }
}
