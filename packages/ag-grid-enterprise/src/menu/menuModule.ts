import type { _MenuGridApi } from 'ag-grid-community';
import { ModuleNames, PopupModule, _CommunityMenuApiModule, _defineModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { AgMenuItemRenderer } from '../widgets/agMenuItemRenderer';
import { ChartMenuItemMapper } from './chartMenuItemMapper';
import { ColumnChooserFactory } from './columnChooserFactory';
import { ColumnMenuFactory } from './columnMenuFactory';
import { ContextMenuFactory } from './contextMenu';
import { EnterpriseMenuFactory } from './enterpriseMenu';
import { hideColumnChooser, showColumnChooser, showContextMenu } from './menuApi';
import { MenuItemMapper } from './menuItemMapper';
import { MenuUtils } from './menuUtils';

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
    dependantModules: [EnterpriseCoreModule, PopupModule],
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
