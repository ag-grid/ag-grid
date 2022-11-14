import { ChartTheme } from '../themes/chartTheme';
import { DarkTheme } from '../themes/darkTheme';
import { MaterialLight } from '../themes/materialLight';
import { MaterialDark } from '../themes/materialDark';
import { PastelLight } from '../themes/pastelLight';
import { PastelDark } from '../themes/pastelDark';
import { SolarLight } from '../themes/solarLight';
import { SolarDark } from '../themes/solarDark';
import { VividLight } from '../themes/vividLight';
import { VividDark } from '../themes/vividDark';
import { AgChartTheme, AgChartThemeName } from '../agChartOptions';

type ThemeMap = { [key in AgChartThemeName | 'undefined' | 'null']?: ChartTheme };

const lightTheme = new ChartTheme();
const darkTheme = new DarkTheme();

const lightThemes: ThemeMap = {
    undefined: lightTheme,
    null: lightTheme,
    'ag-default': lightTheme,
    'ag-material': new MaterialLight(),
    'ag-pastel': new PastelLight(),
    'ag-solar': new SolarLight(),
    'ag-vivid': new VividLight(),
};

const darkThemes: ThemeMap = {
    undefined: darkTheme,
    null: darkTheme,
    'ag-default-dark': darkTheme,
    'ag-material-dark': new MaterialDark(),
    'ag-pastel-dark': new PastelDark(),
    'ag-solar-dark': new SolarDark(),
    'ag-vivid-dark': new VividDark(),
};

export const themes: ThemeMap = {
    ...darkThemes,
    ...lightThemes,
};

export function getChartTheme(value?: string | ChartTheme | AgChartTheme): ChartTheme {
    if (value instanceof ChartTheme) {
        return value;
    }

    const stockTheme = themes[value as AgChartThemeName];
    if (stockTheme) {
        return stockTheme;
    }

    value = value as AgChartTheme;

    if (value.baseTheme || value.overrides || value.palette) {
        const baseTheme: any = getChartTheme(value.baseTheme);

        return new baseTheme.constructor(value);
    }

    return lightTheme;
}
