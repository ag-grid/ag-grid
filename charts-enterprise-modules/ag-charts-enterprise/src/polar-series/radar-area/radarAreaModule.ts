import type { _ModuleSupport } from 'ag-charts-community';
import { _Scale } from 'ag-charts-community';
import { RadarAreaSeries } from './radarAreaSeries';
import { RADAR_DEFAULTS } from '../radar/radarDefaults';
import { RADAR_AREA_SERIES_THEME } from './radarAreaThemes';

export const RadarAreaModule: _ModuleSupport.SeriesModule = {
    type: 'series',
    optionsKey: 'series[]',
    packageType: 'enterprise',
    chartTypes: ['polar'],

    identifier: 'radar-area',
    instanceConstructor: RadarAreaSeries,
    seriesDefaults: RADAR_DEFAULTS,
    themeTemplate: RADAR_AREA_SERIES_THEME,
    paletteFactory: ({ takeColors }) => {
        const {
            fills: [fill],
            strokes: [stroke],
        } = takeColors(1);
        return {
            fill,
            stroke,
        };
    },
};
