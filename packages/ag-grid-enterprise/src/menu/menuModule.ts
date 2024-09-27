import type { _MenuGridApi } from 'ag-grid-community';
import { CommunityMenuApiModule, ModuleNames, PopupModule, SharedMenuModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { defineEnterpriseModule } from '../moduleUtils';
import { AgMenuItemRenderer } from '../widgets/agMenuItemRenderer';
import { ChartMenuItemMapper } from './chartMenuItemMapper';
import { ColumnChooserFactory } from './columnChooserFactory';
import { ColumnMenuFactory } from './columnMenuFactory';
import { ContextMenuService } from './contextMenu';
import { EnterpriseMenuFactory } from './enterpriseMenu';
import { hideColumnChooser, showColumnChooser, showContextMenu } from './menuApi';
import { MenuItemMapper } from './menuItemMapper';
import { MenuUtils } from './menuUtils';

export const MenuCoreModule = defineEnterpriseModule('MenuCoreModule', {
    beans: [MenuItemMapper, ChartMenuItemMapper, MenuUtils],
    dependsOn: [EnterpriseCoreModule, PopupModule, SharedMenuModule],
    userComponents: [
        {
            name: 'agMenuItem',
            classImp: AgMenuItemRenderer,
        },
    ],
});

export const ColumnMenuModule = defineEnterpriseModule('ColumnMenuModule', {
    beans: [EnterpriseMenuFactory, ColumnMenuFactory],
    dependsOn: [MenuCoreModule],
});

export const ColumnChooserModule = defineEnterpriseModule('ColumnChooserModule', {
    beans: [ColumnChooserFactory],
    dependsOn: [MenuCoreModule],
});

export const ContextMenuModule = defineEnterpriseModule('ContextMenuModule', {
    beans: [ContextMenuService],
    dependsOn: [MenuCoreModule],
});

export const MenuApiModule = defineEnterpriseModule<_MenuGridApi>('MenuApiModule', {
    apiFunctions: {
        showContextMenu,
        showColumnChooser,
        hideColumnChooser,
    },
    dependsOn: [ColumnChooserModule, ContextMenuModule, CommunityMenuApiModule],
});

export const MenuModule = defineEnterpriseModule(ModuleNames.MenuModule, {
    dependsOn: [ColumnMenuModule, ColumnChooserModule, ContextMenuModule, MenuApiModule],
});
