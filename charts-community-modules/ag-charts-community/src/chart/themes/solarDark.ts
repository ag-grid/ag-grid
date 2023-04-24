import { DarkTheme } from './darkTheme';
import { AgChartThemePalette } from '../agChartOptions';

const palette: AgChartThemePalette = {
    fills: [
        '#febe76',
        '#ff7979',
        '#badc58',
        '#f9ca23',
        '#f0932b',
        '#eb4c4b',
        '#6ab04c',
        '#7ed6df',
        '#e056fd',
        '#686de0',
    ],
    strokes: [
        '#b28553',
        '#b35555',
        '#829a3e',
        '#ae8d19',
        '#a8671e',
        '#a43535',
        '#4a7b35',
        '#58969c',
        '#9d3cb1',
        '#494c9d',
    ],
};

export class SolarDark extends DarkTheme {
    protected getPalette(): AgChartThemePalette {
        return palette;
    }
}
