import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { AggregationStage } from "./rowGrouping/aggregationStage.mjs";
import { GroupStage } from "./rowGrouping/groupStage.mjs";
import { PivotColDefService } from "./rowGrouping/pivotColDefService.mjs";
import { PivotStage } from "./rowGrouping/pivotStage.mjs";
import { AggFuncService } from "./rowGrouping/aggFuncService.mjs";
import { GridHeaderDropZones } from "./rowGrouping/columnDropZones/gridHeaderDropZones.mjs";
import { FilterAggregatesStage } from "./rowGrouping/filterAggregatesStage.mjs";
import { VERSION } from "./version.mjs";
import { GroupFilter } from "./rowGrouping/groupFilter/groupFilter.mjs";
import { GroupFloatingFilterComp } from "./rowGrouping/groupFilter/groupFloatingFilter.mjs";
export const RowGroupingModule = {
    version: VERSION,
    moduleName: ModuleNames.RowGroupingModule,
    beans: [AggregationStage, FilterAggregatesStage, GroupStage, PivotColDefService, PivotStage, AggFuncService],
    agStackComponents: [
        { componentName: 'AgGridHeaderDropZones', componentClass: GridHeaderDropZones }
    ],
    userComponents: [
        { componentName: 'agGroupColumnFilter', componentClass: GroupFilter },
        { componentName: 'agGroupColumnFloatingFilter', componentClass: GroupFloatingFilterComp },
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
