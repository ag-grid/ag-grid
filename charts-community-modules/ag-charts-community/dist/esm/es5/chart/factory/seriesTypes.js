import { AreaSeries } from '../series/cartesian/areaSeries';
import { BarSeries, ColumnSeries } from '../series/cartesian/barSeries';
import { HistogramSeries } from '../series/cartesian/histogramSeries';
import { LineSeries } from '../series/cartesian/lineSeries';
import { ScatterSeries } from '../series/cartesian/scatterSeries';
import { PieSeries } from '../series/polar/pieSeries';
import { TreemapSeries } from '../series/hierarchy/treemapSeries';
import { registerChartSeriesType } from './chartTypes';
var BUILT_IN_SERIES_FACTORIES = {
    area: AreaSeries,
    bar: BarSeries,
    column: ColumnSeries,
    histogram: HistogramSeries,
    line: LineSeries,
    pie: PieSeries,
    scatter: ScatterSeries,
    treemap: TreemapSeries,
};
var SERIES_FACTORIES = {};
var SERIES_DEFAULTS = {};
var SERIES_THEME_TEMPLATES = {};
export function registerSeries(seriesType, chartType, cstr, defaults, theme) {
    SERIES_FACTORIES[seriesType] = cstr;
    SERIES_DEFAULTS[seriesType] = defaults;
    SERIES_THEME_TEMPLATES[seriesType] = theme;
    registerChartSeriesType(seriesType, chartType);
}
export function getSeries(chartType, moduleCtx) {
    var _a;
    var seriesConstructor = (_a = SERIES_FACTORIES[chartType]) !== null && _a !== void 0 ? _a : BUILT_IN_SERIES_FACTORIES[chartType];
    if (seriesConstructor) {
        return new seriesConstructor(moduleCtx);
    }
    throw new Error("AG Charts - unknown series type: " + chartType);
}
export function getSeriesDefaults(chartType) {
    return SERIES_DEFAULTS[chartType];
}
export function getSeriesThemeTemplate(chartType) {
    return SERIES_THEME_TEMPLATES[chartType];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWVzVHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnQvZmFjdG9yeS9zZXJpZXNUeXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDNUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUN4RSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDdEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQzVELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUNsRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDdEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ2xFLE9BQU8sRUFBYSx1QkFBdUIsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUdsRSxJQUFNLHlCQUF5QixHQUFzQztJQUNqRSxJQUFJLEVBQUUsVUFBVTtJQUNoQixHQUFHLEVBQUUsU0FBUztJQUNkLE1BQU0sRUFBRSxZQUFZO0lBQ3BCLFNBQVMsRUFBRSxlQUFlO0lBQzFCLElBQUksRUFBRSxVQUFVO0lBQ2hCLEdBQUcsRUFBRSxTQUFTO0lBQ2QsT0FBTyxFQUFFLGFBQWE7SUFDdEIsT0FBTyxFQUFFLGFBQWE7Q0FDekIsQ0FBQztBQUVGLElBQU0sZ0JBQWdCLEdBQXNDLEVBQUUsQ0FBQztBQUMvRCxJQUFNLGVBQWUsR0FBd0IsRUFBRSxDQUFDO0FBQ2hELElBQU0sc0JBQXNCLEdBQXVCLEVBQUUsQ0FBQztBQUV0RCxNQUFNLFVBQVUsY0FBYyxDQUMxQixVQUFrQixFQUNsQixTQUFvQixFQUNwQixJQUF1QixFQUN2QixRQUFZLEVBQ1osS0FBUztJQUVULGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUNwQyxlQUFlLENBQUMsVUFBVSxDQUFDLEdBQUcsUUFBUSxDQUFDO0lBQ3ZDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUUzQyx1QkFBdUIsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDbkQsQ0FBQztBQUVELE1BQU0sVUFBVSxTQUFTLENBQUMsU0FBaUIsRUFBRSxTQUF3Qjs7SUFDakUsSUFBTSxpQkFBaUIsR0FBRyxNQUFBLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxtQ0FBSSx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM5RixJQUFJLGlCQUFpQixFQUFFO1FBQ25CLE9BQU8sSUFBSSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUMzQztJQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQW9DLFNBQVcsQ0FBQyxDQUFDO0FBQ3JFLENBQUM7QUFFRCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsU0FBaUI7SUFDL0MsT0FBTyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQUVELE1BQU0sVUFBVSxzQkFBc0IsQ0FBQyxTQUFpQjtJQUNwRCxPQUFPLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzdDLENBQUMifQ==