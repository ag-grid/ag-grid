import type { IAggFunc } from '../entities/colDef';
export interface IAggregationStage {
    aggregateValues(values: any[], aggFuncOrString: string | IAggFunc): any;
}
