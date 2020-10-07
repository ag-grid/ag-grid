import { BeanStub, Column, IAggFunc } from "@ag-grid-community/core";
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
    private readonly gridRowModel;
    private readonly valueService;
    private readonly columnController;
    private readonly gridOptionsWrapper;
    private readonly aggregationStage;
    getData(params: ChartDatasourceParams): IData;
    private extractRowsFromGridRowModel;
    private aggregateRowsByDimension;
    private updatePivotKeysForSSRM;
    private extractPivotKeySeparator;
    private static getGroupLabels;
}
export {};
