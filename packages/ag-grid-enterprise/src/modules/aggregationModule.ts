import {Grid, Module, ModuleNames} from "ag-grid-community";
import {AggregationStage} from "./aggregation/aggregationStage";
import {GroupStage} from "./aggregation/groupStage";
import {PivotColDefService} from "./aggregation/pivotColDefService";
import {PivotStage} from "./aggregation/pivotStage";
import {AggFuncService} from "./aggregation/aggFuncService";

export const AggregationModule: Module = {
    moduleName: ModuleNames.AggregationModule,
    beans: [AggregationStage, GroupStage, PivotColDefService, PivotStage, AggFuncService]
};

Grid.addModule([AggregationModule]);
