import {Module, ModuleNames} from "@ag-grid-community/grid-core";
import {EnterpriseCoreModule} from "@ag-grid-enterprise/grid-core";
import {RichSelectCellEditor} from "./richSelect/richSelectCellEditor";

export const RichSelectModule: Module = {
    moduleName: ModuleNames.RichSelectModule,
    beans: [],
    userComponents: [
        {componentName: 'agRichSelect', componentClass: RichSelectCellEditor},
        {componentName: 'agRichSelectCellEditor', componentClass: RichSelectCellEditor}
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};

