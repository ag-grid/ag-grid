import { DarkTheme } from './darkTheme';
import { AgChartThemePalette } from '../agChartOptions';

const palette: AgChartThemePalette = {
    fills: [
        '#f44336',
        '#e91e63',
        '#9c27b0',
        '#673ab7',
        '#3f51b5',
        '#2196f3',
        '#03a9f4',
        '#00bcd4',
        '#009688',
        '#4caf50',
        '#8bc34a',
        '#cddc39',
        '#ffeb3b',
        '#ffc107',
        '#ff9800',
        '#ff5722',
    ],
    strokes: [
        '#ab2f26',
        '#a31545',
        '#6d1b7b',
        '#482980',
        '#2c397f',
        '#1769aa',
        '#0276ab',
        '#008494',
        '#00695f',
        '#357a38',
        '#618834',
        '#909a28',
        '#b3a429',
        '#b38705',
        '#b36a00',
        '#b33d18',
    ],
};

export class MaterialDark extends DarkTheme {
    protected getPalette(): AgChartThemePalette {
        return palette;
    }
}
