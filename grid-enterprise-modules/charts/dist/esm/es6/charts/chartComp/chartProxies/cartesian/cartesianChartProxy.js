import { ChartProxy } from "../chartProxy";
import { AgChart, } from "ag-charts-community";
export class CartesianChartProxy extends ChartProxy {
    constructor(params) {
        super(params);
        this.crossFilteringAllPoints = new Set();
        this.crossFilteringSelectedPoints = [];
    }
    update(params) {
        const axes = this.getAxes(params);
        const options = Object.assign(Object.assign({}, this.getCommonChartOptions(params.updatedOverrides)), { data: this.getData(params, axes), axes, series: this.getSeries(params) });
        AgChart.update(this.getChartRef(), options);
    }
    getData(params, axes) {
        var _a;
        const supportsCrossFiltering = ['area', 'line'].includes(this.standaloneChartType);
        const xPosition = this.standaloneChartType === 'bar' ? 'left' : 'bottom';
        const xAxisIsCategory = ((_a = axes.find(o => o.position === xPosition)) === null || _a === void 0 ? void 0 : _a.type) === 'category';
        return this.crossFiltering && supportsCrossFiltering ?
            this.getCrossFilterData(params) :
            this.getDataTransformedData(params, xAxisIsCategory);
    }
    getDataTransformedData(params, isCategoryAxis) {
        return this.transformData(params.data, params.category.id, isCategoryAxis);
    }
    getXAxisType(params) {
        if (params.grouping) {
            return 'groupedCategory';
        }
        else if (CartesianChartProxy.isTimeAxis(params)) {
            return 'time';
        }
        return 'category';
    }
    static isTimeAxis(params) {
        if (params.category && params.category.chartDataType) {
            return params.category.chartDataType === 'time';
        }
        const testDatum = params.data[0];
        return (testDatum && testDatum[params.category.id]) instanceof Date;
    }
    crossFilteringReset() {
        this.crossFilteringSelectedPoints = [];
        this.crossFilteringAllPoints.clear();
    }
    crossFilteringPointSelected(point) {
        return this.crossFilteringSelectedPoints.length == 0 || this.crossFilteringSelectedPoints.includes(point);
    }
    crossFilteringDeselectedPoints() {
        return this.crossFilteringSelectedPoints.length > 0 &&
            this.crossFilteringAllPoints.size !== this.crossFilteringSelectedPoints.length;
    }
    extractLineAreaCrossFilterSeries(series, params) {
        const getYKey = (yKey) => {
            if (this.standaloneChartType === 'area') {
                const lastSelectedChartId = params.getCrossFilteringContext().lastSelectedChartId;
                return (lastSelectedChartId === params.chartId) ? yKey + '-total' : yKey;
            }
            return yKey + '-total';
        };
        return series.map(s => {
            s.yKey = getYKey(s.yKey);
            s.listeners = {
                nodeClick: (e) => {
                    const value = e.datum[s.xKey];
                    const multiSelection = e.event.metaKey || e.event.ctrlKey;
                    this.crossFilteringAddSelectedPoint(multiSelection, value);
                    this.crossFilterCallback(e);
                }
            };
            s.marker = {
                formatter: (p) => {
                    const category = p.datum[params.category.id];
                    return {
                        fill: p.highlighted ? 'yellow' : p.fill,
                        size: p.highlighted ? 14 : this.crossFilteringPointSelected(category) ? 8 : 0,
                    };
                }
            };
            if (this.standaloneChartType === 'area') {
                s.fillOpacity = this.crossFilteringDeselectedPoints() ? 0.3 : 1;
            }
            if (this.standaloneChartType === 'line') {
                s.strokeOpacity = this.crossFilteringDeselectedPoints() ? 0.3 : 1;
            }
            return s;
        });
    }
    getCrossFilterData(params) {
        this.crossFilteringAllPoints.clear();
        const colId = params.fields[0].colId;
        const filteredOutColId = `${colId}-filtered-out`;
        const lastSelectedChartId = params.getCrossFilteringContext().lastSelectedChartId;
        return params.data.map(d => {
            const category = d[params.category.id];
            this.crossFilteringAllPoints.add(category);
            const pointSelected = this.crossFilteringPointSelected(category);
            if (this.standaloneChartType === 'area' && lastSelectedChartId === params.chartId) {
                d[`${colId}-total`] = pointSelected ? d[colId] : d[colId] + d[filteredOutColId];
            }
            if (this.standaloneChartType === 'line') {
                d[`${colId}-total`] = pointSelected ? d[colId] : d[colId] + d[filteredOutColId];
            }
            return d;
        });
    }
    crossFilteringAddSelectedPoint(multiSelection, value) {
        multiSelection ? this.crossFilteringSelectedPoints.push(value) : this.crossFilteringSelectedPoints = [value];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FydGVzaWFuQ2hhcnRQcm94eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL2NoYXJ0UHJveGllcy9jYXJ0ZXNpYW4vY2FydGVzaWFuQ2hhcnRQcm94eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFrQyxNQUFNLGVBQWUsQ0FBQztBQUMzRSxPQUFPLEVBS0gsT0FBTyxHQUVWLE1BQU0scUJBQXFCLENBQUM7QUFFN0IsTUFBTSxPQUFnQixtQkFBb0IsU0FBUSxVQUFVO0lBSXhELFlBQXNCLE1BQXdCO1FBQzFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUpSLDRCQUF1QixHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFDNUMsaUNBQTRCLEdBQWEsRUFBRSxDQUFDO0lBSXRELENBQUM7SUFLTSxNQUFNLENBQUMsTUFBb0I7UUFDOUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVsQyxNQUFNLE9BQU8sbUNBQ04sSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUN0RCxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQ2hDLElBQUksRUFDSixNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FDakMsQ0FBQztRQUVGLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFTyxPQUFPLENBQUMsTUFBb0IsRUFBRSxJQUE4Qjs7UUFDaEUsTUFBTSxzQkFBc0IsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDbkYs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