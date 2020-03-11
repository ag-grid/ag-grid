"use strict";
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
var cartesianChart_1 = require("./cartesianChart");
var numberAxis_1 = require("./axis/numberAxis");
var categoryAxis_1 = require("./axis/categoryAxis");
var lineSeries_1 = require("./series/cartesian/lineSeries");
var columnSeries_1 = require("./series/cartesian/columnSeries");
var barSeries_1 = require("./series/cartesian/barSeries");
var scatterSeries_1 = require("./series/cartesian/scatterSeries");
var areaSeries_1 = require("./series/cartesian/areaSeries");
var polarChart_1 = require("./polarChart");
var pieSeries_1 = require("./series/polar/pieSeries");
var caption_1 = require("../caption");
var legend_1 = require("./legend");
var padding_1 = require("../util/padding");
var dropShadow_1 = require("../scene/dropShadow");
var axis_1 = require("../axis");
var palettes_1 = require("./palettes");
var array_1 = require("../util/array");
var timeAxis_1 = require("./axis/timeAxis");
var AgChart = /** @class */ (function () {
    function AgChart() {
    }
    AgChart.create = function (options, container, data) {
        options = Object.create(options); // avoid mutating user provided options
        if (container) {
            options.container = container;
        }
        if (data) {
            options.data = data;
        }
        // special handling when both `autoSize` and `width` / `height` are present in the options
        var autoSize = options && options.autoSize;
        var chart = create(options);
        if (chart && autoSize) { // `autoSize` takes precedence over `width` / `height`
            chart.autoSize = true;
        }
        // console.log(JSON.stringify(flattenObject(options), null, 4));
        return chart;
    };
    AgChart.update = function (chart, options) {
        var autoSize = options && options.autoSize;
        update(chart, Object.create(options));
        if (chart && autoSize) {
            chart.autoSize = true;
        }
    };
    return AgChart;
}());
exports.AgChart = AgChart;
var chartMappings = {
    background: {
        meta: {
            defaults: {
                visible: true,
                fill: 'white'
            }
        }
    },
    padding: {
        meta: {
            constructor: padding_1.Padding,
            defaults: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            }
        }
    },
    title: {
        meta: {
            constructor: caption_1.Caption,
            defaults: {
                enabled: true,
                padding: new padding_1.Padding(10),
                text: 'Title',
                fontStyle: undefined,
                fontWeight: 'bold',
                fontSize: 14,
                fontFamily: 'Verdana, sans-serif',
                color: 'rgba(70, 70, 70, 1)'
            }
        }
    },
    subtitle: {
        meta: {
            constructor: caption_1.Caption,
            defaults: {
                enabled: true,
                padding: new padding_1.Padding(10),
                text: 'Subtitle',
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: 'Verdana, sans-serif',
                color: 'rgba(140, 140, 140, 1)'
            }
        }
    },
    legend: {
        meta: {
            constructor: legend_1.Legend,
            defaults: {
                enabled: true,
                position: legend_1.LegendPosition.Right,
                spacing: 20,
                layoutHorizontalSpacing: 16,
                layoutVerticalSpacing: 8,
                itemSpacing: 8,
                markerShape: undefined,
                markerSize: 15,
                strokeWidth: 1,
                color: 'black',
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: 'Verdana, sans-serif'
            }
        }
    }
};
var chartDefaults = {
    container: undefined,
    data: [],
    padding: new padding_1.Padding(20),
    title: undefined,
    subtitle: undefined,
};
var chartMeta = {
    // Charts components' constructors normally don't take any parameters (which makes things consistent -- everything
    // is configured the same way, via the properties, and makes the factory pattern work well) but the charts
    // themselves are the exceptions.
    // If a chart config has the (optional) `document` property, it will be passed to the constructor.
    // There is no actual `document` property on the chart, it can only be supplied during instantiation.
    constructorParams: ['document'],
    setAsIs: ['container', 'data', 'tooltipOffset'],
};
var axisDefaults = {
    defaults: {
        gridStyle: [{
                stroke: 'rgba(219, 219, 219, 1)',
                lineDash: [4, 2]
            }]
    }
};
var seriesDefaults = {
    visible: true,
    showInLegend: true
};
var columnSeriesDefaults = {
    fills: palettes_1.default.fills,
    strokes: palettes_1.default.strokes,
    fillOpacity: 1,
    strokeOpacity: 1,
    xKey: '',
    xName: '',
    yKeys: [],
    yNames: [],
    grouped: false,
    normalizedTo: undefined,
    strokeWidth: 1,
    shadow: undefined,
    highlightStyle: {
        fill: 'yellow'
    }
};
var shadowMapping = {
    shadow: {
        meta: {
            constructor: dropShadow_1.DropShadow,
            defaults: {
                enabled: true,
                color: 'rgba(0, 0, 0, 0.5)',
                xOffset: 0,
                yOffset: 0,
                blur: 5
            }
        }
    }
};
var labelDefaults = {
    enabled: true,
    fontStyle: undefined,
    fontWeight: undefined,
    fontSize: 12,
    fontFamily: 'Verdana, sans-serif',
    color: 'rgba(70, 70, 70, 1)'
};
var labelMapping = {
    label: {
        meta: {
            defaults: __assign({}, labelDefaults)
        }
    }
};
var axisMappings = {
    line: {
        meta: {
            defaults: {
                width: 1,
                color: 'rgba(195, 195, 195, 1)'
            }
        }
    },
    title: {
        meta: {
            constructor: caption_1.Caption,
            defaults: {
                enabled: true,
                padding: new padding_1.Padding(10),
                text: 'Axis Title',
                fontStyle: undefined,
                fontWeight: 'bold',
                fontSize: 12,
                fontFamily: 'Verdana, sans-serif',
                color: 'rgba(70, 70, 70, 1)'
            }
        }
    },
    label: {
        meta: {
            constructor: axis_1.AxisLabel,
            defaults: {
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: 'Verdana, sans-serif',
                padding: 5,
                color: 'rgba(87, 87, 87, 1)',
                formatter: undefined
            }
        }
    },
    tick: {
        meta: {
            constructor: axis_1.AxisTick,
            defaults: {
                width: 1,
                size: 6,
                color: 'rgba(195, 195, 195, 1)',
                count: 10
            }
        }
    }
};
var mappings = (_a = {},
    _a[cartesianChart_1.CartesianChart.type] = __assign(__assign({ meta: __assign(__assign({ constructor: cartesianChart_1.CartesianChart }, chartMeta), { defaults: __assign(__assign({}, chartDefaults), { axes: [{
                        type: categoryAxis_1.CategoryAxis.type,
                        position: 'bottom'
                    }, {
                        type: numberAxis_1.NumberAxis.type,
                        position: 'left'
                    }] }) }) }, chartMappings), { axes: (_b = {},
            _b[numberAxis_1.NumberAxis.type] = __assign({ meta: __assign({ constructor: numberAxis_1.NumberAxis, setAsIs: ['gridStyle'] }, axisDefaults) }, axisMappings),
            _b[categoryAxis_1.CategoryAxis.type] = __assign({ meta: __assign({ constructor: categoryAxis_1.CategoryAxis, setAsIs: ['gridStyle'] }, axisDefaults) }, axisMappings),
            _b[timeAxis_1.TimeAxis.type] = __assign({ meta: __assign({ constructor: timeAxis_1.TimeAxis, setAsIs: ['gridStyle'] }, axisDefaults) }, axisMappings),
            _b), series: (_c = {},
            _c[lineSeries_1.LineSeries.type] = {
                meta: {
                    constructor: lineSeries_1.LineSeries,
                    defaults: {
                        title: undefined,
                        xKey: '',
                        xName: '',
                        yKey: '',
                        yName: '',
                        stroke: palettes_1.default.fills[0],
                        strokeWidth: 2,
                        fillOpacity: 1,
                        strokeOpacity: 1,
                        highlightStyle: {
                            fill: 'yellow'
                        }
                    }
                },
                highlightStyle: {},
                marker: {}
            },
            _c[columnSeries_1.ColumnSeries.type] = __assign(__assign({ meta: {
                    constructor: columnSeries_1.ColumnSeries,
                    defaults: __assign(__assign({}, seriesDefaults), columnSeriesDefaults)
                }, highlightStyle: {} }, labelMapping), shadowMapping),
            _c[barSeries_1.BarSeries.type] = __assign(__assign({ meta: {
                    constructor: barSeries_1.BarSeries,
                    defaults: __assign(__assign({}, seriesDefaults), columnSeriesDefaults)
                }, highlightStyle: {} }, labelMapping), shadowMapping),
            _c[scatterSeries_1.ScatterSeries.type] = {
                meta: {
                    constructor: scatterSeries_1.ScatterSeries,
                    defaults: __assign(__assign({}, seriesDefaults), { title: undefined, xKey: '', yKey: '', sizeKey: undefined, labelKey: undefined, xName: '', yName: '', sizeName: 'Size', labelName: 'Label', fill: palettes_1.default.fills[0], stroke: palettes_1.default.strokes[0], strokeWidth: 2, fillOpacity: 1, strokeOpacity: 1, tooltipRenderer: undefined, highlightStyle: {
                            fill: 'yellow'
                        } })
                },
                highlightStyle: {},
                marker: {}
            },
            _c[areaSeries_1.AreaSeries.type] = __assign({ meta: {
                    constructor: areaSeries_1.AreaSeries,
                    defaults: __assign(__assign({}, seriesDefaults), { xKey: '', xName: '', yKeys: [], yNames: [], normalizedTo: undefined, fills: palettes_1.default.fills, strokes: palettes_1.default.strokes, fillOpacity: 1, strokeOpacity: 1, strokeWidth: 2, shadow: undefined, highlightStyle: {
                            fill: 'yellow'
                        } })
                }, highlightStyle: {}, marker: {} }, shadowMapping),
            _c) }),
    _a[polarChart_1.PolarChart.type] = __assign(__assign({ meta: __assign(__assign({ constructor: polarChart_1.PolarChart }, chartMeta), { defaults: __assign(__assign({}, chartDefaults), { padding: new padding_1.Padding(40) }) }) }, chartMappings), { series: (_d = {},
            _d[pieSeries_1.PieSeries.type] = __assign({ meta: {
                    constructor: pieSeries_1.PieSeries,
                    defaults: __assign(__assign({}, seriesDefaults), { title: undefined, calloutColors: palettes_1.default.strokes, calloutStrokeWidth: 1, calloutLength: 10, angleKey: '', angleName: '', radiusKey: undefined, radiusName: undefined, labelKey: undefined, labelName: undefined, fills: palettes_1.default.fills, strokes: palettes_1.default.strokes, fillOpacity: 1, strokeOpacity: 1, rotation: 0, outerRadiusOffset: 0, innerRadiusOffset: 0, strokeWidth: 1, shadow: undefined })
                }, highlightStyle: {}, title: {
                    meta: {
                        constructor: caption_1.Caption,
                        defaults: {
                            enabled: true,
                            padding: new padding_1.Padding(10),
                            text: 'Series Title',
                            fontStyle: undefined,
                            fontWeight: 'bold',
                            fontSize: 14,
                            fontFamily: 'Verdana, sans-serif',
                            color: 'black'
                        }
                    }
                }, label: {
                    meta: {
                        defaults: __assign(__assign({}, labelDefaults), { offset: 3, minAngle: 20 })
                    }
                }, callout: {
                    meta: {
                        defaults: {
                            colors: palettes_1.default.strokes,
                            length: 10,
                            strokeWidth: 1
                        }
                    }
                } }, shadowMapping),
            _d) }),
    _a);
