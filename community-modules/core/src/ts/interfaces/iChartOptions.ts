export type ChartType =
      'column'
    | 'groupedColumn'
    | 'stackedColumn'
    | 'normalizedColumn'
    | 'bar'
    | 'groupedBar'
    | 'stackedBar'
    | 'normalizedBar'
    | 'line'
    | 'scatter'
    | 'bubble'
    | 'pie'
    | 'doughnut'
    | 'area'
    | 'stackedArea'
    | 'normalizedArea'
    | 'histogram'
    | 'columnLineCombo'
    | 'areaColumnCombo'
    | 'customCombo'

export type ChartMenuOptions =
      'chartSettings'
    | 'chartData'
    | 'chartFormat'
    | 'chartLink'
    | 'chartUnlink'
    | 'chartDownload';

export interface SeriesChartType {
    colId: string;
    chartType: ChartType;
    secondaryAxis?: boolean;
}