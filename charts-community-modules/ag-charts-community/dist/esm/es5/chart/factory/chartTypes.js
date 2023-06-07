import { jsonMerge } from '../../util/json';
var TYPES = {
    area: 'cartesian',
    bar: 'cartesian',
    column: 'cartesian',
    histogram: 'cartesian',
    line: 'cartesian',
    scatter: 'cartesian',
    treemap: 'hierarchy',
    pie: 'polar',
};
var DEFAULTS = {};
export var CHART_TYPES = {
    has: function (seriesType) {
        return Object.prototype.hasOwnProperty.call(TYPES, seriesType);
    },
    isCartesian: function (seriesType) {
        return TYPES[seriesType] === 'cartesian';
    },
    isPolar: function (seriesType) {
        return TYPES[seriesType] === 'polar';
    },
    isHierarchy: function (seriesType) {
        return TYPES[seriesType] === 'hierarchy';
    },
    get seriesTypes() {
        return Object.keys(TYPES);
    },
    get cartesianTypes() {
        var _this = this;
        return this.seriesTypes.filter(function (t) { return _this.isCartesian(t); });
    },
    get polarTypes() {
        var _this = this;
        return this.seriesTypes.filter(function (t) { return _this.isPolar(t); });
    },
    get hierarchyTypes() {
        var _this = this;
        return this.seriesTypes.filter(function (t) { return _this.isHierarchy(t); });
    },
};
export function registerChartSeriesType(seriesType, chartType) {
    TYPES[seriesType] = chartType;
}
export function registerChartDefaults(chartType, defaults) {
    var _a;
    DEFAULTS[chartType] = jsonMerge([(_a = DEFAULTS[chartType]) !== null && _a !== void 0 ? _a : {}, defaults]);
}
export function getChartDefaults(chartType) {
    var _a;
    return (_a = DEFAULTS[chartType]) !== null && _a !== void 0 ? _a : {};
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRUeXBlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9mYWN0b3J5L2NoYXJ0VHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBSTVDLElBQU0sS0FBSyxHQUE4QjtJQUNyQyxJQUFJLEVBQUUsV0FBVztJQUNqQixHQUFHLEVBQUUsV0FBVztJQUNoQixNQUFNLEVBQUUsV0FBVztJQUNuQixTQUFTLEVBQUUsV0FBVztJQUN0QixJQUFJLEVBQUUsV0FBVztJQUNqQixPQUFPLEVBQUUsV0FBVztJQUNwQixPQUFPLEVBQUUsV0FBVztJQUNwQixHQUFHLEVBQUUsT0FBTztDQUNmLENBQUM7QUFFRixJQUFNLFFBQVEsR0FBdUIsRUFBRSxDQUFDO0FBRXhDLE1BQU0sQ0FBQyxJQUFNLFdBQVcsR0FBRztJQUN2QixHQUFHLEVBQUgsVUFBSSxVQUFrQjtRQUNsQixPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVELFdBQVcsRUFBWCxVQUFZLFVBQWtCO1FBQzFCLE9BQU8sS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLFdBQVcsQ0FBQztJQUM3QyxDQUFDO0lBQ0QsT0FBTyxFQUFQLFVBQVEsVUFBa0I7UUFDdEIsT0FBTyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssT0FBTyxDQUFDO0lBQ3pDLENBQUM7SUFDRCxXQUFXLEVBQVgsVUFBWSxVQUFrQjtRQUMxQixPQUFPLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxXQUFXLENBQUM7SUFDN0MsQ0FBQztJQUVELElBQUksV0FBVztRQUNYLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBQ0QsSUFBSSxjQUFjO1FBQWxCLGlCQUVDO1FBREcsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQW5CLENBQW1CLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBQ0QsSUFBSSxVQUFVO1FBQWQsaUJBRUM7UUFERyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBZixDQUFlLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBQ0QsSUFBSSxjQUFjO1FBQWxCLGlCQUVDO1FBREcsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQW5CLENBQW1CLENBQUMsQ0FBQztJQUMvRCxDQUFDO0NBQ0osQ0FBQztBQUVGLE1BQU0sVUFBVSx1QkFBdUIsQ0FBQyxVQUFrQixFQUFFLFNBQW9CO0lBQzVFLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxTQUFTLENBQUM7QUFDbEMsQ0FBQztBQUVELE1BQU0sVUFBVSxxQkFBcUIsQ0FBQyxTQUFvQixFQUFFLFFBQVk7O0lBQ3BFLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxNQUFBLFFBQVEsQ0FBQyxTQUFTLENBQUMsbUNBQUksRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDM0UsQ0FBQztBQUVELE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxTQUFvQjs7SUFDakQsT0FBTyxNQUFBLFFBQVEsQ0FBQyxTQUFTLENBQUMsbUNBQUksRUFBRSxDQUFDO0FBQ3JDLENBQUMifQ==