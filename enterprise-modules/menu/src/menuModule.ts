import type { Module } from '@ag-grid-community/core';
import { ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import { ChartMenuItemMapper } from './menu/chartMenuItemMapper';
import { ColumnChooserFactory } from './menu/columnChooserFactory';
import { ColumnMenuFactory } from './menu/columnMenuFactory';
import { ContextMenuFactory } from './menu/contextMenu';
import { EnterpriseMenuFactory } from './menu/enterpriseMenu';
import { MenuItemMapper } from './menu/menuItemMapper';
import { MenuUtils } from './menu/menuUtils';
import { VERSION } from './version';

export const MenuModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.MenuModule,
    beans: [
        EnterpriseMenuFactory,
        ContextMenuFactory,
        MenuItemMapper,
        ChartMenuItemMapper,
        ColumnChooserFactory,
        ColumnMenuFactory,
        MenuUtils,
    ],
    dependantModules: [EnterpriseCoreModule],
};
