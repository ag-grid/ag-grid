import { themes as themeFactories } from './chart/mapping/themes';
export { getChartTheme } from './chart/mapping/themes';
export { ChartTheme } from './chart/themes/chartTheme';
export const themes = Object.entries(themeFactories).reduce((obj, [name, factory]) => {
    obj[name] = factory();
    return obj;
}, {});
