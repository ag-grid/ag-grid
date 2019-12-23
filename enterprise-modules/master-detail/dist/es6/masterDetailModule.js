import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { DetailCellRenderer } from "./masterDetail/detailCellRenderer";
export var MasterDetailModule = {
    moduleName: ModuleNames.MasterDetailModule,
    beans: [],
    userComponents: [
        { componentName: 'agDetailCellRenderer', componentClass: DetailCellRenderer }
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
