import type { IToolbarItemParams, IconName } from 'ag-grid-community';
import { _warn } from 'ag-grid-community';

import { AbstractToolbarItemComp } from './abstractToolbarItemComp';
import { hasSideBarPanel } from './sideBarPanelUtils';

const FILTER_PANEL_IDS = ['filters', 'filters-new'];

export class FiltersPanelToolbarItem extends AbstractToolbarItemComp {
    private panelId!: string;

    protected getIconName(): IconName {
        return 'filtersToolPanel';
    }

    protected getLocaleKey(): string {
        return 'toolbarFiltersPanel';
    }

    protected getDefaultLabel(): string {
        return 'Filters';
    }

    public override init(params: IToolbarItemParams): void {
        super.init(params);
        const found = FILTER_PANEL_IDS.find((id) => hasSideBarPanel(this.gos, id));
        if (found) {
            this.panelId = found;
        } else {
            _warn(300);
            this.setDisplayed(false);
        }
    }

    protected onAction(): void {
        const { gridApi } = this.beans;
        if (gridApi.getOpenedToolPanel() === this.panelId) {
            gridApi.closeToolPanel();
        } else {
            gridApi.openToolPanel(this.panelId);
        }
    }
}