// Amend the `mappings` object with aliases for different chart types.
{
    var typeToAliases = {
        cartesian: ['line', 'area', 'bar', 'column'],
        polar: ['pie']
    };
    var _loop_1 = function (type) {
        typeToAliases[type].forEach(function (alias) {
            mappings[alias] = mappings[type];
        });
    };
    for (var type in typeToAliases) {
        _loop_1(type);
    }
    // Special handling for scatter charts where both axes should default to type `number`.
    mappings['scatter'] = __assign(__assign({}, mappings.cartesian), { meta: __assign(__assign({}, mappings.cartesian.meta), { defaults: __assign(__assign({}, chartDefaults), { axes: [{
                        type: 'number',
                        position: 'bottom'
                    }, {
                        type: 'number',
                        position: 'left'
                    }] }) }) });
}
var pathToSeriesTypeMap = {
    'cartesian.series': 'line',
    'line.series': 'line',
    'area.series': 'area',
    'bar.series': 'bar',
    'column.series': 'column',
    'scatter.series': 'scatter',
    'polar.series': 'pie',
    'pie.series': 'pie'
};
function provideDefaultType(options, path) {
    if (!path) { // if `path` is undefined, `options` is a top-level (chart) config
        provideDefaultChartType(options);
    }
    if (!options.type) {
        var seriesType = pathToSeriesTypeMap[path];
        if (seriesType) {
            options.type = seriesType;
        }
    }
}
function getMapping(path) {
    var parts = path.split('.');
    var value = mappings;
    parts.forEach(function (part) {
        value = value[part];
    });
    return value;
}
function create(options, path, component) {
    var _a;
    provideDefaultType(options, path);
    if (path) {
        if (options.type) {
            path = path + '.' + options.type;
        }
    }
    else {
        path = options.type;
    }
    var mapping = getMapping(path);
    if (mapping) {
        provideDefaultOptions(options, mapping);
        var meta = mapping.meta || {};
        var constructorParams = meta.constructorParams || [];
        var skipKeys = ['type'].concat(constructorParams);
        // TODO: Constructor params processing could be improved, but it's good enough for current params.
        var constructorParamValues = constructorParams
            .map(function (param) { return options[param]; })
            .filter(function (value) { return value !== undefined; });
        component = component || new ((_a = meta.constructor).bind.apply(_a, __spreadArrays([void 0], constructorParamValues)))();
        var _loop_2 = function (key) {
            // Process every non-special key in the config object.
            if (skipKeys.indexOf(key) < 0) {
                var value = options[key];
                if (value && key in mapping && !(meta.setAsIs && meta.setAsIs.indexOf(key) >= 0)) {
                    if (Array.isArray(value)) {
                        var subComponents = value.map(function (config) { return create(config, path + '.' + key); }).filter(function (config) { return !!config; });
                        component[key] = subComponents;
                    }
                    else {
                        if (mapping[key] && component[key]) {
                            // The instance property already exists on the component (e.g. chart.legend).
                            // Simply configure the existing instance, without creating a new one.
                            create(value, path + '.' + key, component[key]);
                        }
                        else {
                            var subComponent = create(value, value.type ? path : path + '.' + key);
                            if (subComponent) {
                                component[key] = subComponent;
                            }
                        }
                    }
                }
                else { // if (key in meta.constructor.defaults) { // prevent users from creating custom properties
                    component[key] = value;
                }
            }
        };
        for (var key in options) {
            _loop_2(key);
        }
        return component;
    }
}
function update(component, options, path) {
    if (!(options && typeof options === 'object')) {
        return;
    }
    provideDefaultType(options, path);
    if (path) {
        if (options.type) {
            path = path + '.' + options.type;
        }
    }
    else {
        path = options.type;
    }
    var mapping = getMapping(path);
    if (mapping) {
        provideDefaultOptions(options, mapping);
        var meta = mapping.meta || {};
        var defaults = meta && meta.constructor && meta.constructor.defaults;
        var constructorParams = meta && meta.constructorParams || [];
        var skipKeys = ['type'].concat(constructorParams);
        for (var key in options) {
            if (skipKeys.indexOf(key) < 0) {
                var value = options[key];
                var keyPath = path + '.' + key;
                if (meta.setAsIs && meta.setAsIs.indexOf(key) >= 0) {
                    component[key] = value;
                }
                else {
                    var oldValue = component[key];
                    if (Array.isArray(oldValue) && Array.isArray(value)) {
                        if (path in mappings) { // component is a chart
                            if (key === 'series') {
                                var chart = component;
                                var configs = value;
                                var allSeries = oldValue;
                                var prevSeries = void 0;
                                var i = 0;
                                for (; i < configs.length; i++) {
                                    var config = configs[i];
                                    var series = allSeries[i];
                                    if (series) {
                                        provideDefaultType(config, keyPath);
                                        if (series.type === config.type) {
                                            update(series, config, keyPath);
                                        }
                                        else {
                                            var newSeries = create(config, keyPath);
                                            chart.removeSeries(series);
                                            chart.addSeriesAfter(newSeries, prevSeries);
                                            series = newSeries;
                                        }
                                    }
                                    else { // more new configs than existing series
                                        var newSeries = create(config, keyPath);
                                        chart.addSeries(newSeries);
                                    }
                                    prevSeries = series;
                                }
                                // more existing series than new configs
                                for (; i < allSeries.length; i++) {
                                    var series = allSeries[i];
                                    if (series) {
                                        chart.removeSeries(series);
                                    }
                                }
                            }
                            else if (key === 'axes') {
                                var chart = component;
                                var configs = value;
                                var axes = oldValue;
                                var axesToAdd = [];
                                var axesToUpdate = [];
                                var _loop_3 = function (config) {
                                    var axisToUpdate = array_1.find(axes, function (axis) {
                                        return axis.type === config.type && axis.position === config.position;
                                    });
                                    if (axisToUpdate) {
                                        axesToUpdate.push(axisToUpdate);
                                        update(axisToUpdate, config, keyPath);
                                    }
                                    else {
                                        var axisToAdd = create(config, keyPath);
                                        if (axisToAdd) {
                                            axesToAdd.push(axisToAdd);
                                        }
                                    }
                                };
                                for (var _i = 0, configs_1 = configs; _i < configs_1.length; _i++) {
                                    var config = configs_1[_i];
                                    _loop_3(config);
                                }
                                chart.axes = axesToUpdate.concat(axesToAdd);
                            }
                        }
                        else {
                            component[key] = value;
                        }
                    }
                    else if (typeof oldValue === 'object') {
                        if (value) {
                            update(oldValue, value, value.type ? path : keyPath);
                        }
                        else if (key in options) {
                            component[key] = value;
                        }
                    }
                    else {
                        var subComponent = isObject(value) && create(value, value.type ? path : keyPath);
                        if (subComponent) {
                            component[key] = subComponent;
                        }
                        else {
                            component[key] = value;
                        }
                    }
                }
            }
        }
    }
    if (path in mappings) { // top-level component (chart)
        component.performLayout();
    }
}
function provideDefaultChartType(options) {
    // If chart type is not specified, try to infer it from the type of first series.
    if (!options.type) {
        var series = options.series && options.series[0];
        if (series && series.type) {
            outerLoop: for (var chartType in mappings) {
                for (var seriesType in mappings[chartType].series) {
                    if (series.type === seriesType) {
                        options.type = chartType;
                        break outerLoop;
                    }
                }
            }
        }
        if (!options.type) {
            options.type = 'cartesian';
        }
    }
}
/**
 * If certain options were not provided by the user, use the defaults from the mapping.
 * @param options
 * @param mapping
 */
function provideDefaultOptions(options, mapping) {
    var defaults = mapping && mapping.meta && mapping.meta.defaults;
    if (defaults) {
        for (var key in defaults) {
            if (!(key in options)) {
                options[key] = defaults[key];
            }
        }
    }
}
function isObject(value) {
    return typeof value === 'object' && !Array.isArray(value);
}
function flattenObject(obj) {
    var result = Object.create(obj);
    for (var key in result) {
        result[key] = result[key];
    }
    return result;
}
//# sourceMappingURL=agChart.js.map