import type { IconName } from 'ag-grid-community';

import { AbstractToolbarItemComp } from './abstractToolbarItemComp';

export class AutoSizeAllToolbarItem extends AbstractToolbarItemComp {
    protected getIconName(): IconName {
        return 'maximize';
    }

    protected getLocaleKey(): string {
        return 'toolbarAutoSizeAll';
    }

    protected getDefaultLabel(): string {
        return 'Auto Size All';
    }

    protected onAction(): void {
        this.beans.gridApi.autoSizeAllColumns();
    }
}
