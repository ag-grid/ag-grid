import { BeanStub, Column, IAggFunc, IAggregationStage, IRowModel, ValueService } from "@ag-grid-community/core";
import { ColState } from "./chartDataModel";
export interface ChartDatasourceParams {
    dimensionCols: ColState[];
    grouping: boolean;
    pivoting: boolean;
    valueCols: Column[];
    startRow: number;
    endRow: number;
    aggFunc?: string | IAggFunc;
}
interface IData {
    data: any[];
    columnNames: {
        [key: string]: string[];
    };
}
export declare class ChartDatasource extends BeanStub {
    gridRowModel: IRowModel;
    valueService: ValueService;
    private columnController;
    aggregationStage: IAggregationStage;
    getData(params: ChartDatasourceParams): IData;
    private extractRowsFromGridRowModel;
    private aggregateRowsByDimension;
    private getGroupLabels;
}
export {};
