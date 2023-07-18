import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { DetailCellRenderer } from "./masterDetail/detailCellRenderer.mjs";
import { DetailCellRendererCtrl } from "./masterDetail/detailCellRendererCtrl.mjs";
import { VERSION } from "./version.mjs";
export const MasterDetailModule = {
    version: VERSION,
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
