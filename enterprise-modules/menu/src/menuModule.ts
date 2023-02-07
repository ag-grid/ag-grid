import { Module, ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { EnterpriseMenuFactory } from "./menu/enterpriseMenu";
import { ContextMenuFactory } from "./menu/contextMenu";
import { MenuItemMapper } from "./menu/menuItemMapper";
import { VERSION } from "./version";
import { ChartMenuItemMapper } from "./menu/chartMenuItemMapper";

export const MenuModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.MenuModule,
    beans: [EnterpriseMenuFactory, ContextMenuFactory, MenuItemMapper, ChartMenuItemMapper],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
