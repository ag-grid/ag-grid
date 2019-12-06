import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { RichSelectCellEditor } from "./richSelect/richSelectCellEditor";
export var RichSelectModule = {
    moduleName: ModuleNames.RichSelectModule,
    beans: [],
    userComponents: [
        { componentName: 'agRichSelect', componentClass: RichSelectCellEditor },
        { componentName: 'agRichSelectCellEditor', componentClass: RichSelectCellEditor }
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
