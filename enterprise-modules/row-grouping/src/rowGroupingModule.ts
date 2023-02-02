import { Module, ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { AggregationStage } from "./rowGrouping/aggregationStage";
import { GroupStage } from "./rowGrouping/groupStage";
import { PivotColDefService } from "./rowGrouping/pivotColDefService";
import { PivotStage } from "./rowGrouping/pivotStage";
import { AggFuncService } from "./rowGrouping/aggFuncService";
import { GridHeaderDropZones } from "./rowGrouping/columnDropZones/gridHeaderDropZones";
import { FilterAggregatesStage } from "./rowGrouping/filterAggregatesStage";
import { VERSION } from "./version";
import { GroupFilter } from "./rowGrouping/groupFilter/groupFilter";

export const RowGroupingModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.RowGroupingModule,
    beans: [AggregationStage, FilterAggregatesStage, GroupStage, PivotColDefService, PivotStage, AggFuncService],
    agStackComponents: [
        { componentName: 'AgGridHeaderDropZones', componentClass: GridHeaderDropZones }
    ],
    userComponents: [
        { componentName: 'agGroupColumnFilter', componentClass: GroupFilter },
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
