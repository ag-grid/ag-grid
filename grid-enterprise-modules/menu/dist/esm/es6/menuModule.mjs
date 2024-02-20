import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { EnterpriseMenuFactory } from "./menu/enterpriseMenu.mjs";
import { ContextMenuFactory } from "./menu/contextMenu.mjs";
import { MenuItemMapper } from "./menu/menuItemMapper.mjs";
import { VERSION } from "./version.mjs";
import { ChartMenuItemMapper } from "./menu/chartMenuItemMapper.mjs";
import { ColumnChooserFactory } from "./menu/columnChooserFactory.mjs";
import { ColumnMenuFactory } from "./menu/columnMenuFactory.mjs";
import { MenuUtils } from "./menu/menuUtils.mjs";
export const MenuModule = {
    version: VERSION,
    moduleName: ModuleNames.MenuModule,
    beans: [EnterpriseMenuFactory, ContextMenuFactory, MenuItemMapper, ChartMenuItemMapper, ColumnChooserFactory, ColumnMenuFactory, MenuUtils],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
