import { _ModuleSupport, _Scale } from 'ag-charts-community';
import { WaterfallSeries } from './waterfallSeries';
import { WATERFALL_COLUMN_DEFAULTS } from './waterfallDefaults';
import { WATERFALL_SERIES_THEME } from './waterfallThemes';

export const WaterfallColumnModule: _ModuleSupport.SeriesModule = {
    type: 'series',
    optionsKey: 'series[]',
    packageType: 'enterprise',
    chartTypes: ['cartesian'],

    identifier: 'waterfall-column',
    instanceConstructor: WaterfallSeries,
    seriesDefaults: WATERFALL_COLUMN_DEFAULTS,
    themeTemplate: WATERFALL_SERIES_THEME,
};
