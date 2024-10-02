import type { Module, ModuleWithApi, _MenuGridApi } from 'ag-grid-community';
import { CommunityMenuApiModule, ModuleNames, PopupModule, SharedMenuModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { AgMenuItemRenderer } from '../widgets/agMenuItemRenderer';
import { ChartMenuItemMapper } from './chartMenuItemMapper';
import { ColumnChooserFactory } from './columnChooserFactory';
import { ColumnMenuFactory } from './columnMenuFactory';
import { ContextMenuService } from './contextMenu';
import { EnterpriseMenuFactory } from './enterpriseMenu';
import { hideColumnChooser, showColumnChooser, showContextMenu } from './menuApi';
import { MenuItemMapper } from './menuItemMapper';
import { MenuUtils } from './menuUtils';

export const MenuCoreModule: Module = {
    ...baseEnterpriseModule('MenuCoreModule'),
    beans: [MenuItemMapper, ChartMenuItemMapper, MenuUtils],
    dependsOn: [EnterpriseCoreModule, PopupModule, SharedMenuModule],
    userComponents: [
        {
            name: 'agMenuItem',
            classImp: AgMenuItemRenderer,
        },
    ],
};

export const ColumnMenuModule: Module = {
    ...baseEnterpriseModule('ColumnMenuModule'),
    beans: [EnterpriseMenuFactory, ColumnMenuFactory],
    dependsOn: [MenuCoreModule],
};

export const ColumnChooserModule: Module = {
    ...baseEnterpriseModule('ColumnChooserModule'),
    beans: [ColumnChooserFactory],
    dependsOn: [MenuCoreModule],
};

export const ContextMenuModule: Module = {
    ...baseEnterpriseModule('ContextMenuModule'),
    beans: [ContextMenuService],
    dependsOn: [MenuCoreModule],
};

export const MenuApiModule: ModuleWithApi<_MenuGridApi> = {
    ...baseEnterpriseModule('MenuApiModule'),
    apiFunctions: {
        showContextMenu,
        showColumnChooser,
        hideColumnChooser,
    },
    dependsOn: [ColumnChooserModule, ContextMenuModule, CommunityMenuApiModule],
};

export const MenuModule: Module = {
    ...baseEnterpriseModule(ModuleNames.MenuModule),
    dependsOn: [ColumnMenuModule, ColumnChooserModule, ContextMenuModule, MenuApiModule],
};
