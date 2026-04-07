import type { IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';
import { Component, _warnOnce } from 'ag-grid-community';

import { PivotDropZonePanel } from '../../rowGrouping/columnDropZones/pivotDropZonePanel';

export class PivotPanelToolbarItem extends Component implements IToolbarItemComp {
    private panel: PivotDropZonePanel | undefined;

    constructor() {
        super({ tag: 'div', cls: 'ag-toolbar-item ag-toolbar-panel' });
    }

    public init(_params: IToolbarItemParams): void {
        if (this.isStandardPlacementActive()) {
            _warnOnce(
                'AG Grid: pivotPanel is configured in both the toolbar and standard placement (pivotPanelShow). Standard placement takes precedence.'
            );
            this.setDisplayed(false);
            return;
        }

        this.panel = this.createManagedBean(new PivotDropZonePanel(true));
        this.getGui().appendChild(this.panel.getGui());

        // Keep the inner panel always visible — the wrapper controls visibility
        this.panel.setDisplayed(true);
        this.addManagedListeners(this.panel, {
            displayChanged: () => this.panel!.setDisplayed(true),
        });

        this.updateVisibility();
        this.addManagedEventListeners({
            columnPivotModeChanged: () => this.updateVisibility(),
        });
    }

    public refresh(_params: IToolbarItemParams): boolean {
        return true;
    }

    private updateVisibility(): void {
        const pivotMode = this.beans.colModel.isPivotMode();
        this.setDisplayed(pivotMode);
    }

    private isStandardPlacementActive(): boolean {
        const pivotPanelShow = this.gos.get('pivotPanelShow');
        return pivotPanelShow === 'always' || pivotPanelShow === 'onlyWhenPivoting';
    }
}
