import type { AgColumn, BeanCollection, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class ChartColumnService extends BeanStub implements NamedBean {
    beanName: "chartColumnService";
    private columnModel;
    private showRowGroupColsService?;
    private columnNameService;
    private visibleColsService;
    private funcColsService;
    private valueService;
    private rowPositionUtils;
    wireBeans(beans: BeanCollection): void;
    private valueColsWithoutSeriesType;
    postConstruct(): void;
    getColumn(colId: string): AgColumn | null;
    getAllDisplayedColumns(): AgColumn[];
    getColDisplayName(col: AgColumn): string | null;
    getRowGroupColumns(): AgColumn[];
    getGroupDisplayColumns(): AgColumn[];
    isPivotMode(): boolean;
    isPivotActive(): boolean;
    getChartColumns(): {
        dimensionCols: Set<AgColumn>;
        valueCols: Set<AgColumn>;
    };
    private isInferredValueCol;
    private extractLeafData;
    destroy(): void;
}
