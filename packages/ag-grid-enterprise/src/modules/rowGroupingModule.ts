import {Grid, Module, ModuleNames} from "ag-grid-community";
import {AggregationStage} from "./rowGrouping/aggregationStage";
import {GroupStage} from "./rowGrouping/groupStage";
import {PivotColDefService} from "./rowGrouping/pivotColDefService";
import {PivotStage} from "./rowGrouping/pivotStage";
import {AggFuncService} from "./rowGrouping/aggFuncService";

export const RowGroupingModule: Module = {
    moduleName: ModuleNames.RowGroupingModule,
    beans: [AggregationStage, GroupStage, PivotColDefService, PivotStage, AggFuncService]
};

Grid.addModule([RowGroupingModule]);
