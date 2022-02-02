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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
var padding_1 = require("../util/padding");
var cartesianChart_1 = require("./cartesianChart");
var groupedCategoryChart_1 = require("./groupedCategoryChart");
var numberAxis_1 = require("./axis/numberAxis");
var categoryAxis_1 = require("./axis/categoryAxis");
var groupedCategoryAxis_1 = require("./axis/groupedCategoryAxis");
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
var cartesianSeries_1 = require("./series/cartesian/cartesianSeries");
var chart_1 = require("./chart");
var hierarchyChart_1 = require("./hierarchyChart");
var treemapSeries_1 = require("./series/hierarchy/treemapSeries");
var logAxis_1 = require("./axis/logAxis");
var label_1 = require("./label");
var chartAxis_1 = require("./chartAxis");
// type RecursiveMapping<T> = 
//     T extends Primitive | Array<Primitive> ? T :
//     T extends Array<infer E> ? Mapping<E> :
//     (
//         T extends { type: string } ?
//             {[key: string]: Mapping<T>} | { [P in keyof T]?: T[P] | Mapping<T[P]> | {}; } :
//         { [P in keyof T]?: T[P] | Mapping<T[P]> | {}; }
//     ) & BaseDefinition<T>;
// type PropertyMapping<T> = 
//     T extends Primitive | Array<Primitive> ? T :
//     T extends Array<infer E> ? Mapping<E> :
// type Mapping<T> = {};
var chartPadding = 20;
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
                top: chartPadding,
                right: chartPadding,
                bottom: chartPadding,
                left: chartPadding,
            }
        }
    },
    tooltip: {
        meta: {
            defaults: {
                enabled: true,
                tracking: true,
                delay: 0,
                class: chart_1.Chart.defaultTooltipClass
            }
        }
    },
    title: {
        meta: {
            constructor: caption_1.Caption,
            defaults: {
                enabled: false,
                padding: {
                    meta: {
                        constructor: padding_1.Padding,
                        defaults: {
                            top: 10,
                            right: 10,
                            bottom: 10,
                            left: 10
                        }
                    }
                },
                text: 'Title',
                fontStyle: undefined,
                fontWeight: 'bold',
                fontSize: 14,
                fontFamily: 'Verdana, sans-serif',
                color: 'rgb(70, 70, 70)'
            }
        }
    },
    subtitle: {
        meta: {
            constructor: caption_1.Caption,
            defaults: {
                enabled: false,
                padding: {
                    meta: {
                        constructor: padding_1.Padding,
                        defaults: {
                            top: 10,
                            right: 10,
                            bottom: 10,
                            left: 10
                        }
                    }
                },
                text: 'Subtitle',
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: 'Verdana, sans-serif',
                color: 'rgb(140, 140, 140)'
            }
        }
    },
    legend: {
        meta: {
            constructor: legend_1.Legend,
            defaults: {
                enabled: true,
                position: legend_1.LegendPosition.Right,
                spacing: 20
            }
        },
        item: {
            meta: {
                constructor: legend_1.LegendItem,
                defaults: {
                    paddingX: 16,
                    paddingY: 8
                }
            },
            marker: {
                meta: {
                    constructor: legend_1.LegendMarker,
                    defaults: {
                        shape: undefined,
                        size: 15,
                        strokeWidth: 1,
                        padding: 8
                    }
                }
            },
            label: {
                meta: {
                    constructor: legend_1.LegendLabel,
                    defaults: {
                        color: 'black',
                        fontStyle: undefined,
                        fontWeight: undefined,
                        fontSize: 12,
                        fontFamily: 'Verdana, sans-serif',
                        formatter: undefined
                    }
                }
            }
        }
    }
};
var chartDefaults = {
    container: undefined,
    autoSize: true,
    width: 600,
    height: 300,
    data: [],
    title: undefined,
    subtitle: undefined,
    padding: {},
    background: {},
    legend: {
        item: {
            marker: {},
            label: {}
        }
    },
    navigator: {
        mask: {},
        minHandle: {},
        maxHandle: {}
    },
    listeners: undefined
};
var chartMeta = {
    // Charts components' constructors normally don't take any parameters (which makes things consistent -- everything
    // is configured the same way, via the properties, and makes the factory pattern work well) but the charts
    // themselves are the exceptions.
    // If a chart config has the (optional) `document` property, it will be passed to the constructor.
    // There is no actual `document` property on the chart, it can only be supplied during instantiation.
    // Config object properties to be used as constructor parameters, in that order.
    constructorParams: ['document'],
    // Properties that should be set on the component as is (without pre-processing).
    setAsIs: ['container', 'data'],
    nonSerializable: ['container', 'data'],
};
var axisDefaults = {
    visibleRange: [0, 1],
    thickness: 0,
    label: {},
    tick: {},
    title: {},
    line: {},
    gridStyle: [{
            stroke: 'rgb(219, 219, 219)',
            lineDash: [4, 2]
        }],
};
var seriesDefaults = {
    visible: true,
    showInLegend: true,
    cursor: 'default',
    listeners: undefined
};
var highlightStyleMapping = {
    item: {
        meta: {
            defaults: {
                fill: 'yellow'
            }
        }
    },
    series: {
        meta: {
            defaults: {
                dimOpacity: 1
            }
        }
    }
};
var columnSeriesDefaults = {
    fillOpacity: 1,
    strokeOpacity: 1,
    xKey: '',
    xName: '',
    yKeys: [],
    yNames: {},
    grouped: false,
    normalizedTo: undefined,
    strokeWidth: 1,
    lineDash: undefined,
    lineDashOffset: 0,
    shadow: undefined
};
var shadowMapping = {
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
};
var labelDefaults = {
    enabled: true,
    fontStyle: undefined,
    fontWeight: undefined,
    fontSize: 12,
    fontFamily: 'Verdana, sans-serif',
    color: 'rgb(70, 70, 70)'
};
var barLabelMapping = {
    meta: {
        defaults: __assign(__assign({}, labelDefaults), { formatter: undefined, placement: barSeries_1.BarLabelPlacement.Inside })
    }
};
var tooltipMapping = {
    meta: {
        defaults: {
            enabled: true,
            renderer: undefined,
            format: undefined,
        }
    }
};
var axisMappings = {
    line: {
        meta: {
            defaults: {
                width: 1,
                color: 'rgb(195, 195, 195)'
            }
        }
    },
    title: {
        meta: {
            constructor: caption_1.Caption,
            defaults: {
                padding: {
                    meta: {
                        constructor: padding_1.Padding,
                        defaults: {
                            top: 10,
                            right: 10,
                            bottom: 10,
                            left: 10
                        }
                    }
                },
                text: 'Axis Title',
                fontStyle: undefined,
                fontWeight: 'bold',
                fontSize: 12,
                fontFamily: 'Verdana, sans-serif',
                color: 'rgb(70, 70, 70)'
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
                rotation: 0,
                color: 'rgb(87, 87, 87)',
                formatter: undefined
            }
        }
    },
    tick: {
        meta: {
            constructor: axis_1.AxisTick,
            setAsIs: ['count'],
            defaults: {
                width: 1,
                size: 6,
                color: 'rgb(195, 195, 195)',
                count: 10
            }
        }
    }
};
var CARTESIAN_MAPPING = __assign(__assign({ meta: __assign(__assign({ constructor: cartesianChart_1.CartesianChart }, chartMeta), { defaults: __assign(__assign({}, chartDefaults), { axes: [{
                    type: numberAxis_1.NumberAxis.type,
                    position: chartAxis_1.ChartAxisPosition.Left,
                }, {
                    type: categoryAxis_1.CategoryAxis.type,
                    position: chartAxis_1.ChartAxisPosition.Bottom,
                }] }) }) }, commonChartMappings), { axes: (_a = {},
        _a['number'] = __assign({ meta: {
                constructor: numberAxis_1.NumberAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: axisDefaults,
            } }, axisMappings),
        _a[logAxis_1.LogAxis.type] = __assign({ meta: {
                constructor: logAxis_1.LogAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: __assign(__assign({}, axisDefaults), { base: 10 }),
            } }, axisMappings),
        _a[categoryAxis_1.CategoryAxis.type] = __assign({ meta: {
                constructor: categoryAxis_1.CategoryAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: axisDefaults,
            } }, axisMappings),
        _a[groupedCategoryAxis_1.GroupedCategoryAxis.type] = __assign({ meta: {
                constructor: groupedCategoryAxis_1.GroupedCategoryAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: axisDefaults,
            } }, axisMappings),
        _a[timeAxis_1.TimeAxis.type] = __assign({ meta: {
                constructor: timeAxis_1.TimeAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: axisDefaults,
            } }, axisMappings),
        _a), series: (_b = {
            column: {
                meta: {
                    constructor: barSeries_1.BarSeries,
                    setAsIs: ['lineDash', 'yNames'],
                    defaults: __assign(__assign({ flipXY: false }, seriesDefaults), columnSeriesDefaults)
                },
                highlightStyle: highlightStyleMapping,
                tooltip: tooltipMapping,
                label: barLabelMapping,
                shadow: shadowMapping,
            }
        },
        _b[barSeries_1.BarSeries.type] = {
            meta: {
                constructor: barSeries_1.BarSeries,
                setAsIs: ['lineDash', 'yNames'],
                defaults: __assign(__assign({ flipXY: true }, seriesDefaults), columnSeriesDefaults)
            },
            highlightStyle: highlightStyleMapping,
            tooltip: tooltipMapping,
            label: barLabelMapping,
            shadow: shadowMapping,
        },
        _b[lineSeries_1.LineSeries.type] = {
            meta: {
                constructor: lineSeries_1.LineSeries,
                setAsIs: ['lineDash'],
                defaults: __assign(__assign({}, seriesDefaults), { title: undefined, xKey: '', xName: '', yKey: '', yName: '', strokeWidth: 2, strokeOpacity: 1, lineDash: undefined, lineDashOffset: 0 })
            },
            tooltip: tooltipMapping,
            highlightStyle: highlightStyleMapping,
            label: {
                meta: {
                    defaults: __assign(__assign({}, labelDefaults), { formatter: undefined })
                }
            },
            marker: {
                meta: {
                    constructor: cartesianSeries_1.CartesianSeriesMarker,
                    defaults: {
                        enabled: true,
                        shape: 'circle',
                        size: 6,
                        maxSize: 30,
                        strokeWidth: 1,
                        formatter: undefined
                    }
                }
            }
        },
        _b[scatterSeries_1.ScatterSeries.type] = {
            meta: {
                constructor: scatterSeries_1.ScatterSeries,
                defaults: __assign(__assign({}, seriesDefaults), { title: undefined, xKey: '', yKey: '', sizeKey: undefined, labelKey: undefined, xName: '', yName: '', sizeName: 'Size', labelName: 'Label', strokeWidth: 2, fillOpacity: 1, strokeOpacity: 1 })
            },
            tooltip: tooltipMapping,
            highlightStyle: highlightStyleMapping,
            marker: {
                meta: {
                    constructor: cartesianSeries_1.CartesianSeriesMarker,
                    defaults: {
                        enabled: true,
                        shape: 'circle',
                        size: 6,
                        maxSize: 30,
                        strokeWidth: 1,
                        formatter: undefined
                    }
                }
            },
            label: {
                meta: {
                    defaults: __assign({}, labelDefaults)
                }
            }
        },
        _b[areaSeries_1.AreaSeries.type] = {
            meta: {
                constructor: areaSeries_1.AreaSeries,
                setAsIs: ['lineDash'],
                defaults: __assign(__assign({}, seriesDefaults), { xKey: '', xName: '', yKeys: [], yNames: [], normalizedTo: undefined, fillOpacity: 1, strokeOpacity: 1, strokeWidth: 2, lineDash: undefined, lineDashOffset: 0, shadow: undefined })
            },
            tooltip: tooltipMapping,
            highlightStyle: highlightStyleMapping,
            label: {
                meta: {
                    defaults: __assign(__assign({}, labelDefaults), { formatter: undefined })
                }
            },
            marker: {
                meta: {
                    constructor: cartesianSeries_1.CartesianSeriesMarker,
                    defaults: {
                        enabled: true,
                        shape: 'circle',
                        size: 6,
                        maxSize: 30,
                        strokeWidth: 1,
                        formatter: undefined
                    }
                }
            },
            shadow: shadowMapping,
        },
        _b[histogramSeries_1.HistogramSeries.type] = {
            meta: {
                constructor: histogramSeries_1.HistogramSeries,
                setAsIs: ['lineDash'],
                defaults: __assign(__assign({}, seriesDefaults), { xKey: '', yKey: '', xName: '', yName: '', strokeWidth: 1, fillOpacity: 1, strokeOpacity: 1, lineDash: undefined, lineDashOffset: 0, areaPlot: false, binCount: undefined, bins: undefined, aggregation: 'sum' })
            },
            tooltip: tooltipMapping,
            highlightStyle: highlightStyleMapping,
            label: {
                meta: {
                    defaults: __assign(__assign({}, labelDefaults), { formatter: undefined })
                }
            },
            shadow: shadowMapping,
        },
        _b), navigator: {
        meta: {
            constructor: navigator_1.Navigator,
            defaults: {
                enabled: false,
                height: 30,
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
    } });
var POLAR_MAPPING = __assign(__assign({ meta: __assign(__assign({ constructor: polarChart_1.PolarChart }, chartMeta), { defaults: __assign(__assign({}, chartDefaults), { padding: {
                meta: {
                    constructor: padding_1.Padding,
                    defaults: {
                        top: 40,
                        right: 40,
                        bottom: 40,
                        left: 40
                    }
                }
            } }) }) }, commonChartMappings), { series: (_c = {},
        _c[pieSeries_1.PieSeries.type] = {
            meta: {
                constructor: pieSeries_1.PieSeries,
                setAsIs: ['lineDash'],
                defaults: __assign(__assign({}, seriesDefaults), { title: undefined, angleKey: '', angleName: '', radiusKey: undefined, radiusName: undefined, labelKey: undefined, labelName: undefined, callout: {}, fillOpacity: 1, strokeOpacity: 1, rotation: 0, outerRadiusOffset: 0, innerRadiusOffset: 0, strokeWidth: 1, lineDash: undefined, lineDashOffset: 0, shadow: undefined })
            },
            tooltip: tooltipMapping,
            highlightStyle: highlightStyleMapping,
            title: {
                meta: {
                    constructor: pieSeries_1.PieTitle,
                    defaults: {
                        enabled: true,
                        showInLegend: false,
                        padding: {
                            meta: {
                                constructor: padding_1.Padding,
                                defaults: {
                                    top: 10,
                                    right: 10,
                                    bottom: 10,
                                    left: 10
                                }
                            }
                        },
                        text: 'Series Title',
                        fontStyle: undefined,
                        fontWeight: 'bold',
                        fontSize: 14,
                        fontFamily: 'Verdana, sans-serif',
                        color: 'black'
                    }
                }
            },
            label: {
                meta: {
                    defaults: __assign(__assign({}, labelDefaults), { offset: 3, minAngle: 20 })
                }
            },
            callout: {
                meta: {
                    defaults: {
                        length: 10,
                        strokeWidth: 1
                    }
                }
            },
            shadow: shadowMapping,
        },
        _c) });
var HIERARCHY_MAPPING = __assign(__assign({ meta: __assign(__assign({ constructor: hierarchyChart_1.HierarchyChart }, chartMeta), { defaults: __assign({}, chartDefaults) }) }, commonChartMappings), { series: (_d = {},
        _d[treemapSeries_1.TreemapSeries.type] = {
            meta: {
                constructor: treemapSeries_1.TreemapSeries,
                defaults: __assign(__assign({}, seriesDefaults), { showInLegend: false, labelKey: 'label', sizeKey: 'size', colorKey: 'color', colorDomain: [-5, 5], colorRange: ['#cb4b3f', '#6acb64'], colorParents: false, gradient: true, nodePadding: 2, title: {}, subtitle: {}, labels: {
                        large: {},
                        medium: {},
                        small: {},
                        color: {}
                    } })
            },
            tooltip: tooltipMapping,
            highlightStyle: highlightStyleMapping,
            title: {
                meta: {
                    defaults: {
                        enabled: true,
                        color: 'white',
                        fontStyle: undefined,
                        fontWeight: 'bold',
                        fontSize: 12,
                        fontFamily: 'Verdana, sans-serif',
                        padding: 15
                    }
                }
            },
            subtitle: {
                meta: {
                    defaults: {
                        enabled: true,
                        color: 'white',
                        fontStyle: undefined,
                        fontWeight: undefined,
                        fontSize: 9,
                        fontFamily: 'Verdana, sans-serif',
                        padding: 13
                    }
                }
            },
            labels: {
                meta: {
                    defaults: {
                        large: {},
                        medium: {},
                        small: {},
                        color: {}
                    }
                },
                large: {
                    meta: {
                        constructor: label_1.Label,
                        defaults: {
                            enabled: true,
                            fontStyle: undefined,
                            fontWeight: 'bold',
                            fontSize: 18,
                            fontFamily: 'Verdana, sans-serif',
                            color: 'white'
                        }
                    }
                },
                medium: {
                    meta: {
                        constructor: label_1.Label,
                        defaults: {
                            enabled: true,
                            fontStyle: undefined,
                            fontWeight: 'bold',
                            fontSize: 14,
                            fontFamily: 'Verdana, sans-serif',
                            color: 'white'
                        }
                    }
                },
                small: {
                    meta: {
                        constructor: label_1.Label,
                        defaults: {
                            enabled: true,
                            fontStyle: undefined,
                            fontWeight: 'bold',
                            fontSize: 10,
                            fontFamily: 'Verdana, sans-serif',
                            color: 'white'
                        }
                    }
                },
                color: {
                    meta: {
                        constructor: label_1.Label,
                        defaults: {
                            enabled: true,
                            fontStyle: undefined,
                            fontWeight: undefined,
                            fontSize: 12,
                            fontFamily: 'Verdana, sans-serif',
                            color: 'white'
                        }
                    }
                }
            }
        },
        _d) });
function tweakAxes(input, newAxes) {
    var _a;
    return __assign(__assign({}, input), { meta: __assign(__assign({}, input.meta), { defaults: __assign(__assign({}, (_a = input.meta) === null || _a === void 0 ? void 0 : _a.defaults), { axes: newAxes }) }) });
}
function tweakConstructor(input, constructor) {
    return __assign(__assign({}, input), { meta: __assign(__assign({}, input.meta), { constructor: constructor }) });
}
var SCATTER_HISTOGRAM_AXES = [{
        type: 'number',
        position: chartAxis_1.ChartAxisPosition.Bottom,
    }, {
        type: 'number',
        position: chartAxis_1.ChartAxisPosition.Left,
    }];
var BAR_AXES = [{
        type: 'number',
        position: chartAxis_1.ChartAxisPosition.Bottom,
    }, {
        type: 'category',
        position: chartAxis_1.ChartAxisPosition.Left,
    }];
exports.mappings = (_e = {},
    _e[cartesianChart_1.CartesianChart.type] = CARTESIAN_MAPPING,
    _e[groupedCategoryChart_1.GroupedCategoryChart.type] = tweakConstructor(CARTESIAN_MAPPING, groupedCategoryChart_1.GroupedCategoryChart),
    _e['line'] = CARTESIAN_MAPPING,
    _e['area'] = CARTESIAN_MAPPING,
    _e['bar'] = tweakAxes(CARTESIAN_MAPPING, BAR_AXES),
    _e['column'] = CARTESIAN_MAPPING,
    _e['scatter'] = tweakAxes(CARTESIAN_MAPPING, SCATTER_HISTOGRAM_AXES),
    _e['histogram'] = tweakAxes(CARTESIAN_MAPPING, SCATTER_HISTOGRAM_AXES),
    _e[polarChart_1.PolarChart.type] = POLAR_MAPPING,
    _e['pie'] = POLAR_MAPPING,
    _e[hierarchyChart_1.HierarchyChart.type] = HIERARCHY_MAPPING,
    _e['treemap'] = HIERARCHY_MAPPING,
    _e);
//# sourceMappingURL=agChartMappings.js.map