import type { IToolbarItemParams, IconName } from 'ag-grid-community';
import { _warn } from 'ag-grid-community';

import { AbstractToolbarItemComp } from './abstractToolbarItemComp';
import { hasSideBarPanel } from './sideBarPanelUtils';

export class ColumnsPanelToolbarItem extends AbstractToolbarItemComp {
    private readonly panelId = 'columns';

    protected getIconName(): IconName {
        return 'columnsToolPanel';
    }

    protected getLocaleKey(): string {
        return 'toolbarColumnsPanel';
    }

    protected getDefaultLabel(): string {
        return 'Columns';
    }

    public override init(params: IToolbarItemParams): void {
        super.init(params);
        if (!hasSideBarPanel(this.gos, this.panelId)) {
            _warn(299);
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
