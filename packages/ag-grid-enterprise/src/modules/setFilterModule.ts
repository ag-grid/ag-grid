import {Grid, Module, ModuleNames} from "ag-grid-community";
import {SetFilter} from "./setFilter/setFilter";
import {SetFloatingFilterComp} from "./setFilter/setFloatingFilter";

export const SetFilterModule: Module = {
    moduleName: ModuleNames.SetFilterModule,
    beans: [ ],
    userComponents: [
        {componentName: 'agSetColumnFilter', componentClass: SetFilter},
        {componentName: 'agSetColumnFloatingFilter', componentClass: SetFloatingFilterComp},
    ]
};

Grid.addModule([SetFilterModule]);
