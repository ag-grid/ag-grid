import type { AgColumn, BeanCollection, IAggFunc, PartialCellRange } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import type { ColState } from '../model/chartDataModel';
export interface ChartDatasourceParams {
    dimensionCols: ColState[];
    grouping: boolean;
    pivoting: boolean;
    crossFiltering: boolean;
    valueCols: AgColumn[];
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
    private gridRowModel;
    private pivotResultColsService;
    private valueService;
    private columnModel;
    private rowNodeSorter;
    private sortController;
    private aggregationStage?;
    wireBeans(beans: BeanCollection): void;
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
