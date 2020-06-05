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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
var padding_1 = require("../util/padding");
var cartesianChart_1 = require("./cartesianChart");
var numberAxis_1 = require("./axis/numberAxis");
var categoryAxis_1 = require("./axis/categoryAxis");
var lineSeries_1 = require("./series/cartesian/lineSeries");
var barSeries_1 = require("./series/cartesian/barSeries");
var histogramSeries_1 = require("./series/cartesian/histogramSeries");
var scatterSeries_1 = require("./series/cartesian/scatterSeries");
var areaSeries_1 = require("./series/cartesian/areaSeries");
var polarChart_1 = require("./polarChart");
var pieSeries_1 = require("./series/polar/pieSeries");
var axis_1 = require("../axis");
var timeAxis_1 = require("./axis/timeAxis");
var caption_1 = require("../caption");
var dropShadow_1 = require("../scene/dropShadow");
var legend_1 = require("./legend");
var navigator_1 = require("./navigator/navigator");
var navigatorMask_1 = require("./navigator/navigatorMask");
var navigatorHandle_1 = require("./navigator/navigatorHandle");
var palettes_1 = require("./palettes");
/*
    This file defines the specs for creating different kinds of charts, but
    contains no code that uses the specs to actually create charts
*/
var commonChartMappings = {
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
        visibleRange: [0, 1],
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
                    }] }) }) }, commonChartMappings), { axes: (_b = {},
            _b[numberAxis_1.NumberAxis.type] = __assign({ meta: __assign({ constructor: numberAxis_1.NumberAxis, setAsIs: ['gridStyle', 'visibleRange'] }, axisDefaults) }, axisMappings),
            _b[categoryAxis_1.CategoryAxis.type] = __assign({ meta: __assign({ constructor: categoryAxis_1.CategoryAxis, setAsIs: ['gridStyle', 'visibleRange'] }, axisDefaults) }, axisMappings),
            _b[timeAxis_1.TimeAxis.type] = __assign({ meta: __assign({ constructor: timeAxis_1.TimeAxis, setAsIs: ['gridStyle', 'visibleRange'] }, axisDefaults) }, axisMappings),
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
            _c.column = __assign(__assign({ meta: {
                    constructor: barSeries_1.BarSeries,
                    defaults: __assign(__assign({ flipXY: false }, seriesDefaults), columnSeriesDefaults)
                }, highlightStyle: {} }, labelMapping), shadowMapping),
            _c.bar = __assign(__assign({ meta: {
                    constructor: barSeries_1.BarSeries,
                    defaults: __assign(__assign({ flipXY: true }, seriesDefaults), columnSeriesDefaults)
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
            _c[histogramSeries_1.HistogramSeries.type] = {
                meta: {
                    constructor: histogramSeries_1.HistogramSeries,
                    defaults: __assign(__assign({}, seriesDefaults), { title: undefined, xKey: '', yKey: '', xName: '', yName: '', fill: palettes_1.default.fills[0], stroke: palettes_1.default.strokes[0], strokeWidth: 1, fillOpacity: 1, strokeOpacity: 1, aggregation: 'sum', tooltipRenderer: undefined, highlightStyle: {
                            fill: 'yellow'
                        } })
                },
                highlightStyle: {}
            },
            _c), navigator: {
            meta: {
                constructor: navigator_1.Navigator,
                defaults: {
                    enabled: false,
                    height: 30,
                    min: 0,
                    max: 1
                }
            },
            mask: {
                meta: {
                    constructor: navigatorMask_1.NavigatorMask,
                    defaults: {
                        fill: '#999999',
                        stroke: '#999999',
                        strokeWidth: 1,
                        fillOpacity: 0.2
                    }
                }
            },
            minHandle: {
                meta: {
                    constructor: navigatorHandle_1.NavigatorHandle,
                    defaults: {
                        fill: '#f2f2f2',
                        stroke: '#999999',
                        strokeWidth: 1,
                        width: 8,
                        height: 16,
                        gripLineGap: 2,
                        gripLineLength: 8
                    }
                }
            },
            maxHandle: {
                meta: {
                    constructor: navigatorHandle_1.NavigatorHandle,
                    defaults: {
                        fill: '#f2f2f2',
                        stroke: '#999999',
                        strokeWidth: 1,
                        width: 8,
                        height: 16,
                        gripLineGap: 2,
                        gripLineLength: 8
                    }
                }
            }
        } }),
    _a[polarChart_1.PolarChart.type] = __assign(__assign({ meta: __assign(__assign({ constructor: polarChart_1.PolarChart }, chartMeta), { defaults: __assign(__assign({}, chartDefaults), { padding: new padding_1.Padding(40) }) }) }, commonChartMappings), { series: (_d = {},
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
}
// Special handling for scatter and histogram charts, for which both axes should default to type `number`.
mappings['scatter'] =
    mappings['histogram'] = __assign(__assign({}, mappings.cartesian), { meta: __assign(__assign({}, mappings.cartesian.meta), { defaults: __assign(__assign({}, chartDefaults), { axes: [{
                        type: 'number',
                        position: 'bottom'
                    }, {
                        type: 'number',
                        position: 'left'
                    }] }) }) });
exports.default = mappings;
//# sourceMappingURL=chartMappings.js.map