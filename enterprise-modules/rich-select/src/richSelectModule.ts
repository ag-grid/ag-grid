import {Module, ModuleNames} from "@ag-community/grid-core";
import {EnterpriseCoreModule} from "@ag-enterprise/grid-core";
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

