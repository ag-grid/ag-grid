import { themes as themeFactories } from './chart/mapping/themes.mjs';
export { getChartTheme } from './chart/mapping/themes.mjs';
export { ChartTheme, EXTENDS_AXES_DEFAULTS, EXTENDS_AXES_LABEL_DEFAULTS, EXTENDS_AXES_LINE_DEFAULTS, EXTENDS_SERIES_DEFAULTS, OVERRIDE_SERIES_LABEL_DEFAULTS, DEFAULT_FONT_FAMILY, } from './chart/themes/chartTheme.mjs';
export const themes = Object.entries(themeFactories).reduce((obj, [name, factory]) => {
    obj[name] = factory();
    return obj;
}, {});
