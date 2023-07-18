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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartTheme = exports.DEFAULT_FONT_FAMILY = exports.OVERRIDE_SERIES_LABEL_DEFAULTS = exports.EXTENDS_SERIES_DEFAULTS = exports.EXTENDS_AXES_LINE_DEFAULTS = exports.EXTENDS_AXES_LABEL_DEFAULTS = exports.EXTENDS_AXES_DEFAULTS = void 0;
var json_1 = require("../../util/json");
var object_1 = require("../../util/object");
var axisTypes_1 = require("../factory/axisTypes");
var chartTypes_1 = require("../factory/chartTypes");
var seriesTypes_1 = require("../factory/seriesTypes");
var palette = {
    fills: ['#f3622d', '#fba71b', '#57b757', '#41a9c9', '#4258c9', '#9a42c8', '#c84164', '#888888'],
    strokes: ['#aa4520', '#b07513', '#3d803d', '#2d768d', '#2e3e8d', '#6c2e8c', '#8c2d46', '#5f5f5f'],
};
exports.EXTENDS_AXES_DEFAULTS = Symbol('extends-axes-defaults');
exports.EXTENDS_AXES_LABEL_DEFAULTS = Symbol('extends-axes-label-defaults');
exports.EXTENDS_AXES_LINE_DEFAULTS = Symbol('extends-axes-line-defaults');
exports.EXTENDS_SERIES_DEFAULTS = Symbol('extends-series-defaults');
exports.OVERRIDE_SERIES_LABEL_DEFAULTS = Symbol('override-series-label-defaults');
exports.DEFAULT_FONT_FAMILY = Symbol('default-font');
var BOLD = 'bold';
var INSIDE = 'inside';
var BOTTOM = 'bottom';
var ChartTheme = /** @class */ (function () {
    function ChartTheme(options) {
        options = object_1.deepMerge({}, options !== null && options !== void 0 ? options : {});
        var _a = options.overrides, overrides = _a === void 0 ? null : _a, _b = options.palette, palette = _b === void 0 ? null : _b;
        var defaults = this.createChartConfigPerChartType(this.getDefaults());
        if (overrides) {
            var common = overrides.common, cartesian = overrides.cartesian, polar = overrides.polar, hierarchy = overrides.hierarchy;
            var applyOverrides = function (type, seriesTypes, overrideOpts) {
                if (overrideOpts) {
                    defaults[type] = object_1.deepMerge(defaults[type], overrideOpts);
                    seriesTypes.forEach(function (s) {
                        var seriesType = s;
                        defaults[seriesType] = object_1.deepMerge(defaults[seriesType], overrideOpts);
                    });
                }
            };
            applyOverrides('common', Object.keys(defaults), common);
            applyOverrides('cartesian', chartTypes_1.CHART_TYPES.cartesianTypes, cartesian);
            applyOverrides('polar', chartTypes_1.CHART_TYPES.polarTypes, polar);
            applyOverrides('hierarchy', chartTypes_1.CHART_TYPES.hierarchyTypes, hierarchy);
            chartTypes_1.CHART_TYPES.seriesTypes.forEach(function (s) {
                var _a;
                var seriesType = s;
                var chartConfig = overrides[seriesType];
                if (chartConfig) {
                    if (chartConfig.series) {
                        chartConfig.series = (_a = {}, _a[seriesType] = chartConfig.series, _a);
                    }
                    defaults[seriesType] = object_1.deepMerge(defaults[seriesType], chartConfig);
                }
            });
        }
        this.palette = palette !== null && palette !== void 0 ? palette : this.getPalette();
        this.config = Object.freeze(defaults);
    }
    ChartTheme.prototype.getPalette = function () {
        return palette;
    };
    ChartTheme.getAxisDefaults = function () {
        return {
            top: {},
            right: {},
            bottom: {},
            left: {},
            title: {
                enabled: false,
                text: 'Axis Title',
                fontStyle: undefined,
                fontWeight: BOLD,
                fontSize: 12,
                fontFamily: this.fontFamily,
                color: 'rgb(70, 70, 70)',
            },
            label: {
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: this.fontFamily,
                padding: 5,
                rotation: undefined,
                color: 'rgb(87, 87, 87)',
                formatter: undefined,
                autoRotate: false,
                avoidCollisions: true,
            },
            line: {
                width: 1,
                color: 'rgb(195, 195, 195)',
            },
            tick: {
                width: 1,
                size: 6,
                color: 'rgb(195, 195, 195)',
            },
            gridStyle: [
                {
                    stroke: 'rgb(219, 219, 219)',
                    lineDash: [4, 2],
                },
            ],
            crossLines: {
                enabled: false,
                fill: 'rgb(187,221,232)',
                stroke: 'rgb(70,162,192)',
                strokeWidth: 1,
                label: {
                    enabled: false,
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 12,
                    fontFamily: this.fontFamily,
                    padding: 5,
                    color: 'rgb(87, 87, 87)',
                    rotation: undefined,
                },
            },
        };
    };
    ChartTheme.getSeriesDefaults = function () {
        return {
            tooltip: {
                enabled: true,
                renderer: undefined,
            },
            visible: true,
            showInLegend: true,
            highlightStyle: {
                item: {
                    fill: 'yellow',
                    fillOpacity: 1,
                },
                series: {
                    dimOpacity: 1,
                },
                text: {
                    color: 'black',
                },
            },
            nodeClickRange: 'exact',
        };
    };
    ChartTheme.getBarSeriesDefaults = function () {
        return __assign(__assign({}, this.getSeriesDefaults()), { fillOpacity: 1, strokeOpacity: 1, normalizedTo: undefined, strokeWidth: 1, lineDash: [0], lineDashOffset: 0, label: {
                enabled: false,
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: this.fontFamily,
                color: 'rgb(70, 70, 70)',
                formatter: undefined,
                placement: INSIDE,
            }, shadow: {
                enabled: false,
                color: 'rgba(0, 0, 0, 0.5)',
                xOffset: 3,
                yOffset: 3,
                blur: 5,
            } });
    };
    ChartTheme.getLineSeriesDefaults = function () {
        var seriesDefaults = this.getSeriesDefaults();
        return __assign(__assign({}, seriesDefaults), { tooltip: __assign(__assign({}, seriesDefaults.tooltip), { format: undefined, position: {
                    type: 'node',
                } }) });
    };
    ChartTheme.getAreaSeriesDefaults = function () {
        var seriesDefaults = this.getSeriesDefaults();
        return __assign(__assign({}, seriesDefaults), { nodeClickRange: 'nearest', tooltip: __assign(__assign({}, seriesDefaults.tooltip), { position: {
                    type: 'node',
                } }) });
    };
    ChartTheme.getScatterSeriesDefaults = function () {
        var seriesDefaults = this.getSeriesDefaults();
        return __assign(__assign({}, seriesDefaults), { tooltip: __assign(__assign({}, seriesDefaults.tooltip), { position: {
                    type: 'node',
                } }) });
    };
    ChartTheme.getCartesianSeriesMarkerDefaults = function () {
        return {
            enabled: true,
            shape: 'circle',
            size: 6,
            maxSize: 30,
            strokeWidth: 1,
            formatter: undefined,
        };
    };
    ChartTheme.getCaptionWrappingDefaults = function () {
        return 'hyphenate';
    };
    ChartTheme.getChartDefaults = function () {
        return {
            background: {
                visible: true,
                fill: 'white',
            },
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            },
            title: {
                enabled: false,
                text: 'Title',
                fontStyle: undefined,
                fontWeight: BOLD,
                fontSize: 16,
                fontFamily: this.fontFamily,
                color: 'rgb(70, 70, 70)',
                wrapping: ChartTheme.getCaptionWrappingDefaults(),
            },
            subtitle: {
                enabled: false,
                text: 'Subtitle',
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: this.fontFamily,
                color: 'rgb(140, 140, 140)',
                wrapping: ChartTheme.getCaptionWrappingDefaults(),
            },
            footnote: {
                enabled: false,
                text: 'Footnote',
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: this.fontFamily,
                color: 'rgb(140, 140, 140)',
                spacing: 30,
                wrapping: ChartTheme.getCaptionWrappingDefaults(),
            },
            legend: {
                position: BOTTOM,
                spacing: 20,
                listeners: {},
                item: {
                    paddingX: 16,
                    paddingY: 8,
                    marker: {
                        shape: undefined,
                        size: 15,
                        strokeWidth: 1,
                        padding: 8,
                    },
                    label: {
                        color: 'black',
                        fontStyle: undefined,
                        fontWeight: undefined,
                        fontSize: 12,
                        fontFamily: this.fontFamily,
                        formatter: undefined,
                    },
                },
                reverseOrder: false,
                pagination: {
                    marker: {
                        size: 12,
                    },
                    activeStyle: {
                        fill: 'rgb(70, 70, 70)',
                    },
                    inactiveStyle: {
                        fill: 'rgb(219, 219, 219)',
                    },
                    highlightStyle: {
                        fill: 'rgb(70, 70, 70)',
                    },
                    label: {
                        color: 'rgb(70, 70, 70)',
                    },
                },
            },
            tooltip: {
                enabled: true,
                range: 'nearest',
                delay: 0,
            },
            listeners: {},
        };
    };
    ChartTheme.prototype.createChartConfigPerChartType = function (config) {
        var _this = this;
        var typeToAliases = {
            cartesian: chartTypes_1.CHART_TYPES.cartesianTypes,
            polar: chartTypes_1.CHART_TYPES.polarTypes,
            hierarchy: chartTypes_1.CHART_TYPES.hierarchyTypes,
            groupedCategory: [],
        };
        Object.entries(typeToAliases).forEach(function (_a) {
            var _b = __read(_a, 2), nextType = _b[0], aliases = _b[1];
            var type = nextType;
            var typeDefaults = _this.templateTheme(chartTypes_1.getChartDefaults(type));
            aliases.forEach(function (next) {
                var alias = next;
                if (!config[alias]) {
                    config[alias] = object_1.deepMerge({}, config[type]);
                    object_1.deepMerge(config[alias], typeDefaults);
                }
            });
        });
        return config;
    };
    ChartTheme.prototype.getDefaults = function () {
        var _this = this;
        var defaults = object_1.deepMerge({}, ChartTheme.defaults);
        var getOverridesByType = function (chartType, seriesTypes) {
            var result = _this.templateTheme(chartTypes_1.getChartDefaults(chartType));
            result.series = seriesTypes.reduce(function (obj, seriesType) {
                var template = seriesTypes_1.getSeriesThemeTemplate(seriesType);
                if (template) {
                    obj[seriesType] = _this.templateTheme(template);
                }
                return obj;
            }, {});
            if (chartType === 'cartesian' || chartType === 'polar') {
                result.axes = axisTypes_1.AXIS_TYPES.axesTypes.reduce(function (obj, axisType) {
                    var template = axisTypes_1.getAxisThemeTemplate(axisType);
                    if (template) {
                        obj[axisType] = _this.templateTheme(template);
                    }
                    return obj;
                }, {});
            }
            return result;
        };
        var extension = {
            cartesian: getOverridesByType('cartesian', chartTypes_1.CHART_TYPES.cartesianTypes),
            groupedCategory: getOverridesByType('cartesian', chartTypes_1.CHART_TYPES.cartesianTypes),
            polar: getOverridesByType('polar', chartTypes_1.CHART_TYPES.polarTypes),
            hierarchy: getOverridesByType('hierarchy', chartTypes_1.CHART_TYPES.hierarchyTypes),
        };
        return object_1.deepMerge(defaults, extension);
    };
    ChartTheme.prototype.templateTheme = function (themeTemplate) {
        var themeInstance = json_1.jsonMerge([themeTemplate]);
        var _a = this.getTemplateParameters(), extensions = _a.extensions, properties = _a.properties;
        json_1.jsonWalk(themeInstance, function (_, node) {
            var e_1, _a;
            if (node['__extends__']) {
                var key = node['__extends__'];
                var source_1 = extensions.get(key);
                if (source_1 == null) {
                    throw new Error('AG Charts - no template variable provided for: ' + key);
                }
                Object.keys(source_1).forEach(function (key) {
                    if (!(key in node)) {
                        node[key] = source_1[key];
                    }
                });
                delete node['__extends__'];
            }
            if (node['__overrides__']) {
                var key = node['__overrides__'];
                var source = extensions.get(key);
                if (source == null) {
                    throw new Error('AG Charts - no template variable provided for: ' + key);
                }
                Object.assign(node, source);
                delete node['__overrides__'];
            }
            try {
                for (var _b = __values(Object.entries(node)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), name_1 = _d[0], value = _d[1];
                    if (properties.has(value)) {
                        node[name_1] = properties.get(value);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }, {});
        return themeInstance;
    };
    ChartTheme.prototype.getTemplateParameters = function () {
        var extensions = new Map();
        extensions.set(exports.EXTENDS_AXES_DEFAULTS, ChartTheme.getAxisDefaults());
        extensions.set(exports.EXTENDS_AXES_LABEL_DEFAULTS, ChartTheme.getAxisDefaults().label);
        extensions.set(exports.EXTENDS_AXES_LINE_DEFAULTS, ChartTheme.getAxisDefaults().line);
        extensions.set(exports.EXTENDS_SERIES_DEFAULTS, ChartTheme.getSeriesDefaults());
        extensions.set(exports.OVERRIDE_SERIES_LABEL_DEFAULTS, {});
        var properties = new Map();
        properties.set(exports.DEFAULT_FONT_FAMILY, ChartTheme.fontFamily);
        return {
            extensions: extensions,
            properties: properties,
        };
    };
    ChartTheme.prototype.mergeWithParentDefaults = function (parentDefaults, defaults) {
        return object_1.deepMerge(parentDefaults, defaults);
    };
    ChartTheme.fontFamily = 'Verdana, sans-serif';
    ChartTheme.cartesianDefaults = __assign(__assign({}, ChartTheme.getChartDefaults()), { axes: {
            number: __assign({}, ChartTheme.getAxisDefaults()),
            log: __assign(__assign({}, ChartTheme.getAxisDefaults()), { base: 10 }),
            category: __assign(__assign({}, ChartTheme.getAxisDefaults()), { groupPaddingInner: 0.1, label: __assign(__assign({}, ChartTheme.getAxisDefaults().label), { autoRotate: true }) }),
            groupedCategory: __assign({}, ChartTheme.getAxisDefaults()),
            time: __assign({}, ChartTheme.getAxisDefaults()),
        }, series: {
            column: __assign({}, ChartTheme.getBarSeriesDefaults()),
            bar: __assign({}, ChartTheme.getBarSeriesDefaults()),
            line: __assign(__assign({}, ChartTheme.getLineSeriesDefaults()), { title: undefined, strokeWidth: 2, strokeOpacity: 1, lineDash: [0], lineDashOffset: 0, marker: __assign(__assign({}, ChartTheme.getCartesianSeriesMarkerDefaults()), { fillOpacity: 1, strokeOpacity: 1 }), label: {
                    enabled: false,
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 12,
                    fontFamily: ChartTheme.fontFamily,
                    color: 'rgb(70, 70, 70)',
                    formatter: undefined,
                } }),
            scatter: __assign(__assign({}, ChartTheme.getScatterSeriesDefaults()), { sizeName: 'Size', labelName: 'Label', marker: __assign({}, ChartTheme.getCartesianSeriesMarkerDefaults()), label: {
                    enabled: false,
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 12,
                    fontFamily: ChartTheme.fontFamily,
                    color: 'rgb(70, 70, 70)',
                } }),
            area: __assign(__assign({}, ChartTheme.getAreaSeriesDefaults()), { normalizedTo: undefined, fillOpacity: 0.8, strokeOpacity: 1, strokeWidth: 2, lineDash: [0], lineDashOffset: 0, shadow: {
                    enabled: false,
                    color: 'rgba(0, 0, 0, 0.5)',
                    xOffset: 3,
                    yOffset: 3,
                    blur: 5,
                }, marker: __assign(__assign({}, ChartTheme.getCartesianSeriesMarkerDefaults()), { fillOpacity: 1, strokeOpacity: 1, enabled: false }), label: {
                    enabled: false,
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 12,
                    fontFamily: ChartTheme.fontFamily,
                    color: 'rgb(70, 70, 70)',
                    formatter: undefined,
                } }),
            histogram: __assign(__assign({}, ChartTheme.getSeriesDefaults()), { strokeWidth: 1, fillOpacity: 1, strokeOpacity: 1, lineDash: [0], lineDashOffset: 0, areaPlot: false, bins: undefined, aggregation: 'sum', label: {
                    enabled: false,
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 12,
                    fontFamily: ChartTheme.fontFamily,
                    color: 'rgb(70, 70, 70)',
                    formatter: undefined,
                }, shadow: {
                    enabled: true,
                    color: 'rgba(0, 0, 0, 0.5)',
                    xOffset: 0,
                    yOffset: 0,
                    blur: 5,
                } }),
        } });
    ChartTheme.polarDefaults = __assign(__assign({}, ChartTheme.getChartDefaults()), { series: {
            pie: __assign(__assign({}, ChartTheme.getSeriesDefaults()), { title: {
                    enabled: true,
                    fontStyle: undefined,
                    fontWeight: 'bold',
                    fontSize: 14,
                    fontFamily: ChartTheme.fontFamily,
                    color: 'rgb(70, 70, 70)',
                    spacing: 0,
                }, radiusKey: undefined, radiusName: undefined, calloutLabelKey: undefined, calloutLabelName: undefined, sectorLabelKey: undefined, sectorLabelName: undefined, calloutLabel: {
                    enabled: true,
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 12,
                    fontFamily: ChartTheme.fontFamily,
                    color: 'rgb(70, 70, 70)',
                    offset: 3,
                    minAngle: 0,
                }, sectorLabel: {
                    enabled: true,
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 12,
                    fontFamily: ChartTheme.fontFamily,
                    color: 'rgb(70, 70, 70)',
                    positionOffset: 0,
                    positionRatio: 0.5,
                }, calloutLine: {
                    length: 10,
                    strokeWidth: 2,
                }, fillOpacity: 1, strokeOpacity: 1, strokeWidth: 1, lineDash: [0], lineDashOffset: 0, rotation: 0, outerRadiusOffset: 0, innerRadiusOffset: 0, shadow: {
                    enabled: false,
                    color: 'rgba(0, 0, 0, 0.5)',
                    xOffset: 3,
                    yOffset: 3,
                    blur: 5,
                }, innerLabels: {
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 12,
                    fontFamily: ChartTheme.fontFamily,
                    color: 'rgb(70, 70, 70)',
                    margin: 2,
                } }),
        } });
    ChartTheme.hierarchyDefaults = __assign(__assign({}, ChartTheme.getChartDefaults()), { series: {
            treemap: __assign(__assign({}, ChartTheme.getSeriesDefaults()), { showInLegend: false, labelKey: 'label', sizeKey: 'size', colorKey: 'color', colorDomain: [-5, 5], colorRange: ['#cb4b3f', '#6acb64'], groupFill: '#272931', groupStroke: 'black', groupStrokeWidth: 1, tileStroke: 'black', tileStrokeWidth: 1, gradient: true, tileShadow: {
                    enabled: false,
                    color: 'rgba(0, 0, 0, 0.5)',
                    xOffset: 3,
                    yOffset: 3,
                    blur: 5,
                }, labelShadow: {
                    enabled: true,
                    color: 'rgba(0, 0, 0, 0.4)',
                    xOffset: 1.5,
                    yOffset: 1.5,
                    blur: 5,
                }, highlightGroups: true, nodePadding: 2, nodeGap: 0, title: {
                    enabled: true,
                    color: 'white',
                    fontStyle: undefined,
                    fontWeight: 'bold',
                    fontSize: 12,
                    fontFamily: 'Verdana, sans-serif',
                    padding: 2,
                }, subtitle: {
                    enabled: true,
                    color: 'white',
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 9,
                    fontFamily: 'Verdana, sans-serif',
                    padding: 2,
                }, labels: {
                    large: {
                        enabled: true,
                        fontStyle: undefined,
                        fontWeight: 'bold',
                        fontSize: 18,
                        fontFamily: 'Verdana, sans-serif',
                        color: 'white',
                        wrapping: 'on-space',
                    },
                    medium: {
                        enabled: true,
                        fontStyle: undefined,
                        fontWeight: 'bold',
                        fontSize: 14,
                        fontFamily: 'Verdana, sans-serif',
                        color: 'white',
                        wrapping: 'on-space',
                    },
                    small: {
                        enabled: true,
                        fontStyle: undefined,
                        fontWeight: 'bold',
                        fontSize: 10,
                        fontFamily: 'Verdana, sans-serif',
                        color: 'white',
                        wrapping: 'on-space',
                    },
                    value: {
                        style: {
                            enabled: true,
                            fontStyle: undefined,
                            fontWeight: undefined,
                            fontSize: 12,
                            fontFamily: 'Verdana, sans-serif',
                            color: 'white',
                        },
                    },
                } }),
        } });
    ChartTheme.defaults = {
        cartesian: ChartTheme.cartesianDefaults,
        groupedCategory: ChartTheme.cartesianDefaults,
        polar: ChartTheme.polarDefaults,
        hierarchy: ChartTheme.hierarchyDefaults,
    };
    return ChartTheme;
}());
exports.ChartTheme = ChartTheme;
//# sourceMappingURL=chartTheme.js.map