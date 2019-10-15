import {Module, ModuleNames, ModuleRegistry} from "ag-grid-community";
import {RichSelectCellEditor} from "./richSelect/richSelectCellEditor";

export const RichSelectModule: Module = {
    moduleName: ModuleNames.RichSelectModule,
    beans: [ ],
    userComponents: [
        {componentName: 'agRichSelect', componentClass: RichSelectCellEditor},
        {componentName: 'agRichSelectCellEditor', componentClass: RichSelectCellEditor}
    ]
};

ModuleRegistry.register(RichSelectModule);
