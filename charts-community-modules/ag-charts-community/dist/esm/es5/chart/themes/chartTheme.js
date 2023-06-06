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
import { jsonMerge, jsonWalk } from '../../util/json';
import { deepMerge } from '../../util/object';
import { CHART_AXES_TYPES, getAxisThemeTemplate } from '../chartAxesTypes';
import { CHART_TYPES, getChartDefaults } from '../factory/chartTypes';
import { getSeriesThemeTemplate } from '../factory/seriesTypes';
var palette = {
    fills: ['#f3622d', '#fba71b', '#57b757', '#41a9c9', '#4258c9', '#9a42c8', '#c84164', '#888888'],
    strokes: ['#aa4520', '#b07513', '#3d803d', '#2d768d', '#2e3e8d', '#6c2e8c', '#8c2d46', '#5f5f5f'],
};
export var EXTENDS_SERIES_DEFAULTS = Symbol('extends-series-defaults');
export var OVERRIDE_SERIES_LABEL_DEFAULTS = Symbol('override-series-label-defaults');
export var DEFAULT_FONT_FAMILY = Symbol('default-font');
var BOLD = 'bold';
var INSIDE = 'inside';
var BOTTOM = 'bottom';
var ChartTheme = /** @class */ (function () {
    function ChartTheme(options) {
        options = deepMerge({}, options !== null && options !== void 0 ? options : {});
        var _a = options.overrides, overrides = _a === void 0 ? null : _a, _b = options.palette, palette = _b === void 0 ? null : _b;
        var defaults = this.createChartConfigPerChartType(this.getDefaults());
        if (overrides) {
            var common = overrides.common, cartesian = overrides.cartesian, polar = overrides.polar, hierarchy = overrides.hierarchy;
            var applyOverrides = function (type, seriesTypes, overrideOpts) {
                if (overrideOpts) {
                    defaults[type] = deepMerge(defaults[type], overrideOpts);
                    seriesTypes.forEach(function (s) {
                        var seriesType = s;
                        defaults[seriesType] = deepMerge(defaults[seriesType], overrideOpts);
                    });
                }
            };
            applyOverrides('common', Object.keys(defaults), common);
            applyOverrides('cartesian', CHART_TYPES.cartesianTypes, cartesian);
            applyOverrides('polar', CHART_TYPES.polarTypes, polar);
            applyOverrides('hierarchy', CHART_TYPES.hierarchyTypes, hierarchy);
            CHART_TYPES.seriesTypes.forEach(function (s) {
                var _a;
                var seriesType = s;
                var chartConfig = overrides[seriesType];
                if (chartConfig) {
                    if (chartConfig.series) {
                        chartConfig.series = (_a = {}, _a[seriesType] = chartConfig.series, _a);
                    }
                    defaults[seriesType] = deepMerge(defaults[seriesType], chartConfig);
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
            thickness: 0,
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
            cartesian: CHART_TYPES.cartesianTypes,
            polar: CHART_TYPES.polarTypes,
            hierarchy: CHART_TYPES.hierarchyTypes,
            groupedCategory: [],
        };
        Object.entries(typeToAliases).forEach(function (_a) {
            var _b = __read(_a, 2), nextType = _b[0], aliases = _b[1];
            var type = nextType;
            var typeDefaults = _this.templateTheme(getChartDefaults(type));
            aliases.forEach(function (next) {
                var alias = next;
                if (!config[alias]) {
                    config[alias] = deepMerge({}, config[type]);
                    deepMerge(config[alias], typeDefaults);
                }
            });
        });
        return config;
    };
    ChartTheme.prototype.getDefaults = function () {
        var _this = this;
        var defaults = deepMerge({}, ChartTheme.defaults);
        var getOverridesByType = function (chartType, seriesTypes) {
            var result = _this.templateTheme(getChartDefaults(chartType));
            result.series = seriesTypes.reduce(function (obj, seriesType) {
                var template = getSeriesThemeTemplate(seriesType);
                if (template) {
                    obj[seriesType] = _this.templateTheme(template);
                }
                return obj;
            }, {});
            if (chartType === 'cartesian') {
                result.axes = CHART_AXES_TYPES.axesTypes.reduce(function (obj, axisType) {
                    var template = getAxisThemeTemplate(axisType);
                    if (template) {
                        obj[axisType] = _this.templateTheme(template);
                    }
                    return obj;
                }, {});
            }
            return result;
        };
        var extension = {
            cartesian: getOverridesByType('cartesian', CHART_TYPES.cartesianTypes),
            groupedCategory: getOverridesByType('cartesian', CHART_TYPES.cartesianTypes),
            polar: getOverridesByType('polar', CHART_TYPES.polarTypes),
            hierarchy: getOverridesByType('hierarchy', CHART_TYPES.hierarchyTypes),
        };
        return deepMerge(defaults, extension);
    };
    ChartTheme.prototype.templateTheme = function (themeTemplate) {
        var themeInstance = jsonMerge([themeTemplate]);
        var _a = this.getTemplateParameters(), extensions = _a.extensions, properties = _a.properties;
        jsonWalk(themeInstance, function (_, node) {
            var e_1, _a;
            if (node['__extends__']) {
                var key = node['__extends__'];
                var source = extensions.get(key);
                if (source == null) {
                    throw new Error('AG Charts - no template variable provided for: ' + key);
                }
                Object.assign(node, source, node);
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
        extensions.set(EXTENDS_SERIES_DEFAULTS, ChartTheme.getSeriesDefaults());
        extensions.set(OVERRIDE_SERIES_LABEL_DEFAULTS, {});
        var properties = new Map();
        properties.set(DEFAULT_FONT_FAMILY, ChartTheme.fontFamily);
        return {
            extensions: extensions,
            properties: properties,
        };
    };
    ChartTheme.prototype.mergeWithParentDefaults = function (parentDefaults, defaults) {
        return deepMerge(parentDefaults, defaults);
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
                    padding: 15,
                }, subtitle: {
                    enabled: true,
                    color: 'white',
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 9,
                    fontFamily: 'Verdana, sans-serif',
                    padding: 13,
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
export { ChartTheme };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRUaGVtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC90aGVtZXMvY2hhcnRUaGVtZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDdEQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBaUI5QyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMzRSxPQUFPLEVBQWEsV0FBVyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDakYsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFaEUsSUFBTSxPQUFPLEdBQXdCO0lBQ2pDLEtBQUssRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUM7SUFDL0YsT0FBTyxFQUFFLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQztDQUNwRyxDQUFDO0FBV0YsTUFBTSxDQUFDLElBQU0sdUJBQXVCLEdBQUcsTUFBTSxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDekUsTUFBTSxDQUFDLElBQU0sOEJBQThCLEdBQUcsTUFBTSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7QUFDdkYsTUFBTSxDQUFDLElBQU0sbUJBQW1CLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBRTFELElBQU0sSUFBSSxHQUFlLE1BQU0sQ0FBQztBQUNoQyxJQUFNLE1BQU0sR0FBeUMsUUFBUSxDQUFDO0FBQzlELElBQU0sTUFBTSxHQUEwQixRQUFRLENBQUM7QUFDL0M7SUFta0JJLG9CQUFZLE9BQTZCO1FBQ3JDLE9BQU8sR0FBRyxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sYUFBUCxPQUFPLGNBQVAsT0FBTyxHQUFJLEVBQUUsQ0FBd0IsQ0FBQztRQUN0RCxJQUFBLEtBQXFDLE9BQU8sVUFBNUIsRUFBaEIsU0FBUyxtQkFBRyxJQUFJLEtBQUEsRUFBRSxLQUFtQixPQUFPLFFBQVosRUFBZCxPQUFPLG1CQUFHLElBQUksS0FBQSxDQUFhO1FBRXJELElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUV4RSxJQUFJLFNBQVMsRUFBRTtZQUNILElBQUEsTUFBTSxHQUFrQyxTQUFTLE9BQTNDLEVBQUUsU0FBUyxHQUF1QixTQUFTLFVBQWhDLEVBQUUsS0FBSyxHQUFnQixTQUFTLE1BQXpCLEVBQUUsU0FBUyxHQUFLLFNBQVMsVUFBZCxDQUFlO1lBRTFELElBQU0sY0FBYyxHQUFHLFVBQ25CLElBQU8sRUFDUCxXQUFxQixFQUNyQixZQUFzQztnQkFFdEMsSUFBSSxZQUFZLEVBQUU7b0JBQ2QsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7b0JBQ3pELFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQyxDQUFDO3dCQUNsQixJQUFNLFVBQVUsR0FBRyxDQUFnQyxDQUFDO3dCQUNwRCxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztvQkFDekUsQ0FBQyxDQUFDLENBQUM7aUJBQ047WUFDTCxDQUFDLENBQUM7WUFDRixjQUFjLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDakUsY0FBYyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ25FLGNBQWMsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN2RCxjQUFjLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFbkUsV0FBVyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQyxDQUFDOztnQkFDOUIsSUFBTSxVQUFVLEdBQUcsQ0FBZ0MsQ0FBQztnQkFDcEQsSUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLFdBQVcsRUFBRTtvQkFDYixJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUU7d0JBQ3BCLFdBQVcsQ0FBQyxNQUFNLGFBQUssR0FBQyxVQUFVLElBQUcsV0FBVyxDQUFDLE1BQU0sS0FBRSxDQUFDO3FCQUM3RDtvQkFDRCxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDdkU7WUFDTCxDQUFDLENBQUMsQ0FBQztTQUNOO1FBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLGFBQVAsT0FBTyxjQUFQLE9BQU8sR0FBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFNUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUF6bUJTLCtCQUFVLEdBQXBCO1FBQ0ksT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQU1jLDBCQUFlLEdBQTlCO1FBQ0ksT0FBTztZQUNILEdBQUcsRUFBRSxFQUFFO1lBQ1AsS0FBSyxFQUFFLEVBQUU7WUFDVCxNQUFNLEVBQUUsRUFBRTtZQUNWLElBQUksRUFBRSxFQUFFO1lBQ1IsU0FBUyxFQUFFLENBQUM7WUFDWixLQUFLLEVBQUU7Z0JBQ0gsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsSUFBSSxFQUFFLFlBQVk7Z0JBQ2xCLFNBQVMsRUFBRSxTQUFTO2dCQUNwQixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO2dCQUMzQixLQUFLLEVBQUUsaUJBQWlCO2FBQzNCO1lBQ0QsS0FBSyxFQUFFO2dCQUNILFNBQVMsRUFBRSxTQUFTO2dCQUNwQixVQUFVLEVBQUUsU0FBUztnQkFDckIsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO2dCQUMzQixPQUFPLEVBQUUsQ0FBQztnQkFDVixRQUFRLEVBQUUsU0FBUztnQkFDbkIsS0FBSyxFQUFFLGlCQUFpQjtnQkFDeEIsU0FBUyxFQUFFLFNBQVM7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixlQUFlLEVBQUUsSUFBSTthQUN4QjtZQUNELElBQUksRUFBRTtnQkFDRixLQUFLLEVBQUUsQ0FBQztnQkFDUixLQUFLLEVBQUUsb0JBQW9CO2FBQzlCO1lBQ0QsSUFBSSxFQUFFO2dCQUNGLEtBQUssRUFBRSxDQUFDO2dCQUNSLElBQUksRUFBRSxDQUFDO2dCQUNQLEtBQUssRUFBRSxvQkFBb0I7YUFDOUI7WUFDRCxTQUFTLEVBQUU7Z0JBQ1A7b0JBQ0ksTUFBTSxFQUFFLG9CQUFvQjtvQkFDNUIsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDbkI7YUFDSjtZQUNELFVBQVUsRUFBRTtnQkFDUixPQUFPLEVBQUUsS0FBSztnQkFDZCxJQUFJLEVBQUUsa0JBQWtCO2dCQUN4QixNQUFNLEVBQUUsaUJBQWlCO2dCQUN6QixXQUFXLEVBQUUsQ0FBQztnQkFDZCxLQUFLLEVBQUU7b0JBQ0gsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsU0FBUyxFQUFFLFNBQVM7b0JBQ3BCLFVBQVUsRUFBRSxTQUFTO29CQUNyQixRQUFRLEVBQUUsRUFBRTtvQkFDWixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7b0JBQzNCLE9BQU8sRUFBRSxDQUFDO29CQUNWLEtBQUssRUFBRSxpQkFBaUI7b0JBQ3hCLFFBQVEsRUFBRSxTQUFTO2lCQUN0QjthQUNKO1NBQ0osQ0FBQztJQUNOLENBQUM7SUFFTSw0QkFBaUIsR0FBeEI7UUFDSSxPQUFPO1lBQ0gsT0FBTyxFQUFFO2dCQUNMLE9BQU8sRUFBRSxJQUFJO2dCQUNiLFFBQVEsRUFBRSxTQUFTO2FBQ3RCO1lBQ0QsT0FBTyxFQUFFLElBQUk7WUFDYixZQUFZLEVBQUUsSUFBSTtZQUNsQixjQUFjLEVBQUU7Z0JBQ1osSUFBSSxFQUFFO29CQUNGLElBQUksRUFBRSxRQUFRO29CQUNkLFdBQVcsRUFBRSxDQUFDO2lCQUNqQjtnQkFDRCxNQUFNLEVBQUU7b0JBQ0osVUFBVSxFQUFFLENBQUM7aUJBQ2hCO2dCQUNELElBQUksRUFBRTtvQkFDRixLQUFLLEVBQUUsT0FBTztpQkFDakI7YUFDSjtZQUNELGNBQWMsRUFBRSxPQUFrQztTQUNyRCxDQUFDO0lBQ04sQ0FBQztJQUVjLCtCQUFvQixHQUFuQztRQUNJLDZCQUNPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxLQUMzQixXQUFXLEVBQUUsQ0FBQyxFQUNkLGFBQWEsRUFBRSxDQUFDLEVBQ2hCLFlBQVksRUFBRSxTQUFTLEVBQ3ZCLFdBQVcsRUFBRSxDQUFDLEVBQ2QsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQ2IsY0FBYyxFQUFFLENBQUMsRUFDakIsS0FBSyxFQUFFO2dCQUNILE9BQU8sRUFBRSxLQUFLO2dCQUNkLFNBQVMsRUFBRSxTQUFTO2dCQUNwQixVQUFVLEVBQUUsU0FBUztnQkFDckIsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO2dCQUMzQixLQUFLLEVBQUUsaUJBQWlCO2dCQUN4QixTQUFTLEVBQUUsU0FBUztnQkFDcEIsU0FBUyxFQUFFLE1BQU07YUFDcEIsRUFDRCxNQUFNLEVBQUU7Z0JBQ0osT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsS0FBSyxFQUFFLG9CQUFvQjtnQkFDM0IsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsSUFBSSxFQUFFLENBQUM7YUFDVixJQUNIO0lBQ04sQ0FBQztJQUVjLGdDQUFxQixHQUFwQztRQUNJLElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ2hELDZCQUNPLGNBQWMsS0FDakIsT0FBTyx3QkFDQSxjQUFjLENBQUMsT0FBTyxLQUN6QixNQUFNLEVBQUUsU0FBUyxFQUNqQixRQUFRLEVBQUU7b0JBQ04sSUFBSSxFQUFFLE1BQStCO2lCQUN4QyxPQUVQO0lBQ04sQ0FBQztJQUVjLGdDQUFxQixHQUFwQztRQUNJLElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ2hELDZCQUNPLGNBQWMsS0FDakIsY0FBYyxFQUFFLFNBQW9DLEVBQ3BELE9BQU8sd0JBQ0EsY0FBYyxDQUFDLE9BQU8sS0FDekIsUUFBUSxFQUFFO29CQUNOLElBQUksRUFBRSxNQUErQjtpQkFDeEMsT0FFUDtJQUNOLENBQUM7SUFFYyxtQ0FBd0IsR0FBdkM7UUFDSSxJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUNoRCw2QkFDTyxjQUFjLEtBQ2pCLE9BQU8sd0JBQ0EsY0FBYyxDQUFDLE9BQU8sS0FDekIsUUFBUSxFQUFFO29CQUNOLElBQUksRUFBRSxNQUErQjtpQkFDeEMsT0FFUDtJQUNOLENBQUM7SUFFYywyQ0FBZ0MsR0FBL0M7UUFDSSxPQUFPO1lBQ0gsT0FBTyxFQUFFLElBQUk7WUFDYixLQUFLLEVBQUUsUUFBUTtZQUNmLElBQUksRUFBRSxDQUFDO1lBQ1AsT0FBTyxFQUFFLEVBQUU7WUFDWCxXQUFXLEVBQUUsQ0FBQztZQUNkLFNBQVMsRUFBRSxTQUFTO1NBQ3ZCLENBQUM7SUFDTixDQUFDO0lBRWMscUNBQTBCLEdBQXpDO1FBQ0ksT0FBTyxXQUFvQixDQUFDO0lBQ2hDLENBQUM7SUFFYywyQkFBZ0IsR0FBL0I7UUFDSSxPQUFPO1lBQ0gsVUFBVSxFQUFFO2dCQUNSLE9BQU8sRUFBRSxJQUFJO2dCQUNiLElBQUksRUFBRSxPQUFPO2FBQ2hCO1lBQ0QsT0FBTyxFQUFFO2dCQUNMLEdBQUcsRUFBRSxFQUFFO2dCQUNQLEtBQUssRUFBRSxFQUFFO2dCQUNULE1BQU0sRUFBRSxFQUFFO2dCQUNWLElBQUksRUFBRSxFQUFFO2FBQ1g7WUFDRCxLQUFLLEVBQUU7Z0JBQ0gsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsU0FBUyxFQUFFLFNBQVM7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixRQUFRLEVBQUUsRUFBRTtnQkFDWixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7Z0JBQzNCLEtBQUssRUFBRSxpQkFBaUI7Z0JBQ3hCLFFBQVEsRUFBRSxVQUFVLENBQUMsMEJBQTBCLEVBQUU7YUFDcEQ7WUFDRCxRQUFRLEVBQUU7Z0JBQ04sT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLFNBQVMsRUFBRSxTQUFTO2dCQUNwQixVQUFVLEVBQUUsU0FBUztnQkFDckIsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO2dCQUMzQixLQUFLLEVBQUUsb0JBQW9CO2dCQUMzQixRQUFRLEVBQUUsVUFBVSxDQUFDLDBCQUEwQixFQUFFO2FBQ3BEO1lBQ0QsUUFBUSxFQUFFO2dCQUNOLE9BQU8sRUFBRSxLQUFLO2dCQUNkLElBQUksRUFBRSxVQUFVO2dCQUNoQixTQUFTLEVBQUUsU0FBUztnQkFDcEIsVUFBVSxFQUFFLFNBQVM7Z0JBQ3JCLFFBQVEsRUFBRSxFQUFFO2dCQUNaLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtnQkFDM0IsS0FBSyxFQUFFLG9CQUFvQjtnQkFDM0IsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsUUFBUSxFQUFFLFVBQVUsQ0FBQywwQkFBMEIsRUFBRTthQUNwRDtZQUNELE1BQU0sRUFBRTtnQkFDSixRQUFRLEVBQUUsTUFBTTtnQkFDaEIsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsU0FBUyxFQUFFLEVBQUU7Z0JBQ2IsSUFBSSxFQUFFO29CQUNGLFFBQVEsRUFBRSxFQUFFO29CQUNaLFFBQVEsRUFBRSxDQUFDO29CQUNYLE1BQU0sRUFBRTt3QkFDSixLQUFLLEVBQUUsU0FBUzt3QkFDaEIsSUFBSSxFQUFFLEVBQUU7d0JBQ1IsV0FBVyxFQUFFLENBQUM7d0JBQ2QsT0FBTyxFQUFFLENBQUM7cUJBQ2I7b0JBQ0QsS0FBSyxFQUFFO3dCQUNILEtBQUssRUFBRSxPQUFPO3dCQUNkLFNBQVMsRUFBRSxTQUFTO3dCQUNwQixVQUFVLEVBQUUsU0FBUzt3QkFDckIsUUFBUSxFQUFFLEVBQUU7d0JBQ1osVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO3dCQUMzQixTQUFTLEVBQUUsU0FBUztxQkFDdkI7aUJBQ0o7Z0JBQ0QsWUFBWSxFQUFFLEtBQUs7Z0JBQ25CLFVBQVUsRUFBRTtvQkFDUixNQUFNLEVBQUU7d0JBQ0osSUFBSSxFQUFFLEVBQUU7cUJBQ1g7b0JBQ0QsV0FBVyxFQUFFO3dCQUNULElBQUksRUFBRSxpQkFBaUI7cUJBQzFCO29CQUNELGFBQWEsRUFBRTt3QkFDWCxJQUFJLEVBQUUsb0JBQW9CO3FCQUM3QjtvQkFDRCxjQUFjLEVBQUU7d0JBQ1osSUFBSSxFQUFFLGlCQUFpQjtxQkFDMUI7b0JBQ0QsS0FBSyxFQUFFO3dCQUNILEtBQUssRUFBRSxpQkFBaUI7cUJBQzNCO2lCQUNKO2FBQ0o7WUFDRCxPQUFPLEVBQUU7Z0JBQ0wsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsS0FBSyxFQUFFLFNBQW9DO2dCQUMzQyxLQUFLLEVBQUUsQ0FBQzthQUNYO1lBQ0QsU0FBUyxFQUFFLEVBQUU7U0FDaEIsQ0FBQztJQUNOLENBQUM7SUE2Vk8sa0RBQTZCLEdBQXJDLFVBQXNDLE1BQTBCO1FBQWhFLGlCQXFCQztRQXBCRyxJQUFNLGFBQWEsR0FBRztZQUNsQixTQUFTLEVBQUUsV0FBVyxDQUFDLGNBQWM7WUFDckMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxVQUFVO1lBQzdCLFNBQVMsRUFBRSxXQUFXLENBQUMsY0FBYztZQUNyQyxlQUFlLEVBQUUsRUFBRTtTQUN0QixDQUFDO1FBQ0YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFtQjtnQkFBbkIsS0FBQSxhQUFtQixFQUFsQixRQUFRLFFBQUEsRUFBRSxPQUFPLFFBQUE7WUFDckQsSUFBTSxJQUFJLEdBQUcsUUFBcUIsQ0FBQztZQUNuQyxJQUFNLFlBQVksR0FBRyxLQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFRLENBQUM7WUFFdkUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUk7Z0JBQ2pCLElBQU0sS0FBSyxHQUFHLElBQWdDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ2hCLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxTQUFTLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUM1QyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO2lCQUMxQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLE1BQStCLENBQUM7SUFDM0MsQ0FBQztJQUVTLGdDQUFXLEdBQXJCO1FBQUEsaUJBK0JDO1FBOUJHLElBQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BELElBQU0sa0JBQWtCLEdBQUcsVUFBQyxTQUFvQixFQUFFLFdBQXFCO1lBQ25FLElBQU0sTUFBTSxHQUFHLEtBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQVEsQ0FBQztZQUN0RSxNQUFNLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBQyxHQUFHLEVBQUUsVUFBVTtnQkFDL0MsSUFBTSxRQUFRLEdBQUcsc0JBQXNCLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3BELElBQUksUUFBUSxFQUFFO29CQUNWLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxLQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNsRDtnQkFDRCxPQUFPLEdBQUcsQ0FBQztZQUNmLENBQUMsRUFBRSxFQUF5QixDQUFDLENBQUM7WUFFOUIsSUFBSSxTQUFTLEtBQUssV0FBVyxFQUFFO2dCQUMzQixNQUFNLENBQUMsSUFBSSxHQUFHLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBQyxHQUFHLEVBQUUsUUFBUTtvQkFDMUQsSUFBTSxRQUFRLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ2hELElBQUksUUFBUSxFQUFFO3dCQUNWLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxLQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3FCQUNoRDtvQkFDRCxPQUFPLEdBQUcsQ0FBQztnQkFDZixDQUFDLEVBQUUsRUFBeUIsQ0FBQyxDQUFDO2FBQ2pDO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQyxDQUFDO1FBRUYsSUFBTSxTQUFTLEdBQUc7WUFDZCxTQUFTLEVBQUUsa0JBQWtCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxjQUFjLENBQUM7WUFDdEUsZUFBZSxFQUFFLGtCQUFrQixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsY0FBYyxDQUFDO1lBQzVFLEtBQUssRUFBRSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQztZQUMxRCxTQUFTLEVBQUUsa0JBQWtCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxjQUFjLENBQUM7U0FDekUsQ0FBQztRQUNGLE9BQU8sU0FBUyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRVMsa0NBQWEsR0FBdkIsVUFBd0IsYUFBaUI7UUFDckMsSUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUMzQyxJQUFBLEtBQTZCLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUF2RCxVQUFVLGdCQUFBLEVBQUUsVUFBVSxnQkFBaUMsQ0FBQztRQUVoRSxRQUFRLENBQ0osYUFBYSxFQUNiLFVBQUMsQ0FBQyxFQUFFLElBQUk7O1lBQ0osSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQ3JCLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDaEMsSUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbkMsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO29CQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLGlEQUFpRCxHQUFHLEdBQUcsQ0FBQyxDQUFDO2lCQUM1RTtnQkFDRCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2xDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQzlCO1lBQ0QsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUU7Z0JBQ3ZCLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDbEMsSUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbkMsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO29CQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLGlEQUFpRCxHQUFHLEdBQUcsQ0FBQyxDQUFDO2lCQUM1RTtnQkFDRCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDNUIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDaEM7O2dCQUNELEtBQTRCLElBQUEsS0FBQSxTQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUEsZ0JBQUEsNEJBQUU7b0JBQXZDLElBQUEsS0FBQSxtQkFBYSxFQUFaLE1BQUksUUFBQSxFQUFFLEtBQUssUUFBQTtvQkFDbkIsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO3dCQUN2QixJQUFJLENBQUMsTUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDdEM7aUJBQ0o7Ozs7Ozs7OztRQUNMLENBQUMsRUFDRCxFQUFFLENBQ0wsQ0FBQztRQUVGLE9BQU8sYUFBYSxDQUFDO0lBQ3pCLENBQUM7SUFFUywwQ0FBcUIsR0FBL0I7UUFDSSxJQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzdCLFVBQVUsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsVUFBVSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztRQUN4RSxVQUFVLENBQUMsR0FBRyxDQUFDLDhCQUE4QixFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRW5ELElBQU0sVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDN0IsVUFBVSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFM0QsT0FBTztZQUNILFVBQVUsWUFBQTtZQUNWLFVBQVUsWUFBQTtTQUNiLENBQUM7SUFDTixDQUFDO0lBRVMsNENBQXVCLEdBQWpDLFVBQ0ksY0FBa0MsRUFDbEMsUUFBNEI7UUFFNUIsT0FBTyxTQUFTLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFydEJNLHFCQUFVLEdBQUcscUJBQXFCLENBQUM7SUEwUWxCLDRCQUFpQix5QkFDbEMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLEtBQ2hDLElBQUksRUFBRTtZQUNGLE1BQU0sZUFDQyxVQUFVLENBQUMsZUFBZSxFQUFFLENBQ2xDO1lBQ0QsR0FBRyx3QkFDSSxVQUFVLENBQUMsZUFBZSxFQUFFLEtBQy9CLElBQUksRUFBRSxFQUFFLEdBQ1g7WUFDRCxRQUFRLHdCQUNELFVBQVUsQ0FBQyxlQUFlLEVBQUUsS0FDL0IsaUJBQWlCLEVBQUUsR0FBRyxFQUN0QixLQUFLLHdCQUNFLFVBQVUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxLQUFLLEtBQ3JDLFVBQVUsRUFBRSxJQUFJLE1BRXZCO1lBQ0QsZUFBZSxlQUNSLFVBQVUsQ0FBQyxlQUFlLEVBQUUsQ0FDbEM7WUFDRCxJQUFJLGVBQ0csVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUNsQztTQUNKLEVBQ0QsTUFBTSxFQUFFO1lBQ0osTUFBTSxlQUNDLFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxDQUN2QztZQUNELEdBQUcsZUFDSSxVQUFVLENBQUMsb0JBQW9CLEVBQUUsQ0FDdkM7WUFDRCxJQUFJLHdCQUNHLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxLQUNyQyxLQUFLLEVBQUUsU0FBUyxFQUNoQixXQUFXLEVBQUUsQ0FBQyxFQUNkLGFBQWEsRUFBRSxDQUFDLEVBQ2hCLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUNiLGNBQWMsRUFBRSxDQUFDLEVBQ2pCLE1BQU0sd0JBQ0MsVUFBVSxDQUFDLGdDQUFnQyxFQUFFLEtBQ2hELFdBQVcsRUFBRSxDQUFDLEVBQ2QsYUFBYSxFQUFFLENBQUMsS0FFcEIsS0FBSyxFQUFFO29CQUNILE9BQU8sRUFBRSxLQUFLO29CQUNkLFNBQVMsRUFBRSxTQUFTO29CQUNwQixVQUFVLEVBQUUsU0FBUztvQkFDckIsUUFBUSxFQUFFLEVBQUU7b0JBQ1osVUFBVSxFQUFFLFVBQVUsQ0FBQyxVQUFVO29CQUNqQyxLQUFLLEVBQUUsaUJBQWlCO29CQUN4QixTQUFTLEVBQUUsU0FBUztpQkFDdkIsR0FDSjtZQUNELE9BQU8sd0JBQ0EsVUFBVSxDQUFDLHdCQUF3QixFQUFFLEtBQ3hDLFFBQVEsRUFBRSxNQUFNLEVBQ2hCLFNBQVMsRUFBRSxPQUFPLEVBQ2xCLE1BQU0sZUFDQyxVQUFVLENBQUMsZ0NBQWdDLEVBQUUsR0FFcEQsS0FBSyxFQUFFO29CQUNILE9BQU8sRUFBRSxLQUFLO29CQUNkLFNBQVMsRUFBRSxTQUFTO29CQUNwQixVQUFVLEVBQUUsU0FBUztvQkFDckIsUUFBUSxFQUFFLEVBQUU7b0JBQ1osVUFBVSxFQUFFLFVBQVUsQ0FBQyxVQUFVO29CQUNqQyxLQUFLLEVBQUUsaUJBQWlCO2lCQUMzQixHQUNKO1lBQ0QsSUFBSSx3QkFDRyxVQUFVLENBQUMscUJBQXFCLEVBQUUsS0FDckMsWUFBWSxFQUFFLFNBQVMsRUFDdkIsV0FBVyxFQUFFLEdBQUcsRUFDaEIsYUFBYSxFQUFFLENBQUMsRUFDaEIsV0FBVyxFQUFFLENBQUMsRUFDZCxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDYixjQUFjLEVBQUUsQ0FBQyxFQUNqQixNQUFNLEVBQUU7b0JBQ0osT0FBTyxFQUFFLEtBQUs7b0JBQ2QsS0FBSyxFQUFFLG9CQUFvQjtvQkFDM0IsT0FBTyxFQUFFLENBQUM7b0JBQ1YsT0FBTyxFQUFFLENBQUM7b0JBQ1YsSUFBSSxFQUFFLENBQUM7aUJBQ1YsRUFDRCxNQUFNLHdCQUNDLFVBQVUsQ0FBQyxnQ0FBZ0MsRUFBRSxLQUNoRCxXQUFXLEVBQUUsQ0FBQyxFQUNkLGFBQWEsRUFBRSxDQUFDLEVBQ2hCLE9BQU8sRUFBRSxLQUFLLEtBRWxCLEtBQUssRUFBRTtvQkFDSCxPQUFPLEVBQUUsS0FBSztvQkFDZCxTQUFTLEVBQUUsU0FBUztvQkFDcEIsVUFBVSxFQUFFLFNBQVM7b0JBQ3JCLFFBQVEsRUFBRSxFQUFFO29CQUNaLFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVTtvQkFDakMsS0FBSyxFQUFFLGlCQUFpQjtvQkFDeEIsU0FBUyxFQUFFLFNBQVM7aUJBQ3ZCLEdBQ0o7WUFDRCxTQUFTLHdCQUNGLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxLQUNqQyxXQUFXLEVBQUUsQ0FBQyxFQUNkLFdBQVcsRUFBRSxDQUFDLEVBQ2QsYUFBYSxFQUFFLENBQUMsRUFDaEIsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQ2IsY0FBYyxFQUFFLENBQUMsRUFDakIsUUFBUSxFQUFFLEtBQUssRUFDZixJQUFJLEVBQUUsU0FBUyxFQUNmLFdBQVcsRUFBRSxLQUFLLEVBQ2xCLEtBQUssRUFBRTtvQkFDSCxPQUFPLEVBQUUsS0FBSztvQkFDZCxTQUFTLEVBQUUsU0FBUztvQkFDcEIsVUFBVSxFQUFFLFNBQVM7b0JBQ3JCLFFBQVEsRUFBRSxFQUFFO29CQUNaLFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVTtvQkFDakMsS0FBSyxFQUFFLGlCQUFpQjtvQkFDeEIsU0FBUyxFQUFFLFNBQVM7aUJBQ3ZCLEVBQ0QsTUFBTSxFQUFFO29CQUNKLE9BQU8sRUFBRSxJQUFJO29CQUNiLEtBQUssRUFBRSxvQkFBb0I7b0JBQzNCLE9BQU8sRUFBRSxDQUFDO29CQUNWLE9BQU8sRUFBRSxDQUFDO29CQUNWLElBQUksRUFBRSxDQUFDO2lCQUNWLEdBQ0o7U0FDSixJQUNIO0lBRXNCLHdCQUFhLHlCQUM5QixVQUFVLENBQUMsZ0JBQWdCLEVBQUUsS0FDaEMsTUFBTSxFQUFFO1lBQ0osR0FBRyx3QkFDSSxVQUFVLENBQUMsaUJBQWlCLEVBQUUsS0FDakMsS0FBSyxFQUFFO29CQUNILE9BQU8sRUFBRSxJQUFJO29CQUNiLFNBQVMsRUFBRSxTQUFTO29CQUNwQixVQUFVLEVBQUUsTUFBTTtvQkFDbEIsUUFBUSxFQUFFLEVBQUU7b0JBQ1osVUFBVSxFQUFFLFVBQVUsQ0FBQyxVQUFVO29CQUNqQyxLQUFLLEVBQUUsaUJBQWlCO29CQUN4QixPQUFPLEVBQUUsQ0FBQztpQkFDYixFQUNELFNBQVMsRUFBRSxTQUFTLEVBQ3BCLFVBQVUsRUFBRSxTQUFTLEVBQ3JCLGVBQWUsRUFBRSxTQUFTLEVBQzFCLGdCQUFnQixFQUFFLFNBQVMsRUFDM0IsY0FBYyxFQUFFLFNBQVMsRUFDekIsZUFBZSxFQUFFLFNBQVMsRUFDMUIsWUFBWSxFQUFFO29CQUNWLE9BQU8sRUFBRSxJQUFJO29CQUNiLFNBQVMsRUFBRSxTQUFTO29CQUNwQixVQUFVLEVBQUUsU0FBUztvQkFDckIsUUFBUSxFQUFFLEVBQUU7b0JBQ1osVUFBVSxFQUFFLFVBQVUsQ0FBQyxVQUFVO29CQUNqQyxLQUFLLEVBQUUsaUJBQWlCO29CQUN4QixNQUFNLEVBQUUsQ0FBQztvQkFDVCxRQUFRLEVBQUUsQ0FBQztpQkFDZCxFQUNELFdBQVcsRUFBRTtvQkFDVCxPQUFPLEVBQUUsSUFBSTtvQkFDYixTQUFTLEVBQUUsU0FBUztvQkFDcEIsVUFBVSxFQUFFLFNBQVM7b0JBQ3JCLFFBQVEsRUFBRSxFQUFFO29CQUNaLFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVTtvQkFDakMsS0FBSyxFQUFFLGlCQUFpQjtvQkFDeEIsY0FBYyxFQUFFLENBQUM7b0JBQ2pCLGFBQWEsRUFBRSxHQUFHO2lCQUNyQixFQUNELFdBQVcsRUFBRTtvQkFDVCxNQUFNLEVBQUUsRUFBRTtvQkFDVixXQUFXLEVBQUUsQ0FBQztpQkFDakIsRUFDRCxXQUFXLEVBQUUsQ0FBQyxFQUNkLGFBQWEsRUFBRSxDQUFDLEVBQ2hCLFdBQVcsRUFBRSxDQUFDLEVBQ2QsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQ2IsY0FBYyxFQUFFLENBQUMsRUFDakIsUUFBUSxFQUFFLENBQUMsRUFDWCxpQkFBaUIsRUFBRSxDQUFDLEVBQ3BCLGlCQUFpQixFQUFFLENBQUMsRUFDcEIsTUFBTSxFQUFFO29CQUNKLE9BQU8sRUFBRSxLQUFLO29CQUNkLEtBQUssRUFBRSxvQkFBb0I7b0JBQzNCLE9BQU8sRUFBRSxDQUFDO29CQUNWLE9BQU8sRUFBRSxDQUFDO29CQUNWLElBQUksRUFBRSxDQUFDO2lCQUNWLEVBQ0QsV0FBVyxFQUFFO29CQUNULFNBQVMsRUFBRSxTQUFTO29CQUNwQixVQUFVLEVBQUUsU0FBUztvQkFDckIsUUFBUSxFQUFFLEVBQUU7b0JBQ1osVUFBVSxFQUFFLFVBQVUsQ0FBQyxVQUFVO29CQUNqQyxLQUFLLEVBQUUsaUJBQWlCO29CQUN4QixNQUFNLEVBQUUsQ0FBQztpQkFDWixHQUNKO1NBQ0osSUFDSDtJQUVzQiw0QkFBaUIseUJBQ2xDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxLQUNoQyxNQUFNLEVBQUU7WUFDSixPQUFPLHdCQUNBLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxLQUNqQyxZQUFZLEVBQUUsS0FBSyxFQUNuQixRQUFRLEVBQUUsT0FBTyxFQUNqQixPQUFPLEVBQUUsTUFBTSxFQUNmLFFBQVEsRUFBRSxPQUFPLEVBQ2pCLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNwQixVQUFVLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQ2xDLFNBQVMsRUFBRSxTQUFTLEVBQ3BCLFdBQVcsRUFBRSxPQUFPLEVBQ3BCLGdCQUFnQixFQUFFLENBQUMsRUFDbkIsVUFBVSxFQUFFLE9BQU8sRUFDbkIsZUFBZSxFQUFFLENBQUMsRUFDbEIsUUFBUSxFQUFFLElBQUksRUFDZCxVQUFVLEVBQUU7b0JBQ1IsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsS0FBSyxFQUFFLG9CQUFvQjtvQkFDM0IsT0FBTyxFQUFFLENBQUM7b0JBQ1YsT0FBTyxFQUFFLENBQUM7b0JBQ1YsSUFBSSxFQUFFLENBQUM7aUJBQ1YsRUFDRCxXQUFXLEVBQUU7b0JBQ1QsT0FBTyxFQUFFLElBQUk7b0JBQ2IsS0FBSyxFQUFFLG9CQUFvQjtvQkFDM0IsT0FBTyxFQUFFLEdBQUc7b0JBQ1osT0FBTyxFQUFFLEdBQUc7b0JBQ1osSUFBSSxFQUFFLENBQUM7aUJBQ1YsRUFDRCxlQUFlLEVBQUUsSUFBSSxFQUNyQixXQUFXLEVBQUUsQ0FBQyxFQUNkLE9BQU8sRUFBRSxDQUFDLEVBQ1YsS0FBSyxFQUFFO29CQUNILE9BQU8sRUFBRSxJQUFJO29CQUNiLEtBQUssRUFBRSxPQUFPO29CQUNkLFNBQVMsRUFBRSxTQUFTO29CQUNwQixVQUFVLEVBQUUsTUFBTTtvQkFDbEIsUUFBUSxFQUFFLEVBQUU7b0JBQ1osVUFBVSxFQUFFLHFCQUFxQjtvQkFDakMsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsRUFDRCxRQUFRLEVBQUU7b0JBQ04sT0FBTyxFQUFFLElBQUk7b0JBQ2IsS0FBSyxFQUFFLE9BQU87b0JBQ2QsU0FBUyxFQUFFLFNBQVM7b0JBQ3BCLFVBQVUsRUFBRSxTQUFTO29CQUNyQixRQUFRLEVBQUUsQ0FBQztvQkFDWCxVQUFVLEVBQUUscUJBQXFCO29CQUNqQyxPQUFPLEVBQUUsRUFBRTtpQkFDZCxFQUNELE1BQU0sRUFBRTtvQkFDSixLQUFLLEVBQUU7d0JBQ0gsT0FBTyxFQUFFLElBQUk7d0JBQ2IsU0FBUyxFQUFFLFNBQVM7d0JBQ3BCLFVBQVUsRUFBRSxNQUFNO3dCQUNsQixRQUFRLEVBQUUsRUFBRTt3QkFDWixVQUFVLEVBQUUscUJBQXFCO3dCQUNqQyxLQUFLLEVBQUUsT0FBTzt3QkFDZCxRQUFRLEVBQUUsVUFBVTtxQkFDdkI7b0JBQ0QsTUFBTSxFQUFFO3dCQUNKLE9BQU8sRUFBRSxJQUFJO3dCQUNiLFNBQVMsRUFBRSxTQUFTO3dCQUNwQixVQUFVLEVBQUUsTUFBTTt3QkFDbEIsUUFBUSxFQUFFLEVBQUU7d0JBQ1osVUFBVSxFQUFFLHFCQUFxQjt3QkFDakMsS0FBSyxFQUFFLE9BQU87d0JBQ2QsUUFBUSxFQUFFLFVBQVU7cUJBQ3ZCO29CQUNELEtBQUssRUFBRTt3QkFDSCxPQUFPLEVBQUUsSUFBSTt3QkFDYixTQUFTLEVBQUUsU0FBUzt3QkFDcEIsVUFBVSxFQUFFLE1BQU07d0JBQ2xCLFFBQVEsRUFBRSxFQUFFO3dCQUNaLFVBQVUsRUFBRSxxQkFBcUI7d0JBQ2pDLEtBQUssRUFBRSxPQUFPO3dCQUNkLFFBQVEsRUFBRSxVQUFVO3FCQUN2QjtvQkFDRCxLQUFLLEVBQUU7d0JBQ0gsS0FBSyxFQUFFOzRCQUNILE9BQU8sRUFBRSxJQUFJOzRCQUNiLFNBQVMsRUFBRSxTQUFTOzRCQUNwQixVQUFVLEVBQUUsU0FBUzs0QkFDckIsUUFBUSxFQUFFLEVBQUU7NEJBQ1osVUFBVSxFQUFFLHFCQUFxQjs0QkFDakMsS0FBSyxFQUFFLE9BQU87eUJBQ2pCO3FCQUNKO2lCQUNKLEdBQ0o7U0FDSixJQUNIO0lBRXNCLG1CQUFRLEdBQXVCO1FBQ25ELFNBQVMsRUFBRSxVQUFVLENBQUMsaUJBQWlCO1FBQ3ZDLGVBQWUsRUFBRSxVQUFVLENBQUMsaUJBQWlCO1FBQzdDLEtBQUssRUFBRSxVQUFVLENBQUMsYUFBYTtRQUMvQixTQUFTLEVBQUUsVUFBVSxDQUFDLGlCQUFpQjtLQUMxQyxDQUFDO0lBOEpOLGlCQUFDO0NBQUEsQUEvdEJELElBK3RCQztTQS90QlksVUFBVSJ9