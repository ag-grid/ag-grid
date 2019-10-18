import {Module, ModuleNames} from "@ag-community/grid-core";
import {SetFilter} from "./setFilter/setFilter";
import {SetFloatingFilterComp} from "./setFilter/setFloatingFilter";

export const SetFilterModule: Module = {
    moduleName: ModuleNames.SetFilterModule,
    beans: [],
    userComponents: [
        {componentName: 'agSetColumnFilter', componentClass: SetFilter},
        {componentName: 'agSetColumnFloatingFilter', componentClass: SetFloatingFilterComp},
    ]
};

