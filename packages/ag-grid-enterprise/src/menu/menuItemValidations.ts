import type { DefaultMenuItem, GridOptionsService, _ValidationModuleName } from 'ag-grid-community';

const MENU_ITEM_MODULES: Record<DefaultMenuItem, _ValidationModuleName | _ValidationModuleName[]> = {
    pinSubMenu: 'PinnedColumn',
    pinLeft: 'PinnedColumn',
    pinRight: 'PinnedColumn',
    clearPinned: 'PinnedColumn',
    pinRowSubMenu: 'PinnedRow',
    pinBottom: 'PinnedRow',
    pinTop: 'PinnedRow',
    unpinRow: 'PinnedRow',
    valueAggSubMenu: 'SharedAggregation',
    showValuesAsSubMenu: 'ShowValuesAs',
    autoSizeThis: 'ColumnAutoSize',
    autoSizeAll: 'ColumnAutoSize',
    rowGroup: 'SharedRowGrouping',
    rowUnGroup: 'SharedRowGrouping',
    resetColumns: 'CommunityCore',
    expandAll: ['CsrmHierarchy', 'ServerSideRowModel'],
    contractAll: ['CsrmHierarchy', 'ServerSideRowModel'],
    copy: 'Clipboard',
    copyWithHeaders: 'Clipboard',
    copyWithGroupHeaders: 'Clipboard',
    cut: 'Clipboard',
    paste: 'Clipboard',
    export: ['CsvExport', 'ExcelExport', 'PdfExport'],
    note: 'Notes',
    csvExport: 'CsvExport',
    excelExport: 'ExcelExport',
    pdfExport: 'PdfExport',
    separator: 'CommunityCore',
    pivotChart: 'IntegratedCharts',
    chartRange: 'IntegratedCharts',
    columnFilter: 'ColumnFilter',
    columnChooser: 'ColumnMenu',
    calculatedColumn: 'CalculatedColumns',
    editCalculatedColumn: 'CalculatedColumns',
    removeCalculatedColumn: 'CalculatedColumns',
    sortAscending: 'Sort',
    sortDescending: 'Sort',
    sortAbsoluteAscending: 'Sort',
    sortAbsoluteDescending: 'Sort',
    sortUnSort: 'Sort',
};

export function validateMenuItem(gos: GridOptionsService, key: string): void {
    const moduleName = MENU_ITEM_MODULES[key as DefaultMenuItem];
    if (moduleName) {
        gos.assertModuleRegistered(moduleName, `menu item \`${key}\``);
    }
}
