import type { ToolbarItemComponentName, _ModuleWithoutApi } from 'ag-grid-community';
import { _KeyboardNavigationModule, _resetColumnState } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import type { ColumnChooserFactory } from '../menu/columnChooserFactory';
import { VERSION } from '../version';
import { AgToolbarSelector } from './agToolbar';
import { createToolbarButton } from './providedItems/abstractToolbarItemComp';
import { ColumnsPanelToolbarItem } from './providedItems/columnsPanelToolbarItem';
import { ExportToolbarItem } from './providedItems/exportToolbarItem';
import { FiltersPanelToolbarItem } from './providedItems/filtersPanelToolbarItem';
import { FindToolbarItem } from './providedItems/findToolbarItem';
import { PivotPanelToolbarItem } from './providedItems/pivotPanelToolbarItem';
import { QuickFilterToolbarItem } from './providedItems/quickFilterToolbarItem';
import { RowGroupPanelToolbarItem } from './providedItems/rowGroupPanelToolbarItem';

const AutoSizeAllToolbarItem = createToolbarButton({
    icon: 'maximize',
    localeKey: 'autosizeAllColumns',
    defaultLabel: 'Autosize All Columns',
    onAction: (beans) => beans.gridApi.autoSizeAllColumns(),
});

const ColumnChooserToolbarItem = createToolbarButton({
    icon: 'columns',
    localeKey: 'columnChooser',
    defaultLabel: 'Choose Columns',
    onAction: (beans, eGui) =>
        (beans.colChooserFactory as ColumnChooserFactory | undefined)?.showColumnChooser({ eventSource: eGui }),
});

const CsvExportToolbarItem = createToolbarButton({
    icon: 'csvExport',
    localeKey: 'csvExport',
    defaultLabel: 'CSV Export',
    onAction: (beans) => beans.gridApi.exportDataAsCsv(),
});

const ExcelExportToolbarItem = createToolbarButton({
    icon: 'excelExport',
    localeKey: 'excelExport',
    defaultLabel: 'Excel Export',
    onAction: (beans) => beans.gridApi.exportDataAsExcel(),
});

const ResetColumnsToolbarItem = createToolbarButton({
    icon: 'minimize',
    localeKey: 'resetColumns',
    defaultLabel: 'Reset Columns',
    onAction: (beans) => _resetColumnState(beans, 'api'),
});

/**
 * @feature Accessories -> Toolbar
 * @gridOption toolbar
 */
export const ToolbarModule: _ModuleWithoutApi = {
    moduleName: 'Toolbar',
    version: VERSION,
    userComponents: {
        agAutoSizeAllToolbarItem: AutoSizeAllToolbarItem,
        agColumnChooserToolbarItem: ColumnChooserToolbarItem,
        agColumnsPanelToolbarItem: ColumnsPanelToolbarItem,
        agCsvExportToolbarItem: CsvExportToolbarItem,
        agExcelExportToolbarItem: ExcelExportToolbarItem,
        agExportToolbarItem: ExportToolbarItem,
        agFiltersPanelToolbarItem: FiltersPanelToolbarItem,
        agFindToolbarItem: FindToolbarItem,
        agPivotPanelToolbarItem: PivotPanelToolbarItem,
        agQuickFilterToolbarItem: QuickFilterToolbarItem,
        agResetColumnsToolbarItem: ResetColumnsToolbarItem,
        agRowGroupPanelToolbarItem: RowGroupPanelToolbarItem,
    } satisfies Record<ToolbarItemComponentName, any>,
    icons: {
        filter: 'filter',
    },
    selectors: [AgToolbarSelector],
    dependsOn: [EnterpriseCoreModule, _KeyboardNavigationModule],
};
