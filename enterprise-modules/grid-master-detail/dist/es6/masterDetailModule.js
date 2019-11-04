import { ModuleNames } from "@ag-grid-community/grid-core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/grid-core";
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
