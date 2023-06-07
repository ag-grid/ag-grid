var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import { CartesianChartProxy } from "../cartesian/cartesianChartProxy";
import { getSeriesType } from "../../utils/seriesTypeMapper";
var ComboChartProxy = /** @class */ (function (_super) {
    __extends(ComboChartProxy, _super);
    function ComboChartProxy(params) {
        return _super.call(this, params) || this;
    }
    ComboChartProxy.prototype.getAxes = function (params) {
        var fields = params ? params.fields : [];
        var fieldsMap = new Map(fields.map(function (f) { return [f.colId, f]; }));
        var _a = this.getYKeys(fields, params.seriesChartTypes), primaryYKeys = _a.primaryYKeys, secondaryYKeys = _a.secondaryYKeys;
        var axes = [
            {
                type: this.getXAxisType(params),
                position: 'bottom',
                gridStyle: [{ stroke: undefined }],
            },
        ];
        if (primaryYKeys.length > 0) {
            axes.push({
                type: 'number',
                keys: primaryYKeys,
                position: 'left',
            });
        }
        if (secondaryYKeys.length > 0) {
            secondaryYKeys.forEach(function (secondaryYKey, i) {
                var field = fieldsMap.get(secondaryYKey);
                var secondaryAxisIsVisible = field && field.colId === secondaryYKey;
                if (!secondaryAxisIsVisible) {
                    return;
                }
                var secondaryAxisOptions = {
                    type: 'number',
                    keys: [secondaryYKey],
                    position: 'right',
                };
                var primaryYAxis = primaryYKeys.some(function (primaryYKey) { return !!fieldsMap.get(primaryYKey); });
                var lastSecondaryAxis = i === secondaryYKeys.length - 1;
                if (!primaryYAxis && lastSecondaryAxis) {
                    // don't remove grid lines from the secondary axis closest to the chart, i.e. last supplied
                }
                else {
                    secondaryAxisOptions.gridStyle = [{ stroke: undefined }];
                }
                axes.push(secondaryAxisOptions);
            });
        }
        return axes;
    };
    ComboChartProxy.prototype.getSeries = function (params) {
        var fields = params.fields, category = params.category, seriesChartTypes = params.seriesChartTypes;
        return fields.map(function (field) {
            var seriesChartType = seriesChartTypes.find(function (s) { return s.colId === field.colId; });
            if (seriesChartType) {
                var chartType = seriesChartType.chartType;
                var grouped = ['groupedColumn', 'groupedBar'].includes(chartType);
                var groupedOpts = grouped ? { grouped: true } : {};
                return __assign({ type: getSeriesType(chartType), xKey: category.id, yKey: field.colId, yName: field.displayName, stacked: ['stackedArea', 'stackedColumn'].includes(chartType) }, groupedOpts);
            }
        });
    };
    ComboChartProxy.prototype.getYKeys = function (fields, seriesChartTypes) {
        var primaryYKeys = [];
        var secondaryYKeys = [];
        fields.forEach(function (field) {
            var colId = field.colId;
            var seriesChartType = seriesChartTypes.find(function (s) { return s.colId === colId; });
            if (seriesChartType) {
                seriesChartType.secondaryAxis ? secondaryYKeys.push(colId) : primaryYKeys.push(colId);
            }
        });
        return { primaryYKeys: primaryYKeys, secondaryYKeys: secondaryYKeys };
    };
    return ComboChartProxy;
}(CartesianChartProxy));
export { ComboChartProxy };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9DaGFydFByb3h5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvY2hhcnRQcm94aWVzL2NvbWJvL2NvbWJvQ2hhcnRQcm94eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdBLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUU3RDtJQUFxQyxtQ0FBbUI7SUFFcEQseUJBQW1CLE1BQXdCO2VBQ3ZDLGtCQUFNLE1BQU0sQ0FBQztJQUNqQixDQUFDO0lBRU0saUNBQU8sR0FBZCxVQUFlLE1BQW9CO1FBQy9CLElBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzNDLElBQU0sU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQVosQ0FBWSxDQUFDLENBQUMsQ0FBQztRQUVuRCxJQUFBLEtBQW1DLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUEvRSxZQUFZLGtCQUFBLEVBQUUsY0FBYyxvQkFBbUQsQ0FBQztRQUV4RixJQUFNLElBQUksR0FBNkI7WUFDbkM7Z0JBQ0ksSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO2dCQUMvQixRQUFRLEVBQUUsUUFBUTtnQkFDbEIsU0FBUyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUM7YUFDckM7U0FDSixDQUFDO1FBRUYsSUFBSSxZQUFZLENBQUMsTUFBTSxH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