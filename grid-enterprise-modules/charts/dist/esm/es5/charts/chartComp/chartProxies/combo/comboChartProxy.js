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
                title: {
                    text: primaryYKeys.map(function (key) {
                        var field = fieldsMap.get(key);
                        return field ? field.displayName : key;
                    }).join(' / '),
                },
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
                    title: {
                        text: field ? field.displayName : secondaryYKey,
                    },
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