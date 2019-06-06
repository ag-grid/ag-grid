// ag-grid-enterprise v21.0.1
import { BeanStub, Column, IRowModel, ValueService } from "ag-grid-community";
import { AggregationStage } from "../../rowStages/aggregationStage";
export interface ChartDatasourceParams {
    dimensionColIds: string[];
    valueCols: Column[];
    startRow: number;
    endRow: number;
    aggregate: boolean;
}
export declare class ChartDatasource extends BeanStub {
    gridRowModel: IRowModel;
    valueService: ValueService;
    aggregationStage: AggregationStage;
    private columnController;
    getData(params: ChartDatasourceParams): any[];
    private extractRowsFromGridRowModel;
    private aggregateRowsByDimension;
}
