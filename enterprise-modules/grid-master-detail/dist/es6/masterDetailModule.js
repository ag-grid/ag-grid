import { ModuleNames } from "@ag-community/grid-core";
import { EnterpriseCoreModule } from "@ag-enterprise/grid-core";
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
