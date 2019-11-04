import {Module, ModuleNames} from "@ag-grid-community/grid-core";
import {EnterpriseCoreModule} from "@ag-grid-enterprise/grid-core";
import {RangeController} from "./rangeSelection/rangeController";
import {FillHandle} from "./rangeSelection/fillHandle";
import {RangeHandle} from "./rangeSelection/rangeHandle";

export const RangeSelectionModule: Module = {
    moduleName: ModuleNames.RangeSelectionModule,
    beans: [RangeController],
    agStackComponents: [
        {componentName: 'AgFillHandle', componentClass: FillHandle},
        {componentName: 'AgRangeHandle', componentClass: RangeHandle}
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};

