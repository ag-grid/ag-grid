import { ChartTheme } from '../themes/chartTheme.mjs';
import { DarkTheme } from '../themes/darkTheme.mjs';
import { MaterialLight } from '../themes/materialLight.mjs';
import { MaterialDark } from '../themes/materialDark.mjs';
import { PastelLight } from '../themes/pastelLight.mjs';
import { PastelDark } from '../themes/pastelDark.mjs';
import { SolarLight } from '../themes/solarLight.mjs';
import { SolarDark } from '../themes/solarDark.mjs';
import { VividLight } from '../themes/vividLight.mjs';
import { VividDark } from '../themes/vividDark.mjs';
import { jsonMerge } from '../../util/json.mjs';
const lightTheme = () => new ChartTheme();
const darkTheme = () => new DarkTheme();
const lightThemes = {
    undefined: lightTheme,
    null: lightTheme,
    'ag-default': lightTheme,
    'ag-material': () => new MaterialLight(),
    'ag-pastel': () => new PastelLight(),
    'ag-solar': () => new SolarLight(),
    'ag-vivid': () => new VividLight(),
};
const darkThemes = {
    undefined: darkTheme,
    null: darkTheme,
    'ag-default-dark': darkTheme,
    'ag-material-dark': () => new MaterialDark(),
    'ag-pastel-dark': () => new PastelDark(),
    'ag-solar-dark': () => new SolarDark(),
    'ag-vivid-dark': () => new VividDark(),
};
export const themes = Object.assign(Object.assign({}, darkThemes), lightThemes);
export function getChartTheme(value) {
    var _a;
    if (value instanceof ChartTheme) {
        return value;
    }
    const stockTheme = themes[value];
    if (stockTheme) {
        return stockTheme();
    }
    value = value;
    // Flatten recursive themes.
    const overrides = [];
    let palette;
    while (typeof value === 'object') {
        overrides.push((_a = value.overrides) !== null && _a !== void 0 ? _a : {});
        // Use first palette found, they can't be merged.
        if (value.palette && palette == null) {
            palette = value.palette;
        }
        value = value.baseTheme;
    }
    overrides.reverse();
    const flattenedTheme = Object.assign({ baseTheme: value, overrides: jsonMerge(overrides) }, (palette ? { palette } : {}));
    if (flattenedTheme.baseTheme || flattenedTheme.overrides) {
        const baseTheme = getChartTheme(flattenedTheme.baseTheme);
        return new baseTheme.constructor(flattenedTheme);
    }
    return lightTheme();
}
