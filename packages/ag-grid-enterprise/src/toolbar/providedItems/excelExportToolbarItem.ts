import type { IconName } from 'ag-grid-community';

import { AbstractToolbarItemComp } from './abstractToolbarItemComp';

export class ExcelExportToolbarItem extends AbstractToolbarItemComp {
    protected getIconName(): IconName {
        return 'excelExport';
    }

    protected getLocaleKey(): string {
        return 'toolbarExcelExport';
    }

    protected getDefaultLabel(): string {
        return 'Excel Export';
    }

    protected onAction(): void {
        this.beans.gridApi.exportDataAsExcel();
    }
}
