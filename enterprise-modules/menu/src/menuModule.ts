import type { Module } from '@ag-grid-community/core';
import { ModuleNames, _CommunityMenuApiModule } from '@ag-grid-community/core';
import { AgMenuItemRenderer, EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import { ChartMenuItemMapper } from './menu/chartMenuItemMapper';
import { ColumnChooserFactory } from './menu/columnChooserFactory';
import { ColumnMenuFactory } from './menu/columnMenuFactory';
import { ContextMenuFactory } from './menu/contextMenu';
import { EnterpriseMenuFactory } from './menu/enterpriseMenu';
import { hideColumnChooser, showColumnChooser, showContextMenu } from './menu/menuApi';
import { MenuItemMapper } from './menu/menuItemMapper';
import { MenuUtils } from './menu/menuUtils';
import { VERSION } from './version';

export const MenuCoreModule: Module = {
    version: VERSION,
    moduleName: `${ModuleNames.MenuModule}-core`,
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
    userComponents: [
        {
            name: 'agMenuItem',
            classImp: AgMenuItemRenderer,
        },
    ],
};

export const MenuApiModule: Module = {
    version: VERSION,
    moduleName: `${ModuleNames.MenuModule}-api`,
    apiFunctions: {
        showContextMenu,
        showColumnChooser,
        hideColumnChooser,
    },
    dependantModules: [MenuCoreModule, _CommunityMenuApiModule],
};

export const MenuModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.MenuModule,
    dependantModules: [MenuCoreModule, MenuApiModule],
};
