// Type definitions for @ag-grid-community/core v29.1.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IAggFunc } from "../entities/colDef";
export interface IAggregationStage {
    aggregateValues(values: any[], aggFuncOrString: string | IAggFunc): any;
}
