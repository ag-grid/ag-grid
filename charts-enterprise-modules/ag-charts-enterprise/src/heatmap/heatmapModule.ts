import { _ModuleSupport, _Scale } from 'ag-charts-community';
import { HeatmapSeries } from './heatmapSeries';
import { HEATMAP_DEFAULTS } from './heatmapDefaults';
import { HEATMAP_SERIES_THEME } from './heatmapThemes';

export const HeatmapModule: _ModuleSupport.SeriesModule = {
    type: 'series',
    optionsKey: 'series[]',
    packageType: 'enterprise',
    chartTypes: ['cartesian'],

    identifier: 'heatmap',
    instanceConstructor: HeatmapSeries,
    seriesDefaults: HEATMAP_DEFAULTS,
    themeTemplate: HEATMAP_SERIES_THEME,
};
