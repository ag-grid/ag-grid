"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const padding_1 = require("../util/padding");
const cartesianChart_1 = require("./cartesianChart");
const groupedCategoryChart_1 = require("./groupedCategoryChart");
const numberAxis_1 = require("./axis/numberAxis");
const categoryAxis_1 = require("./axis/categoryAxis");
const groupedCategoryAxis_1 = require("./axis/groupedCategoryAxis");
const lineSeries_1 = require("./series/cartesian/lineSeries");
const barSeries_1 = require("./series/cartesian/barSeries");
const histogramSeries_1 = require("./series/cartesian/histogramSeries");
const scatterSeries_1 = require("./series/cartesian/scatterSeries");
const areaSeries_1 = require("./series/cartesian/areaSeries");
const polarChart_1 = require("./polarChart");
const pieSeries_1 = require("./series/polar/pieSeries");
const axis_1 = require("../axis");
const timeAxis_1 = require("./axis/timeAxis");
const caption_1 = require("../caption");
const dropShadow_1 = require("../scene/dropShadow");
const legend_1 = require("./legend");
const navigator_1 = require("./navigator/navigator");
const navigatorMask_1 = require("./navigator/navigatorMask");
const navigatorHandle_1 = require("./navigator/navigatorHandle");
const cartesianSeries_1 = require("./series/cartesian/cartesianSeries");
const chart_1 = require("./chart");
const hierarchyChart_1 = require("./hierarchyChart");
const treemapSeries_1 = require("./series/hierarchy/treemapSeries");
const logAxis_1 = require("./axis/logAxis");
const label_1 = require("./label");
const chartAxis_1 = require("./chartAxis");
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
const chartPadding = 20;
const commonChartMappings = {
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
const chartDefaults = {
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
const chartMeta = {
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
const axisDefaults = {
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
const seriesDefaults = {
    visible: true,
    showInLegend: true,
    cursor: 'default',
    listeners: undefined
};
const highlightStyleMapping = {
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
const columnSeriesDefaults = {
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
const shadowMapping = {
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
const labelDefaults = {
    enabled: true,
    fontStyle: undefined,
    fontWeight: undefined,
    fontSize: 12,
    fontFamily: 'Verdana, sans-serif',
    color: 'rgb(70, 70, 70)'
};
const barLabelMapping = {
    meta: {
        defaults: Object.assign(Object.assign({}, labelDefaults), { formatter: undefined, placement: barSeries_1.BarLabelPlacement.Inside })
    }
};
const tooltipMapping = {
    meta: {
        defaults: {
            enabled: true,
            renderer: undefined,
            format: undefined,
        }
    }
};
const axisMappings = {
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
const CARTESIAN_MAPPING = Object.assign(Object.assign({ meta: Object.assign(Object.assign({ constructor: cartesianChart_1.CartesianChart }, chartMeta), { defaults: Object.assign(Object.assign({}, chartDefaults), { axes: [{
                    type: numberAxis_1.NumberAxis.type,
                    position: chartAxis_1.ChartAxisPosition.Left,
                }, {
                    type: categoryAxis_1.CategoryAxis.type,
                    position: chartAxis_1.ChartAxisPosition.Bottom,
                }] }) }) }, commonChartMappings), { axes: {
        ['number']: Object.assign({ meta: {
                constructor: numberAxis_1.NumberAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: axisDefaults,
            } }, axisMappings),
        [logAxis_1.LogAxis.type]: Object.assign({ meta: {
                constructor: logAxis_1.LogAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: Object.assign(Object.assign({}, axisDefaults), { base: 10 }),
            } }, axisMappings),
        [categoryAxis_1.CategoryAxis.type]: Object.assign({ meta: {
                constructor: categoryAxis_1.CategoryAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: axisDefaults,
            } }, axisMappings),
        [groupedCategoryAxis_1.GroupedCategoryAxis.type]: Object.assign({ meta: {
                constructor: groupedCategoryAxis_1.GroupedCategoryAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: axisDefaults,
            } }, axisMappings),
        [timeAxis_1.TimeAxis.type]: Object.assign({ meta: {
                constructor: timeAxis_1.TimeAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: axisDefaults,
            } }, axisMappings),
    }, series: {
        column: {
            meta: {
                constructor: barSeries_1.BarSeries,
                setAsIs: ['lineDash', 'yNames'],
                defaults: Object.assign(Object.assign({ flipXY: false }, seriesDefaults), columnSeriesDefaults)
            },
            highlightStyle: highlightStyleMapping,
            tooltip: tooltipMapping,
            label: barLabelMapping,
            shadow: shadowMapping,
        },
        [barSeries_1.BarSeries.type]: {
            meta: {
                constructor: barSeries_1.BarSeries,
                setAsIs: ['lineDash', 'yNames'],
                defaults: Object.assign(Object.assign({ flipXY: true }, seriesDefaults), columnSeriesDefaults)
            },
            highlightStyle: highlightStyleMapping,
            tooltip: tooltipMapping,
            label: barLabelMapping,
            shadow: shadowMapping,
        },
        [lineSeries_1.LineSeries.type]: {
            meta: {
                constructor: lineSeries_1.LineSeries,
                setAsIs: ['lineDash'],
                defaults: Object.assign(Object.assign({}, seriesDefaults), { title: undefined, xKey: '', xName: '', yKey: '', yName: '', strokeWidth: 2, strokeOpacity: 1, lineDash: undefined, lineDashOffset: 0 })
            },
            tooltip: tooltipMapping,
            highlightStyle: highlightStyleMapping,
            label: {
                meta: {
                    defaults: Object.assign(Object.assign({}, labelDefaults), { formatter: undefined })
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
        [scatterSeries_1.ScatterSeries.type]: {
            meta: {
                constructor: scatterSeries_1.ScatterSeries,
                defaults: Object.assign(Object.assign({}, seriesDefaults), { title: undefined, xKey: '', yKey: '', sizeKey: undefined, labelKey: undefined, xName: '', yName: '', sizeName: 'Size', labelName: 'Label', strokeWidth: 2, fillOpacity: 1, strokeOpacity: 1 })
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
                    defaults: Object.assign({}, labelDefaults)
                }
            }
        },
        [areaSeries_1.AreaSeries.type]: {
            meta: {
                constructor: areaSeries_1.AreaSeries,
                setAsIs: ['lineDash'],
                defaults: Object.assign(Object.assign({}, seriesDefaults), { xKey: '', xName: '', yKeys: [], yNames: [], normalizedTo: undefined, fillOpacity: 1, strokeOpacity: 1, strokeWidth: 2, lineDash: undefined, lineDashOffset: 0, shadow: undefined })
            },
            tooltip: tooltipMapping,
            highlightStyle: highlightStyleMapping,
            label: {
                meta: {
                    defaults: Object.assign(Object.assign({}, labelDefaults), { formatter: undefined })
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
        [histogramSeries_1.HistogramSeries.type]: {
            meta: {
                constructor: histogramSeries_1.HistogramSeries,
                setAsIs: ['lineDash'],
                defaults: Object.assign(Object.assign({}, seriesDefaults), { xKey: '', yKey: '', xName: '', yName: '', strokeWidth: 1, fillOpacity: 1, strokeOpacity: 1, lineDash: undefined, lineDashOffset: 0, areaPlot: false, binCount: undefined, bins: undefined, aggregation: 'sum' })
            },
            tooltip: tooltipMapping,
            highlightStyle: highlightStyleMapping,
            label: {
                meta: {
                    defaults: Object.assign(Object.assign({}, labelDefaults), { formatter: undefined })
                }
            },
            shadow: shadowMapping,
        }
    }, navigator: {
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
const POLAR_MAPPING = Object.assign(Object.assign({ meta: Object.assign(Object.assign({ constructor: polarChart_1.PolarChart }, chartMeta), { defaults: Object.assign(Object.assign({}, chartDefaults), { padding: {
                meta: {
                    constructor: padding_1.Padding,
                    defaults: {
                        top: 40,
                        right: 40,
                        bottom: 40,
                        left: 40
                    }
                }
            } }) }) }, commonChartMappings), { series: {
        [pieSeries_1.PieSeries.type]: {
            meta: {
                constructor: pieSeries_1.PieSeries,
                setAsIs: ['lineDash'],
                defaults: Object.assign(Object.assign({}, seriesDefaults), { title: undefined, angleKey: '', angleName: '', radiusKey: undefined, radiusName: undefined, labelKey: undefined, labelName: undefined, callout: {}, fillOpacity: 1, strokeOpacity: 1, rotation: 0, outerRadiusOffset: 0, innerRadiusOffset: 0, strokeWidth: 1, lineDash: undefined, lineDashOffset: 0, shadow: undefined })
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
                    defaults: Object.assign(Object.assign({}, labelDefaults), { offset: 3, minAngle: 20 })
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
        }
    } });
const HIERARCHY_MAPPING = Object.assign(Object.assign({ meta: Object.assign(Object.assign({ constructor: hierarchyChart_1.HierarchyChart }, chartMeta), { defaults: Object.assign({}, chartDefaults) }) }, commonChartMappings), { series: {
        [treemapSeries_1.TreemapSeries.type]: {
            meta: {
                constructor: treemapSeries_1.TreemapSeries,
                defaults: Object.assign(Object.assign({}, seriesDefaults), { showInLegend: false, labelKey: 'label', sizeKey: 'size', colorKey: 'color', colorDomain: [-5, 5], colorRange: ['#cb4b3f', '#6acb64'], colorParents: false, gradient: true, nodePadding: 2, title: {}, subtitle: {}, labels: {
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
        }
    } });
function tweakAxes(input, newAxes) {
    var _a;
    return Object.assign(Object.assign({}, input), { meta: Object.assign(Object.assign({}, input.meta), { defaults: Object.assign(Object.assign({}, (_a = input.meta) === null || _a === void 0 ? void 0 : _a.defaults), { axes: newAxes }) }) });
}
function tweakConstructor(input, constructor) {
    return Object.assign(Object.assign({}, input), { meta: Object.assign(Object.assign({}, input.meta), { constructor }) });
}
const SCATTER_HISTOGRAM_AXES = [{
        type: 'number',
        position: chartAxis_1.ChartAxisPosition.Bottom,
    }, {
        type: 'number',
        position: chartAxis_1.ChartAxisPosition.Left,
    }];
const BAR_AXES = [{
        type: 'number',
        position: chartAxis_1.ChartAxisPosition.Bottom,
    }, {
        type: 'category',
        position: chartAxis_1.ChartAxisPosition.Left,
    }];
exports.mappings = {
    [cartesianChart_1.CartesianChart.type]: CARTESIAN_MAPPING,
    [groupedCategoryChart_1.GroupedCategoryChart.type]: tweakConstructor(CARTESIAN_MAPPING, groupedCategoryChart_1.GroupedCategoryChart),
    'line': CARTESIAN_MAPPING,
    'area': CARTESIAN_MAPPING,
    'bar': tweakAxes(CARTESIAN_MAPPING, BAR_AXES),
    'column': CARTESIAN_MAPPING,
    'scatter': tweakAxes(CARTESIAN_MAPPING, SCATTER_HISTOGRAM_AXES),
    'histogram': tweakAxes(CARTESIAN_MAPPING, SCATTER_HISTOGRAM_AXES),
    [polarChart_1.PolarChart.type]: POLAR_MAPPING,
    'pie': POLAR_MAPPING,
    [hierarchyChart_1.HierarchyChart.type]: HIERARCHY_MAPPING,
    'treemap': HIERARCHY_MAPPING,
};
//# sourceMappingURL=agChartMappings.js.map