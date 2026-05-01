import type { IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';
import { Component } from 'ag-grid-community';

import { getRowGroupPanelBuilder } from './toolbarItemUtils';

export class RowGroupPanelToolbarItem extends Component implements IToolbarItemComp {
    constructor() {
        super({ tag: 'div', cls: 'ag-toolbar-item ag-toolbar-panel' });
    }

    public init(_params: IToolbarItemParams): void {
        const builder = getRowGroupPanelBuilder(this.beans, 'agRowGroupPanelToolbarItem');
        if (!builder) {
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
