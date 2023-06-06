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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { CartesianChartProxy } from "./cartesianChartProxy";
import { ChartDataModel } from "../../model/chartDataModel";
var ScatterChartProxy = /** @class */ (function (_super) {
    __extends(ScatterChartProxy, _super);
    function ScatterChartProxy(params) {
        return _super.call(this, params) || this;
    }
    ScatterChartProxy.prototype.getAxes = function (_params) {
        return [
            {
                type: 'number',
                position: 'bottom',
            },
            {
                type: 'number',
                position: 'left',
            },
        ];
    };
    ScatterChartProxy.prototype.getSeries = function (params) {
        var _this = this;
        var paired = this.isPaired();
        var seriesDefinitions = this.getSeriesDefinitions(params.fields, paired);
        var labelFieldDefinition = params.category.id === ChartDataModel.DEFAULT_CATEGORY ? undefined : params.category;
        var series = seriesDefinitions.map(function (seriesDefinition) { return ({
            type: _this.standaloneChartType,
            xKey: seriesDefinition.xField.colId,
            xName: seriesDefinition.xField.displayName,
            yKey: seriesDefinition.yField.colId,
            yName: seriesDefinition.yField.displayName,
            title: seriesDefinition.yField.displayName + " vs " + seriesDefinition.xField.displayName,
            sizeKey: seriesDefinition.sizeField ? seriesDefinition.sizeField.colId : undefined,
            sizeName: seriesDefinition.sizeField ? seriesDefinition.sizeField.displayName : undefined,
            labelKey: labelFieldDefinition ? labelFieldDefinition.id : seriesDefinition.yField.colId,
            labelName: labelFieldDefinition ? labelFieldDefinition.name : undefined,
        }); });
        return this.crossFiltering ? this.extractCrossFilterSeries(series, params) : series;
    };
    ScatterChartProxy.prototype.extractCrossFilterSeries = function (series, params) {
        var _this = this;
        var data = params.data;
        var palette = this.getChartPalette();
        var filteredOutKey = function (key) { return key + "-filtered-out"; };
        var calcMarkerDomain = function (data, sizeKey) {
            var e_1, _a;
            var _b;
            var markerDomain = [Infinity, -Infinity];
            if (sizeKey != null) {
                try {
                    for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                        var datum = data_1_1.value;
                        var value = (_b = datum[sizeKey]) !== null && _b !== void 0 ? _b : datum[filteredOutKey(sizeKey)];
                        if (value < markerDomain[0]) {
                            markerDomain[0] = value;
                        }
                        if (value > markerDomain[1]) {
                            markerDomain[1] = value;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            if (markerDomain[0] <= markerDomain[1]) {
                return markerDomain;
            }
            return undefined;
        };
        var updatePrimarySeries = function (series, idx) {
            var sizeKey = series.sizeKey;
            var fill = palette === null || palette === void 0 ? void 0 : palette.fills[idx];
            var stroke = palette === null || palette === void 0 ? void 0 : palette.strokes[idx];
            var markerDomain = calcMarkerDomain(data, sizeKey);
            var marker = __assign(__assign({}, series.marker), { fill: fill, stroke: stroke, domain: markerDomain });
            return __assign(__assign({}, series), { marker: marker, highlightStyle: { item: { fill: 'yellow' } }, listeners: __assign(__assign({}, series.listeners), { nodeClick: _this.crossFilterCallback }) });
        };
        var updateFilteredOutSeries = function (series) {
            var sizeKey = series.sizeKey, yKey = series.yKey, xKey = series.xKey;
            if (sizeKey != null) {
                sizeKey = filteredOutKey(sizeKey);
            }
            return __assign(__assign({}, series), { yKey: filteredOutKey(yKey), xKey: filteredOutKey(xKey), marker: __assign(__assign({}, series.marker), { fillOpacity: 0.3, strokeOpacity: 0.3 }), sizeKey: sizeKey, showInLegend: false, listeners: __assign(__assign({}, series.listeners), { nodeClick: function (e) {
                        var _a;
                        var value = e.datum[filteredOutKey(xKey)];
                        // Need to remove the `-filtered-out` suffixes from the event so that
                        // upstream processing maps the event correctly onto grid column ids.
                        var filterableEvent = __assign(__assign({}, e), { xKey: xKey, datum: __assign(__assign({}, e.datum), (_a = {}, _a[xKey] = value, _a)) });
                        _this.crossFilterCallback(filterableEvent);
                    } }) });
        };
        var updatedSeries = series.map(updatePrimarySeries);
        return __spreadArray(__spreadArray([], __read(updatedSeries)), __read(updatedSeries.map(updateFilteredOutSeries)));
    };
    ScatterChartProxy.prototype.getSeriesDefinitions = function (fields, paired) {
        if (fields.length < 2) {
            return [];
        }
        var isBubbleChart = this.chartType === 'bubble';
        if (paired) {
            if (isBubbleChart) {
                return fields.map(function (currentXField, i) { return i % 3 === 0 ? ({
                    xField: currentXField,
                    yField: fields[i + 1],
                    sizeField: fields[i + 2],
                }) : null; }).filter(function (x) { return x && x.yField && x.sizeField; });
            }
            return fields.map(function (currentXField, i) { return i % 2 === 0 ? ({
                xField: currentXField,
                yField: fields[i + 1],
            }) : null; }).filter(function (x) { return x && x.yField; });
        }
        var xField = fields[0];
        if (isBubbleChart) {
            return fields
                .map(function (yField, i) { return i % 2 === 1 ? ({
                xField: xField,
                yField: yField,
                sizeField: fields[i + 1],
            }) : null; })
                .filter(function (x) { return x && x.sizeField; });
        }
        return fields.filter(function (value, i) { return i > 0; }).map(function (yField) { return ({ xField: xField, yField: yField }); });
    };
    return ScatterChartProxy;
}(CartesianChartProxy));
export { ScatterChartProxy };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NhdHRlckNoYXJ0UHJveHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9jaGFydFByb3hpZXMvY2FydGVzaWFuL3NjYXR0ZXJDaGFydFByb3h5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFRNUQ7SUFBdUMscUNBQW1CO0lBRXRELDJCQUFtQixNQUF3QjtlQUN2QyxrQkFBTSxNQUFNLENBQUM7SUFDakIsQ0FBQztJQUVNLG1DQUFPLEdBQWQsVUFBZSxPQUFxQjtRQUNoQyxPQUFPO1lBQ0g7Z0JBQ0ksSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsUUFBUSxFQUFFLFFBQVE7YUFDckI7WUFDRDtnQkFDSSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxRQUFRLEVBQUUsTUFBTTthQUNuQjtTQUNKLENBQUM7SUFDTixDQUFDO0lBRU0scUNBQVMsR0FBaEIsVUFBaUIsTUFBb0I7UUFBckMsaUJBcUJDO1FBcEJHLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMvQixJQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzNFLElBQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEtBQUssY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFFbEgsSUFBTSxNQUFNLEdBQTZCLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxV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