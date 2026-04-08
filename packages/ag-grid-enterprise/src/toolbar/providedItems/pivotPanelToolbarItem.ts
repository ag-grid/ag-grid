import type { IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';
import { Component } from 'ag-grid-community';

import { PivotDropZonePanel } from '../../rowGrouping/columnDropZones/pivotDropZonePanel';

export class PivotPanelToolbarItem extends Component implements IToolbarItemComp {
    private panel: PivotDropZonePanel | undefined;

    constructor() {
        super({ tag: 'div', cls: 'ag-toolbar-item ag-toolbar-panel' });
    }

    public init(_params: IToolbarItemParams): void {
        this.updateVisibility();
        this.addManagedPropertyListener('pivotPanelShow', () => this.updateVisibility());
        this.addManagedEventListeners({
            columnPivotModeChanged: () => this.updateVisibility(),
        });
    }

    public refresh(_params: IToolbarItemParams): boolean {
        return true;
    }

    private ensurePanel(): void {
        if (this.panel) {
            return;
        }
        this.panel = this.createManagedBean(new PivotDropZonePanel(true));
        this.getGui().appendChild(this.panel.getGui());

        // Keep the inner panel always visible — the wrapper controls visibility
        this.panel.setDisplayed(true);
        this.addManagedListeners(this.panel, {
            displayChanged: () => this.panel!.setDisplayed(true),
        });
    }

    private updateVisibility(): void {
        const pivotPanelShow = this.gos.get('pivotPanelShow');
        if (pivotPanelShow === 'always') {
            this.ensurePanel();
            this.setDisplayed(true);
        } else if (pivotPanelShow === 'onlyWhenPivoting') {
            const pivotMode = this.beans.colModel.isPivotMode();
            if (pivotMode) {
                this.ensurePanel();
            }
            this.setDisplayed(pivotMode);
        } else {
            // 'never' or unset
            this.setDisplayed(false);
        }
    }
}
