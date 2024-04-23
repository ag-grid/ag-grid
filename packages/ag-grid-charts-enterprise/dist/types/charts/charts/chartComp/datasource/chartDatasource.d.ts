import { BeanStub, Column, IAggFunc, PartialCellRange } from "ag-grid-community";
import { ColState } from "../model/chartDataModel";
export interface ChartDatasourceParams {
    dimensionCols: ColState[];
    grouping: boolean;
    pivoting: boolean;
    crossFiltering: boolean;
    valueCols: Column[];
    startRow: number;
    endRow: number;
    isScatter: boolean;
    aggFunc?: string | IAggFunc;
    referenceCellRange?: PartialCellRange;
}
interface IData {
    chartData: any[];
    columnNames: {
        [key: string]: string[];
    };
    groupChartData?: any[];
}
export declare class ChartDatasource extends BeanStub {
    private readonly gridRowModel;
    private readonly valueService;
    private readonly columnModel;
    private readonly rowNodeSorter;
    private sortController;
    private readonly aggregationStage?;
    getData(params: ChartDatasourceParams): IData;
    private extractRowsFromGridRowModel;
    private aggregateRowsByDimension;
    private updatePivotKeysForSSRM;
    private extractPivotKeySeparator;
    private static getGroupLabels;
    private getFilteredRowNodes;
    private getAllRowNodes;
    private sortRowNodes;
}
export {};
