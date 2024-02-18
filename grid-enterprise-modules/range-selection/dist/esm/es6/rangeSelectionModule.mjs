import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { RangeService } from "./rangeSelection/rangeService.mjs";
import { FillHandle } from "./rangeSelection/fillHandle.mjs";
import { RangeHandle } from "./rangeSelection/rangeHandle.mjs";
import { SelectionHandleFactory } from "./rangeSelection/selectionHandleFactory.mjs";
import { VERSION } from "./version.mjs";
export const RangeSelectionModule = {
    version: VERSION,
    moduleName: ModuleNames.RangeSelectionModule,
    beans: [RangeService, SelectionHandleFactory],
    agStackComponents: [
        { componentName: 'AgFillHandle', componentClass: FillHandle },
        { componentName: 'AgRangeHandle', componentClass: RangeHandle }
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
