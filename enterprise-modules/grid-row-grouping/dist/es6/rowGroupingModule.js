import { ModuleNames } from "@ag-community/grid-core";
import { EnterpriseCoreModule } from "@ag-enterprise/grid-core";
import { AggregationStage } from "./rowGrouping/aggregationStage";
import { GroupStage } from "./rowGrouping/groupStage";
import { PivotColDefService } from "./rowGrouping/pivotColDefService";
import { PivotStage } from "./rowGrouping/pivotStage";
import { AggFuncService } from "./rowGrouping/aggFuncService";
import { GridHeaderDropZones } from "./rowGrouping/columnDropZones/gridHeaderDropZones";
export var RowGroupingModule = {
    moduleName: ModuleNames.RowGroupingModule,
    beans: [AggregationStage, GroupStage, PivotColDefService, PivotStage, AggFuncService],
    agStackComponents: [
        { componentName: 'AgGridHeaderDropZones', componentClass: GridHeaderDropZones }
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
