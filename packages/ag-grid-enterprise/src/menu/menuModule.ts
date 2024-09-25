import type { _MenuGridApi } from 'ag-grid-community';
import { ModuleNames, PopupModule, SharedMenuModule, _CommunityMenuApiModule, _defineModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { AgMenuItemRenderer } from '../widgets/agMenuItemRenderer';
import { ChartMenuItemMapper } from './chartMenuItemMapper';
import { ColumnChooserFactory } from './columnChooserFactory';
import { ColumnMenuFactory } from './columnMenuFactory';
import { ContextMenuService } from './contextMenu';
import { EnterpriseMenuFactory } from './enterpriseMenu';
import { hideColumnChooser, showColumnChooser, showContextMenu } from './menuApi';
import { MenuItemMapper } from './menuItemMapper';
import { MenuUtils } from './menuUtils';

export const MenuCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.MenuModule}-core`,
    beans: [MenuItemMapper, ChartMenuItemMapper, MenuUtils],
    dependantModules: [EnterpriseCoreModule, PopupModule, SharedMenuModule],
    userComponents: [
        {
            name: 'agMenuItem',
            classImp: AgMenuItemRenderer,
        },
    ],
});

export const ColumnMenuModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-enterprise/column-menu',
    beans: [EnterpriseMenuFactory, ColumnMenuFactory],
    dependantModules: [MenuCoreModule],
});

export const ColumnChooserModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-enterprise/column-chooser',
    beans: [ColumnChooserFactory],
    dependantModules: [MenuCoreModule],
});

export const ContextMenuModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-enterprise/context-menu',
    beans: [ContextMenuService],
    dependantModules: [MenuCoreModule],
});

export const MenuApiModule = _defineModule<_MenuGridApi>({
    version: VERSION,
    moduleName: `${ModuleNames.MenuModule}-api`,
    apiFunctions: {
        showContextMenu,
        showColumnChooser,
        hideColumnChooser,
    },
    dependantModules: [ColumnChooserModule, ContextMenuModule, _CommunityMenuApiModule],
});

export const MenuModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.MenuModule,
    dependantModules: [ColumnMenuModule, ColumnChooserModule, ContextMenuModule, MenuApiModule],
});
