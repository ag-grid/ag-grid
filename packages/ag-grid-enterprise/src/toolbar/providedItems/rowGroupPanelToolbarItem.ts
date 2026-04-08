import type { IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';
import { Component } from 'ag-grid-community';

import { RowGroupDropZonePanel } from '../../rowGrouping/columnDropZones/rowGroupDropZonePanel';

export class RowGroupPanelToolbarItem extends Component implements IToolbarItemComp {
    private panel: RowGroupDropZonePanel | undefined;

    constructor() {
        super({ tag: 'div', cls: 'ag-toolbar-item ag-toolbar-panel' });
    }

    public init(_params: IToolbarItemParams): void {
        this.updateVisibility();
        this.addManagedPropertyListener('rowGroupPanelShow', () => this.updateVisibility());
        this.addManagedEventListeners({
            columnRowGroupChanged: () => this.updateVisibility(),
            newColumnsLoaded: () => this.updateVisibility(),
        });
    }

    public refresh(_params: IToolbarItemParams): boolean {
        return true;
    }

    private ensurePanel(): void {
        if (this.panel) {
            return;
        }
        this.panel = this.createManagedBean(new RowGroupDropZonePanel(true));
        this.getGui().appendChild(this.panel.getGui());

        // Keep the inner panel always visible — the wrapper controls visibility
        this.panel.setDisplayed(true);
        this.addManagedListeners(this.panel, {
            displayChanged: () => this.panel!.setDisplayed(true),
        });
    }

    private updateVisibility(): void {
        const rowGroupPanelShow = this.gos.get('rowGroupPanelShow');
        if (rowGroupPanelShow === 'always') {
            this.ensurePanel();
            this.setDisplayed(true);
        } else if (rowGroupPanelShow === 'onlyWhenGrouping') {
            const grouping = (this.beans.rowGroupColsSvc?.columns?.length ?? 0) > 0;
            if (grouping) {
                this.ensurePanel();
            }
            this.setDisplayed(grouping);
        } else {
            // 'never' or unset
            this.setDisplayed(false);
        }
    }
}
