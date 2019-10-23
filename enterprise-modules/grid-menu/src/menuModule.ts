import {Module, ModuleNames} from "@ag-community/grid-core";
import {EnterpriseCoreModule} from "@ag-enterprise/grid-core";
import {EnterpriseMenuFactory} from "./menu/enterpriseMenu";
import {ContextMenuFactory} from "./menu/contextMenu";
import {MenuItemMapper} from "./menu/menuItemMapper";

export const MenuModule: Module = {
    moduleName: ModuleNames.MenuModule,
    beans: [EnterpriseMenuFactory, ContextMenuFactory, MenuItemMapper],
    dependantModules: [
        EnterpriseCoreModule
    ]
};

