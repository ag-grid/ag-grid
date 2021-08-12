import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { DetailCellRenderer } from "./masterDetail/detailCellRenderer";
import { DetailCellRendererCtrl } from "./masterDetail/detailCellRendererCtrl";
export var MasterDetailModule = {
    moduleName: ModuleNames.MasterDetailModule,
    beans: [],
    userComponents: [
        { componentName: 'agDetailCellRenderer', componentClass: DetailCellRenderer }
    ],
    controllers: [
        { controllerName: 'detailCellRenderer', controllerClass: DetailCellRendererCtrl }
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
