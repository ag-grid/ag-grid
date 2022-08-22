export declare type ChartType = 'column' | 'groupedColumn' | 'stackedColumn' | 'normalizedColumn' | 'bar' | 'groupedBar' | 'stackedBar' | 'normalizedBar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'area' | 'stackedArea' | 'normalizedArea' | 'histogram' | 'columnLineCombo' | 'areaColumnCombo' | 'customCombo';
export declare type CrossFilterChartType = 'column' | 'bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'area';
export declare type ChartMenuOptions = 'chartSettings' | 'chartData' | 'chartFormat' | 'chartLink' | 'chartUnlink' | 'chartDownload';
export interface SeriesChartType {
    colId: string;
    chartType: ChartType;
    secondaryAxis?: boolean;
}
