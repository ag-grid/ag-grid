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
import { Padding } from "../util/padding";
import { CartesianChart } from "./cartesianChart";
import { GroupedCategoryChart } from "./groupedCategoryChart";
import { NumberAxis } from "./axis/numberAxis";
import { CategoryAxis } from "./axis/categoryAxis";
import { GroupedCategoryAxis } from "./axis/groupedCategoryAxis";
import { LineSeries } from "./series/cartesian/lineSeries";
import { BarSeries, BarLabelPlacement } from "./series/cartesian/barSeries";
import { HistogramSeries } from "./series/cartesian/histogramSeries";
import { ScatterSeries } from "./series/cartesian/scatterSeries";
import { AreaSeries } from "./series/cartesian/areaSeries";
import { PolarChart } from "./polarChart";
import { PieSeries, PieTitle } from "./series/polar/pieSeries";
import { AxisLabel, AxisTick } from "../axis";
import { TimeAxis } from "./axis/timeAxis";
import { Caption } from "../caption";
import { DropShadow } from "../scene/dropShadow";
import { Legend, LegendPosition, LegendItem, LegendMarker, LegendLabel } from "./legend";
import { Navigator } from "./navigator/navigator";
import { NavigatorMask } from "./navigator/navigatorMask";
import { NavigatorHandle } from "./navigator/navigatorHandle";
import { CartesianSeriesMarker } from "./series/cartesian/cartesianSeries";
import { Chart } from "./chart";
import { HierarchyChart } from "./hierarchyChart";
import { TreemapSeries } from "./series/hierarchy/treemapSeries";
import { LogAxis } from "./axis/logAxis";
import { Label } from "./label";
import { ChartAxisPosition } from "./chartAxis";
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
            constructor: Padding,
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
                class: Chart.defaultTooltipClass
            }
        }
    },
    title: {
        meta: {
            constructor: Caption,
            defaults: {
                enabled: false,
                padding: {
                    meta: {
                        constructor: Padding,
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
            constructor: Caption,
            defaults: {
                enabled: false,
                padding: {
                    meta: {
                        constructor: Padding,
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
            constructor: Legend,
            defaults: {
                enabled: true,
                position: LegendPosition.Right,
                spacing: 20
            }
        },
        item: {
            meta: {
                constructor: LegendItem,
                defaults: {
                    paddingX: 16,
                    paddingY: 8
                }
            },
            marker: {
                meta: {
                    constructor: LegendMarker,
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
                    constructor: LegendLabel,
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
        constructor: DropShadow,
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
        defaults: __assign(__assign({}, labelDefaults), { formatter: undefined, placement: BarLabelPlacement.Inside })
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
            constructor: Caption,
            defaults: {
                padding: {
                    meta: {
                        constructor: Padding,
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
            constructor: AxisLabel,
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
            constructor: AxisTick,
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
var CARTESIAN_MAPPING = __assign(__assign({ meta: __assign(__assign({ constructor: CartesianChart }, chartMeta), { defaults: __assign(__assign({}, chartDefaults), { axes: [{
                    type: NumberAxis.type,
                    position: ChartAxisPosition.Left,
                }, {
                    type: CategoryAxis.type,
                    position: ChartAxisPosition.Bottom,
                }] }) }) }, commonChartMappings), { axes: (_a = {},
        _a['number'] = __assign({ meta: {
                constructor: NumberAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: axisDefaults,
            } }, axisMappings),
        _a[LogAxis.type] = __assign({ meta: {
                constructor: LogAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: __assign(__assign({}, axisDefaults), { base: 10 }),
            } }, axisMappings),
        _a[CategoryAxis.type] = __assign({ meta: {
                constructor: CategoryAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: axisDefaults,
            } }, axisMappings),
        _a[GroupedCategoryAxis.type] = __assign({ meta: {
                constructor: GroupedCategoryAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: axisDefaults,
            } }, axisMappings),
        _a[TimeAxis.type] = __assign({ meta: {
                constructor: TimeAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: axisDefaults,
            } }, axisMappings),
        _a), series: (_b = {
            column: {
                meta: {
                    constructor: BarSeries,
                    setAsIs: ['lineDash', 'yNames'],
                    defaults: __assign(__assign({ flipXY: false }, seriesDefaults), columnSeriesDefaults)
                },
                highlightStyle: highlightStyleMapping,
                tooltip: tooltipMapping,
                label: barLabelMapping,
                shadow: shadowMapping,
            }
        },
        _b[BarSeries.type] = {
            meta: {
                constructor: BarSeries,
                setAsIs: ['lineDash', 'yNames'],
                defaults: __assign(__assign({ flipXY: true }, seriesDefaults), columnSeriesDefaults)
            },
            highlightStyle: highlightStyleMapping,
            tooltip: tooltipMapping,
            label: barLabelMapping,
            shadow: shadowMapping,
        },
        _b[LineSeries.type] = {
            meta: {
                constructor: LineSeries,
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
                    constructor: CartesianSeriesMarker,
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
        _b[ScatterSeries.type] = {
            meta: {
                constructor: ScatterSeries,
                defaults: __assign(__assign({}, seriesDefaults), { title: undefined, xKey: '', yKey: '', sizeKey: undefined, labelKey: undefined, xName: '', yName: '', sizeName: 'Size', labelName: 'Label', strokeWidth: 2, fillOpacity: 1, strokeOpacity: 1 })
            },
            tooltip: tooltipMapping,
            highlightStyle: highlightStyleMapping,
            marker: {
                meta: {
                    constructor: CartesianSeriesMarker,
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
        _b[AreaSeries.type] = {
            meta: {
                constructor: AreaSeries,
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
                    constructor: CartesianSeriesMarker,
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
        _b[HistogramSeries.type] = {
            meta: {
                constructor: HistogramSeries,
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
            constructor: Navigator,
            defaults: {
                enabled: false,
                height: 30,
            }
        },
        mask: {
            meta: {
                constructor: NavigatorMask,
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
                constructor: NavigatorHandle,
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
                constructor: NavigatorHandle,
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
var POLAR_MAPPING = __assign(__assign({ meta: __assign(__assign({ constructor: PolarChart }, chartMeta), { defaults: __assign(__assign({}, chartDefaults), { padding: {
                meta: {
                    constructor: Padding,
                    defaults: {
                        top: 40,
                        right: 40,
                        bottom: 40,
                        left: 40
                    }
                }
            } }) }) }, commonChartMappings), { series: (_c = {},
        _c[PieSeries.type] = {
            meta: {
                constructor: PieSeries,
                setAsIs: ['lineDash'],
                defaults: __assign(__assign({}, seriesDefaults), { title: undefined, angleKey: '', angleName: '', radiusKey: undefined, radiusName: undefined, labelKey: undefined, labelName: undefined, callout: {}, fillOpacity: 1, strokeOpacity: 1, rotation: 0, outerRadiusOffset: 0, innerRadiusOffset: 0, strokeWidth: 1, lineDash: undefined, lineDashOffset: 0, shadow: undefined })
            },
            tooltip: tooltipMapping,
            highlightStyle: highlightStyleMapping,
            title: {
                meta: {
                    constructor: PieTitle,
                    defaults: {
                        enabled: true,
                        showInLegend: false,
                        padding: {
                            meta: {
                                constructor: Padding,
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
var HIERARCHY_MAPPING = __assign(__assign({ meta: __assign(__assign({ constructor: HierarchyChart }, chartMeta), { defaults: __assign({}, chartDefaults) }) }, commonChartMappings), { series: (_d = {},
        _d[TreemapSeries.type] = {
            meta: {
                constructor: TreemapSeries,
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
                        constructor: Label,
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
                        constructor: Label,
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
                        constructor: Label,
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
                        constructor: Label,
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
        position: ChartAxisPosition.Bottom,
    }, {
        type: 'number',
        position: ChartAxisPosition.Left,
    }];
var BAR_AXES = [{
        type: 'number',
        position: ChartAxisPosition.Bottom,
    }, {
        type: 'category',
        position: ChartAxisPosition.Left,
    }];
export var mappings = (_e = {},
    _e[CartesianChart.type] = CARTESIAN_MAPPING,
    _e[GroupedCategoryChart.type] = tweakConstructor(CARTESIAN_MAPPING, GroupedCategoryChart),
    _e['line'] = CARTESIAN_MAPPING,
    _e['area'] = CARTESIAN_MAPPING,
    _e['bar'] = tweakAxes(CARTESIAN_MAPPING, BAR_AXES),
    _e['column'] = CARTESIAN_MAPPING,
    _e['scatter'] = tweakAxes(CARTESIAN_MAPPING, SCATTER_HISTOGRAM_AXES),
    _e['histogram'] = tweakAxes(CARTESIAN_MAPPING, SCATTER_HISTOGRAM_AXES),
    _e[PolarChart.type] = POLAR_MAPPING,
    _e['pie'] = POLAR_MAPPING,
    _e[HierarchyChart.type] = HIERARCHY_MAPPING,
    _e['treemap'] = HIERARCHY_MAPPING,
    _e);
//# sourceMappingURL=agChartMappings.js.map