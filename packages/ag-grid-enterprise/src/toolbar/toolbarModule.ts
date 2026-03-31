import type { _ModuleWithoutApi } from 'ag-grid-community';
import { _KeyboardNavigationModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { AgToolbarSelector } from './agToolbar';
import { ToolbarService } from './toolbarService';

/**
 * @feature Accessories -> Toolbar
 * @gridOption toolbar
 */
export const ToolbarModule: _ModuleWithoutApi = {
    moduleName: 'Toolbar',
    version: VERSION,
    beans: [ToolbarService],
    selectors: [AgToolbarSelector],
    dependsOn: [EnterpriseCoreModule, _KeyboardNavigationModule],
};
