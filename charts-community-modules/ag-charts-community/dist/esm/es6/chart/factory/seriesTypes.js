import { AreaSeries } from '../series/cartesian/areaSeries';
import { BarSeries, ColumnSeries } from '../series/cartesian/barSeries';
import { HistogramSeries } from '../series/cartesian/histogramSeries';
import { LineSeries } from '../series/cartesian/lineSeries';
import { ScatterSeries } from '../series/cartesian/scatterSeries';
import { PieSeries } from '../series/polar/pieSeries';
import { TreemapSeries } from '../series/hierarchy/treemapSeries';
import { registerChartSeriesType } from './chartTypes';
const BUILT_IN_SERIES_FACTORIES = {
    area: AreaSeries,
    bar: BarSeries,
    column: ColumnSeries,
    histogram: HistogramSeries,
    line: LineSeries,
    pie: PieSeries,
    scatter: ScatterSeries,
    treemap: TreemapSeries,
};
const SERIES_FACTORIES = {};
const SERIES_DEFAULTS = {};
const SERIES_THEME_TEMPLATES = {};
export function registerSeries(seriesType, chartType, cstr, defaults, theme) {
    SERIES_FACTORIES[seriesType] = cstr;
    SERIES_DEFAULTS[seriesType] = defaults;
    SERIES_THEME_TEMPLATES[seriesType] = theme;
    registerChartSeriesType(seriesType, chartType);
}
export function getSeries(chartType, moduleCtx) {
    var _a;
    const seriesConstructor = (_a = SERIES_FACTORIES[chartType]) !== null && _a !== void 0 ? _a : BUILT_IN_SERIES_FACTORIES[chartType];
    if (seriesConstructor) {
        return new seriesConstructor(moduleCtx);
    }
    throw new Error(`AG Charts - unknown series type: ${chartType}`);
}
export function getSeriesDefaults(chartType) {
    return SERIES_DEFAULTS[chartType];
}
export function getSeriesThemeTemplate(chartType) {
    return SERIES_THEME_TEMPLATES[chartType];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWVzVHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnQvZmFjdG9yeS9zZXJpZXNUeXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDNUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUN4RSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDdEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQzVELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUNsRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDdEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ2xFLE9BQU8sRUFBYSx1QkFBdUIsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUdsRSxNQUFNLHlCQUF5QixHQUFzQztJQUNqRSxJQUFJLEVBQUUsVUFBVTtJQUNoQixHQUFHLEVBQUUsU0FBUztJQUNkLE1BQU0sRUFBRSxZQUFZO0lBQ3BCLFNBQVMsRUFBRSxlQUFlO0lBQzFCLElBQUksRUFBRSxVQUFVO0lBQ2hCLEdBQUcsRUFBRSxTQUFTO0lBQ2QsT0FBTyxFQUFFLGFBQWE7SUFDdEIsT0FBTyxFQUFFLGFBQWE7Q0FDekIsQ0FBQztBQUVGLE1BQU0sZ0JBQWdCLEdBQXNDLEVBQUUsQ0FBQztBQUMvRCxNQUFNLGVBQWUsR0FBd0IsRUFBRSxDQUFDO0FBQ2hELE1BQU0sc0JBQXNCLEdBQXVCLEVBQUUsQ0FBQztBQUV0RCxNQUFNLFVBQVUsY0FBYyxDQUMxQixVQUFrQixFQUNsQixTQUFvQixFQUNwQixJQUF1QixFQUN2QixRQUFZLEVBQ1osS0FBUztJQUVULGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUNwQyxlQUFlLENBQUMsVUFBVSxDQUFDLEdBQUcsUUFBUSxDQUFDO0lBQ3ZDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUUzQyx1QkFBdUIsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDbkQsQ0FBQztBQUVELE1BQU0sVUFBVSxTQUFTLENBQUMsU0FBaUIsRUFBRSxTQUF3Qjs7SUFDakUsTUFBTSxpQkFBaUIsR0FBRyxNQUFBLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxtQ0FBSSx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM5RixJQUFJLGlCQUFpQixFQUFFO1FBQ25CLE9BQU8sSUFBSSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUMzQztJQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsb0NBQW9DLFNBQVMsRUFBRSxDQUFDLENBQUM7QUFDckUsQ0FBQztBQUVELE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxTQUFpQjtJQUMvQyxPQUFPLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBRUQsTUFBTSxVQUFVLHNCQUFzQixDQUFDLFNBQWlCO0lBQ3BELE9BQU8sc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDN0MsQ0FBQyJ9