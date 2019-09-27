// ag-grid-enterprise v21.2.2
import { BeanStub, Column, IAggFunc, IRowModel, ValueService } from "ag-grid-community";
import { AggregationStage } from "../../rowStages/aggregationStage";
import { ColState } from "./chartModel";
export interface ChartDatasourceParams {
    dimensionCols: ColState[];
    grouping: boolean;
    pivoting: boolean;
    valueCols: Column[];
    startRow: number;
    endRow: number;
    aggFunc?: string | IAggFunc;
    multiCategories: boolean;
}
export declare class ChartDatasource extends BeanStub {
    gridRowModel: IRowModel;
    valueService: ValueService;
    aggregationStage: AggregationStage;
    private columnController;
    getData(params: ChartDatasourceParams): {
        data: any[];
        columnNames: {
            [key: string]: string[];
        };
    };
    private extractRowsFromGridRowModel;
    private aggregateRowsByDimension;
    private getGroupLabels;
}
