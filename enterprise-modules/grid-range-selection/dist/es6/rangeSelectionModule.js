import { ModuleNames } from "@ag-community/grid-core";
import { EnterpriseCoreModule } from "@ag-enterprise/grid-core";
import { RangeController } from "./rangeSelection/rangeController";
import { FillHandle } from "./rangeSelection/fillHandle";
import { RangeHandle } from "./rangeSelection/rangeHandle";
export var RangeSelectionModule = {
    moduleName: ModuleNames.RangeSelectionModule,
    beans: [RangeController],
    agStackComponents: [
        { componentName: 'AgFillHandle', componentClass: FillHandle },
        { componentName: 'AgRangeHandle', componentClass: RangeHandle }
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
