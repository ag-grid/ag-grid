import { _ModuleSupport, _Scale } from 'ag-charts-community';
import { RadarLineSeries } from './radarLineSeries';
import { RADAR_LINE_DEFAULTS } from './radarLineDefaults';
import { RADAR_LINE_SERIES_THEME } from './radarLineThemes';

export const RadarLineModule: _ModuleSupport.SeriesModule = {
    type: 'series',
    optionsKey: 'series[]',
    packageType: 'enterprise',
    chartTypes: ['polar'],

    identifier: 'radar-line',
    instanceConstructor: RadarLineSeries,
    seriesDefaults: RADAR_LINE_DEFAULTS,
    themeTemplate: RADAR_LINE_SERIES_THEME,
};
