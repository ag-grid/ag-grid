import type { IconName } from 'ag-grid-community';

import { AbstractToolbarItemComp } from './abstractToolbarItemComp';

export class CsvExportToolbarItem extends AbstractToolbarItemComp {
    protected getIconName(): IconName {
        return 'csvExport';
    }

    protected getLocaleKey(): string {
        return 'csvExport';
    }

    protected getDefaultLabel(): string {
        return 'CSV Export';
    }

    protected onAction(): void {
        this.beans.gridApi.exportDataAsCsv();
    }
}
