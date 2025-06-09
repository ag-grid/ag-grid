import type { IToolPanelComp } from 'ag-grid-community';
import { Component, _warn } from 'ag-grid-community';

import type { FilterPanelRefreshParams } from './filterPanel';
import { FilterPanel } from './filterPanel';
import { newFiltersToolPanelCSS } from './newFiltersToolPanel.css-GENERATED';

export class WrapperToolPanel extends Component implements IToolPanelComp {
    private filterPanel: FilterPanel;

    constructor() {
        super();
        this.registerCSS(newFiltersToolPanelCSS);
    }

    public postConstruct(): void {
        if (!this.gos.get('enableFilterHandlers')) {
            _warn(279);
            return;
        }
        const filterPanel = this.createManagedBean(new FilterPanel());
        this.filterPanel = filterPanel;
        const refresh = (event?: FilterPanelRefreshParams) => filterPanel.refresh(event);
        refresh();
        this.addManagedListeners(this.beans.filterPanelSvc!, {
            filterPanelStatesChanged: refresh,
            filterPanelStateChanged: refresh,
        });
    }

    public override getGui(): HTMLElement {
        return this.filterPanel?.getGui();
    }

    refresh(): boolean | void {
        return true;
    }
}
