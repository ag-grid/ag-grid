var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var lightTheme = new ChartTheme();
var darkTheme = new DarkTheme();
export var lightThemes = {
    undefined: lightTheme,
    null: lightTheme,
    'ag-default': lightTheme,
    'ag-material': new MaterialLight(),
    'ag-pastel': new PastelLight(),
    'ag-solar': new SolarLight(),
    'ag-vivid': new VividLight(),
};
export var darkThemes = {
    undefined: darkTheme,
    null: darkTheme,
    'ag-default-dark': darkTheme,
    'ag-material-dark': new MaterialDark(),
    'ag-pastel-dark': new PastelDark(),
    'ag-solar-dark': new SolarDark(),
    'ag-vivid-dark': new VividDark(),
};
export var themes = __assign(__assign({}, darkThemes), lightThemes);
export function getChartTheme(value) {
    if (value instanceof ChartTheme) {
        return value;
    }
    var stockTheme = themes[value];
    if (stockTheme) {
        return stockTheme;
    }
    value = value;
    if (value.baseTheme || value.overrides || value.palette) {
        var baseTheme = getChartTheme(value.baseTheme);
        return new baseTheme.constructor(value);
    }
    return lightTheme;
}
export function getIntegratedChartTheme(value) {
    var theme = getChartTheme(value);
    var themeConfig = theme.config;
    for (var chartType in themeConfig) {
        var axes = themeConfig[chartType].axes;
        for (var axis in axes) {
            delete axes[axis].crossLines;
        }
    }
    return theme;
}
