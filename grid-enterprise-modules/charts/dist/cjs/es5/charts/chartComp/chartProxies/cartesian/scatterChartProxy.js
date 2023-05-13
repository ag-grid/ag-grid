"use strict";
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScatterChartProxy = void 0;
var cartesianChartProxy_1 = require("./cartesianChartProxy");
var chartDataModel_1 = require("../../chartDataModel");
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
        var labelFieldDefinition = params.category.id === chartDataModel_1.ChartDataModel.DEFAULT_CATEGORY ? undefined : params.category;
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
            var marker = __assign(__assign({}, series.marker), { fill: fill,
                stroke: stroke, domain: markerDomain });
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
        return __spread(updatedSeries, updatedSeries.map(updateFilteredOutSeries));
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
}(cartesianChartProxy_1.CartesianChartProxy));
exports.ScatterChartProxy = ScatterChartProxy;
