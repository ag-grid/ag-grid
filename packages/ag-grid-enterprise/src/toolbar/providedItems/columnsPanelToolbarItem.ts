import type { IToolbarItemParams, IconName } from 'ag-grid-community';

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
