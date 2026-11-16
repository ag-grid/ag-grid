import type { _ColumnChooserGridApi, _ContextMenuGridApi, _ModuleWithApi, _ModuleWithoutApi } from 'ag-grid-community';
import { _ColumnMoveModule, _PopupModule, _SharedDragAndDropModule, _SharedMenuModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { SharedColumnStateUpdateStrategyModule } from '../columnToolPanel/updates/columnStateUpdateStrategyModule';
import { VERSION } from '../version';
import { MenuItemModule } from '../widgets/menuItemModule';
import { ChartMenuItemMapper } from './chartMenuItemMapper';
import { ColumnChooserFactory } from './columnChooserFactory';
import { ColumnMenuFactory } from './columnMenuFactory';
import { ContextMenuService } from './contextMenu';
import { EnterpriseMenuFactory } from './enterpriseMenu';
import { hideColumnChooser, showColumnChooser, showContextMenu } from './menuApi';
import { MenuItemMapper } from './menuItemMapper';
import { MenuUtils } from './menuUtils';
import { ToolbarMenuBuilder } from './toolbarMenuBuilder';

/**
 * @internal
 */
const MenuCoreModule: _ModuleWithoutApi = {
    moduleName: 'MenuCore',
    version: VERSION,
    beans: [MenuItemMapper, ChartMenuItemMapper, MenuUtils, ToolbarMenuBuilder],
    dependsOn: [EnterpriseCoreModule, _PopupModule, _SharedMenuModule, MenuItemModule],
};

/**
 * @feature Accessories -> Column Menu
 */
export const ColumnMenuModule: _ModuleWithApi<_ColumnChooserGridApi> = {
    moduleName: 'ColumnMenu',
    version: VERSION,
    beans: [EnterpriseMenuFactory, ColumnMenuFactory, ColumnChooserFactory],
    apiFunctions: {
        showColumnChooser,
        hideColumnChooser,
    },
    dependsOn: [MenuCoreModule, SharedColumnStateUpdateStrategyModule, _SharedDragAndDropModule, _ColumnMoveModule],
};

/**
 * @feature Accessories -> Context Menu
 */
export const ContextMenuModule: _ModuleWithApi<_ContextMenuGridApi> = {
    moduleName: 'ContextMenu',
    version: VERSION,
    beans: [ContextMenuService],
    apiFunctions: {
        showContextMenu,
    },
    dependsOn: [MenuCoreModule],
};

/**
 * @feature Accessories -> Column Menu / Context Menu
 */
export const MenuModule: _ModuleWithoutApi = {
    moduleName: 'Menu',
    version: VERSION,
    dependsOn: [ColumnMenuModule, ContextMenuModule],
};
