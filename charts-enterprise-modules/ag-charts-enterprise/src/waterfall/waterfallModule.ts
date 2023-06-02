import { _ModuleSupport, _Scale } from 'ag-charts-community';
import { WaterfallColumnSeries, WaterfallBarSeries } from './waterfallSeries';
import { WATERFALL_COLUMN_DEFAULTS, WATERFALL_BAR_DEFAULTS } from './waterfallDefaults';
import { WATERFALL_SERIES_THEME } from './waterfallThemes';

export const WaterfallColumnModule: _ModuleSupport.SeriesModule = {
    type: 'series',
    optionsKey: 'series[]',
    packageType: 'enterprise',
    chartTypes: ['cartesian'],

    identifier: 'waterfall-column',
    instanceConstructor: WaterfallColumnSeries,
    seriesDefaults: WATERFALL_COLUMN_DEFAULTS,
    themeTemplate: WATERFALL_SERIES_THEME,
};

export const WaterfallBarModule: _ModuleSupport.SeriesModule = {
    type: 'series',
    optionsKey: 'series[]',
    packageType: 'enterprise',
    chartTypes: ['cartesian'],

    identifier: 'waterfall-bar',
    instanceConstructor: WaterfallBarSeries,
    seriesDefaults: WATERFALL_BAR_DEFAULTS,
    themeTemplate: WATERFALL_SERIES_THEME,
};
