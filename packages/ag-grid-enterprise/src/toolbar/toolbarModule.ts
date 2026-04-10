import type { ToolbarItemComponentName, _ModuleWithoutApi } from 'ag-grid-community';
import { _KeyboardNavigationModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { AgToolbarSelector } from './agToolbar';
import { AutoSizeAllToolbarItem } from './providedItems/autoSizeAllToolbarItem';
import { ColumnChooserToolbarItem } from './providedItems/columnChooserToolbarItem';
import { ColumnsPanelToolbarItem } from './providedItems/columnsPanelToolbarItem';
import { CsvExportToolbarItem } from './providedItems/csvExportToolbarItem';
import { ExcelExportToolbarItem } from './providedItems/excelExportToolbarItem';
import { ExportToolbarItem } from './providedItems/exportToolbarItem';
import { FiltersPanelToolbarItem } from './providedItems/filtersPanelToolbarItem';
import { FindToolbarItem } from './providedItems/findToolbarItem';
import { PivotPanelToolbarItem } from './providedItems/pivotPanelToolbarItem';
import { QuickFilterToolbarItem } from './providedItems/quickFilterToolbarItem';
import { ResetColumnsToolbarItem } from './providedItems/resetColumnsToolbarItem';
import { RowGroupPanelToolbarItem } from './providedItems/rowGroupPanelToolbarItem';
import { ToolbarService } from './toolbarService';

/**
 * @feature Accessories -> Toolbar
 * @gridOption toolbar
 */
export const ToolbarModule: _ModuleWithoutApi = {
    moduleName: 'Toolbar',
    version: VERSION,
    beans: [ToolbarService],
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
        search: 'search',
    },
    selectors: [AgToolbarSelector],
    dependsOn: [EnterpriseCoreModule, _KeyboardNavigationModule],
};
