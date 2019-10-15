import {Module, ModuleNames, ModuleRegistry} from "ag-grid-community";
import {RangeController} from "./rangeSelection/rangeController";
import {FillHandle} from "./rangeSelection/fillHandle";
import {RangeHandle} from "./rangeSelection/rangeHandle";

export const RangeSelectionModule: Module = {
    moduleName: ModuleNames.RangeSelectionModule,
    beans: [RangeController],
    agStackComponents: [
        {componentName: 'AgFillHandle', componentClass: FillHandle},
        {componentName: 'AgRangeHandle', componentClass: RangeHandle}
    ]
};

ModuleRegistry.register(RangeSelectionModule);
