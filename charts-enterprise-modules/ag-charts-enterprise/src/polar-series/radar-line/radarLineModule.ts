import type { _ModuleSupport } from 'ag-charts-community';
import { _Scale } from 'ag-charts-community';
import { RadarLineSeries } from './radarLineSeries';
import { RADAR_DEFAULTS } from '../radar/radarDefaults';
import { RADAR_LINE_SERIES_THEME } from './radarLineThemes';

export const RadarLineModule: _ModuleSupport.SeriesModule = {
    type: 'series',
    optionsKey: 'series[]',
    packageType: 'enterprise',
    chartTypes: ['polar'],

    identifier: 'radar-line',
    instanceConstructor: RadarLineSeries,
    seriesDefaults: RADAR_DEFAULTS,
    themeTemplate: RADAR_LINE_SERIES_THEME,
    paletteFactory: ({ takeColors }) => {
        const {
            fills: [fill],
            strokes: [stroke],
        } = takeColors(1);
        return {
            stroke: fill,
            marker: { fill, stroke },
        };
    },
};
