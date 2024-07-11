import type { FiltersToolPanelState, IFiltersToolPanel, IToolPanelComp } from '@ag-grid-community/core';
import { Component } from '@ag-grid-community/core';

import { FilterPanel } from './filterPanel';
import { FilterStateService } from './filterStateService';

export class WrapperToolPanel extends Component implements IFiltersToolPanel, IToolPanelComp {
    private filterPanel: FilterPanel;

    public postConstruct(): void {
        const filterStateService = this.createManagedBean(new FilterStateService());
        this.filterPanel = this.createManagedBean(new FilterPanel(filterStateService));
        this.addManagedListeners(filterStateService, {
            filterStatesChanged: () => this.filterPanel.refresh(),
        });
    }

    public override getGui(): HTMLElement {
        return this.filterPanel?.getGui();
    }

    setFilterLayout(): void {
        // do nothing
    }
    expandFilterGroups(): void {
        // do nothing
    }
    collapseFilterGroups(): void {
        // do nothing
    }
    expandFilters(): void {
        // do nothing
    }
    collapseFilters(): void {
        // do nothing
    }
    syncLayoutWithGrid(): void {
        // do nothing
    }
    getState(): FiltersToolPanelState {
        return {
            expandedColIds: [],
            expandedGroupIds: [],
        };
    }
    refresh(): boolean | void {
        return true;
    }
}
