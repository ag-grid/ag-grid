var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
                return {
                    type: getSeriesType(chartType),
                    xKey: category.id,
                    yKey: field.colId,
                    yName: field.displayName,
                    grouped: ['groupedColumn', 'groupedBar', 'groupedArea'].includes(chartType),
                    stacked: ['stackedArea', 'stackedColumn'].includes(chartType),
                };
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
