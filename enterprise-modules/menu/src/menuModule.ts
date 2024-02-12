import { Module, ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { EnterpriseMenuFactory } from "./menu/enterpriseMenu";
import { ContextMenuFactory } from "./menu/contextMenu";
import { MenuItemMapper } from "./menu/menuItemMapper";
import { VERSION } from "./version";
import { ChartMenuItemMapper } from "./menu/chartMenuItemMapper";
import { ColumnChooserFactory } from "./menu/columnChooserFactory";
import { ColumnMenuFactory } from "./menu/columnMenuFactory";
import { MenuUtils } from "./menu/menuUtils";

export const MenuModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.MenuModule,
    beans: [EnterpriseMenuFactory, ContextMenuFactory, MenuItemMapper, ChartMenuItemMapper, ColumnChooserFactory, ColumnMenuFactory, MenuUtils],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
