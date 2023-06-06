import { themes as themeFactories } from './chart/mapping/themes';
export { getChartTheme } from './chart/mapping/themes';
export { ChartTheme, EXTENDS_SERIES_DEFAULTS, OVERRIDE_SERIES_LABEL_DEFAULTS, DEFAULT_FONT_FAMILY, } from './chart/themes/chartTheme';
export const themes = Object.entries(themeFactories).reduce((obj, [name, factory]) => {
    obj[name] = factory();
    return obj;
}, {});
