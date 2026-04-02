import type { ToolbarItemComponentName, _ModuleWithoutApi } from 'ag-grid-community';
import { _KeyboardNavigationModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { AgToolbarSelector } from './agToolbar';
import { ColumnChooserToolbarItem } from './providedItems/columnChooserToolbarItem';
import { CsvExportToolbarItem } from './providedItems/csvExportToolbarItem';
import { ResetColumnsToolbarItem } from './providedItems/resetColumnsToolbarItem';
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
        agColumnChooserToolbarItem: ColumnChooserToolbarItem,
        agCsvExportToolbarItem: CsvExportToolbarItem,
        agResetColumnsToolbarItem: ResetColumnsToolbarItem,
    } satisfies Record<ToolbarItemComponentName, any>,
    selectors: [AgToolbarSelector],
    dependsOn: [EnterpriseCoreModule, _KeyboardNavigationModule],
};
