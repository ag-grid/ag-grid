import type { BeanCollection, LocaleTextFunc, MenuItemDef } from 'ag-grid-community';
import { _createIconNoSpan } from 'ag-grid-community';

export function getCsvExportMenuItem(beans: BeanCollection, localeTextFunc: LocaleTextFunc): MenuItemDef | null {
    const { gos, csvCreator, gridApi } = beans;
    if (gos.get('suppressCsvExport') || !csvCreator) {
        return null;
    }
    return {
        name: localeTextFunc('csvExport', 'CSV Export'),
        icon: _createIconNoSpan('csvExport', beans, null),
        action: () => gridApi.exportDataAsCsv(),
    };
}

export function getExcelExportMenuItem(beans: BeanCollection, localeTextFunc: LocaleTextFunc): MenuItemDef | null {
    const { gos, excelCreator, gridApi } = beans;
    if (gos.get('suppressExcelExport') || !excelCreator) {
        return null;
    }
    return {
        name: localeTextFunc('excelExport', 'Excel Export'),
        icon: _createIconNoSpan('excelExport', beans, null),
        action: () => gridApi.exportDataAsExcel(),
    };
}

export function getExportMenuItems(beans: BeanCollection, localeTextFunc: LocaleTextFunc): MenuItemDef[] {
    const items: MenuItemDef[] = [];
    const csv = getCsvExportMenuItem(beans, localeTextFunc);
    if (csv) {
        items.push(csv);
    }
    const excel = getExcelExportMenuItem(beans, localeTextFunc);
    if (excel) {
        items.push(excel);
    }
    return items;
}
