import {Module, ModuleNames} from "@ag-community/grid-core";
import {AggregationStage} from "./rowGrouping/aggregationStage";
import {GroupStage} from "./rowGrouping/groupStage";
import {PivotColDefService} from "./rowGrouping/pivotColDefService";
import {PivotStage} from "./rowGrouping/pivotStage";
import {AggFuncService} from "./rowGrouping/aggFuncService";
import {GridHeaderDropZones} from "./rowGrouping/columnDropZones/gridHeaderDropZones";

export const RowGroupingModule: Module = {
    moduleName: ModuleNames.RowGroupingModule,
    beans: [AggregationStage, GroupStage, PivotColDefService, PivotStage, AggFuncService],
    agStackComponents: [
        {componentName: 'AgGridHeaderDropZones', componentClass: GridHeaderDropZones}
    ]
};

