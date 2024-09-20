import type { _MenuGridApi } from 'ag-grid-community';
import { ModuleNames, _CommunityMenuApiModule, _defineModule } from 'ag-grid-community';
import { AgMenuItemRenderer, EnterpriseCoreModule } from './main';

import { ChartMenuItemMapper } from './menu/chartMenuItemMapper';
import { ColumnChooserFactory } from './menu/columnChooserFactory';
import { ColumnMenuFactory } from './menu/columnMenuFactory';
import { ContextMenuFactory } from './menu/contextMenu';
import { EnterpriseMenuFactory } from './menu/enterpriseMenu';
import { hideColumnChooser, showColumnChooser, showContextMenu } from './menu/menuApi';
import { MenuItemMapper } from './menu/menuItemMapper';
import { MenuUtils } from './menu/menuUtils';
import { VERSION } from './version';

export const MenuCoreModule = _defineModule({
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
});

export const MenuApiModule = _defineModule<_MenuGridApi>({
    version: VERSION,
    moduleName: `${ModuleNames.MenuModule}-api`,
    apiFunctions: {
        showContextMenu,
        showColumnChooser,
        hideColumnChooser,
    },
    dependantModules: [MenuCoreModule, _CommunityMenuApiModule],
});

export const MenuModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.MenuModule,
    dependantModules: [MenuCoreModule, MenuApiModule],
});
