import type { IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';
import { Component, _warnOnce } from 'ag-grid-community';

import { RowGroupDropZonePanel } from '../../rowGrouping/columnDropZones/rowGroupDropZonePanel';

export class RowGroupPanelToolbarItem extends Component implements IToolbarItemComp {
    private panel: RowGroupDropZonePanel | undefined;

    constructor() {
        super({ tag: 'div', cls: 'ag-toolbar-item ag-toolbar-panel' });
    }

    public init(_params: IToolbarItemParams): void {
        if (this.isStandardPlacementActive()) {
            _warnOnce(
                'AG Grid: rowGroupPanel is configured in both the toolbar and standard placement (rowGroupPanelShow). Standard placement takes precedence.'
            );
            this.setDisplayed(false);
            return;
        }

        this.panel = this.createManagedBean(new RowGroupDropZonePanel(true));
        this.panel.setDisplayed(true);
        this.getGui().appendChild(this.panel.getGui());

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

    private updateVisibility(): void {
        const rowGroupPanelShow = this.gos.get('rowGroupPanelShow');
        if (rowGroupPanelShow === 'always') {
            this.setDisplayed(true);
        } else if (rowGroupPanelShow === 'onlyWhenGrouping') {
            const grouping = (this.beans.rowGroupColsSvc?.columns?.length ?? 0) > 0;
            this.setDisplayed(grouping);
        } else {
            // 'never' or unset — when in toolbar, always show (user explicitly added it)
            this.setDisplayed(true);
        }
    }

    private isStandardPlacementActive(): boolean {
        const rowGroupPanelShow = this.gos.get('rowGroupPanelShow');
        return rowGroupPanelShow === 'always' || rowGroupPanelShow === 'onlyWhenGrouping';
    }
}
