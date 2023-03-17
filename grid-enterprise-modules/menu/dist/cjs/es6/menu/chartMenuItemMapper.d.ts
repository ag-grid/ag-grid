import { BeanStub, MenuItemDef } from '@ag-grid-community/core';
export declare class ChartMenuItemMapper extends BeanStub {
    private readonly chartService;
    getChartItems(key: 'pivotChart' | 'chartRange'): MenuItemDef | undefined;
    private cleanInternals;
    private static buildLookup;
    /**
     * Make the MenuItem match the charts provided and their ordering on the ChartGroupsDef config object as provided by the user.
     */
    private static filterAndOrderChartMenu;
}
export declare type PivotMenuOptionName = 'pivotChart' | 'pivotColumnChart' | 'pivotGroupedColumn' | 'pivotStackedColumn' | 'pivotNormalizedColumn' | 'pivotBarChart' | 'pivotGroupedBar' | 'pivotStackedBar' | 'pivotNormalizedBar' | 'pivotPieChart' | 'pivotPie' | 'pivotDoughnut' | 'pivotLineChart' | 'pivotXYChart' | 'pivotScatter' | 'pivotBubble' | 'pivotAreaChart' | 'pivotArea' | 'pivotStackedArea' | 'pivotNormalizedArea' | 'pivotHistogramChart' | 'pivotCombinationChart' | 'pivotColumnLineCombo' | 'pivotAreaColumnCombo';
export declare type RangeMenuOptionName = 'chartRange' | 'rangeColumnChart' | 'rangeGroupedColumn' | 'rangeStackedColumn' | 'rangeNormalizedColumn' | 'rangeBarChart' | 'rangeGroupedBar' | 'rangeStackedBar' | 'rangeNormalizedBar' | 'rangePieChart' | 'rangePie' | 'rangeDoughnut' | 'rangeLineChart' | 'rangeXYChart' | 'rangeScatter' | 'rangeBubble' | 'rangeAreaChart' | 'rangeArea' | 'rangeStackedArea' | 'rangeNormalizedArea' | 'rangeHistogramChart' | 'rangeCombinationChart' | 'rangeColumnLineCombo' | 'rangeAreaColumnCombo';
