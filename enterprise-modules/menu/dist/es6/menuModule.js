import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { EnterpriseMenuFactory } from "./menu/enterpriseMenu";
import { ContextMenuFactory } from "./menu/contextMenu";
import { MenuItemMapper } from "./menu/menuItemMapper";
export var MenuModule = {
    moduleName: ModuleNames.MenuModule,
    beans: [EnterpriseMenuFactory, ContextMenuFactory, MenuItemMapper],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
