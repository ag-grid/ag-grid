var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { themes as themeFactories } from './chart/mapping/themes';
export { getChartTheme } from './chart/mapping/themes';
export { ChartTheme, EXTENDS_SERIES_DEFAULTS, OVERRIDE_SERIES_LABEL_DEFAULTS, DEFAULT_FONT_FAMILY, } from './chart/themes/chartTheme';
export var themes = Object.entries(themeFactories).reduce(function (obj, _a) {
    var _b = __read(_a, 2), name = _b[0], factory = _b[1];
    obj[name] = factory();
    return obj;
}, {});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZWdyYXRlZC1jaGFydHMtdGhlbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW50ZWdyYXRlZC1jaGFydHMtdGhlbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxNQUFNLElBQUksY0FBYyxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFHbEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFDSCxVQUFVLEVBQ1YsdUJBQXVCLEVBQ3ZCLDhCQUE4QixFQUM5QixtQkFBbUIsR0FDdEIsTUFBTSwyQkFBMkIsQ0FBQztBQUVuQyxNQUFNLENBQUMsSUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxHQUFHLEVBQUUsRUFBZTtRQUFmLEtBQUEsYUFBZSxFQUFkLElBQUksUUFBQSxFQUFFLE9BQU8sUUFBQTtJQUM1RSxHQUFHLENBQUMsSUFBbUMsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDO0lBQ3JELE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQyxFQUFFLEVBQXlELENBQUMsQ0FBQyJ9