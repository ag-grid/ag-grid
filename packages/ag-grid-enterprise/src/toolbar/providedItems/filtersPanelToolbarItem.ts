import type { IToolbarItemParams, IconName } from 'ag-grid-community';

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
            this.setDisplayed(false);
        }
    }

    protected onAction(): void {
        if (this.beans.gridApi.getOpenedToolPanel() === this.panelId) {
            this.beans.gridApi.closeToolPanel();
        } else {
            this.beans.gridApi.openToolPanel(this.panelId);
        }
    }
}
