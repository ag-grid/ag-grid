import { Padding } from "../util/padding";
import { CartesianChart } from "./cartesianChart";
import { GroupedCategoryChart } from "./groupedCategoryChart";
import { NumberAxis } from "./axis/numberAxis";
import { CategoryAxis } from "./axis/categoryAxis";
import { GroupedCategoryAxis } from "./axis/groupedCategoryAxis";
import { LineSeries } from "./series/cartesian/lineSeries";
import { BarSeries } from "./series/cartesian/barSeries";
import { HistogramSeries } from "./series/cartesian/histogramSeries";
import { ScatterSeries } from "./series/cartesian/scatterSeries";
import { AreaSeries } from "./series/cartesian/areaSeries";
import { PolarChart } from "./polarChart";
import { PieSeries } from "./series/polar/pieSeries";
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

/*
    This file defines the specs for creating different kinds of charts, but
    contains no code that uses the specs to actually create charts
*/

const chartPadding = 20;
const commonChartMappings: any = {
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
                left: chartPadding
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
                enabled: true,
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
                enabled: true,
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
                        fontFamily: 'Verdana, sans-serif'
                    }
                }
            }
        }
    }
};

const chartDefaults: any = {
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
    constructorParams: ['document'], // Config object properties to be used as constructor parameters, in that order.
    setAsIs: ['container', 'data', 'tooltipOffset'], // Properties that should be set on the component as is (without pre-processing).
    nonSerializable: ['container', 'data']
};

const axisDefaults: any = {
    defaults: {
        visibleRange: [0, 1],
        label: {},
        tick: {},
        title: {},
        line: {},
        gridStyle: [{
            stroke: 'rgb(219, 219, 219)',
            lineDash: [4, 2]
        }]
    }
};

const seriesDefaults: any = {
    visible: true,
    showInLegend: true,
    listeners: undefined
};

const columnSeriesDefaults: any = {
    fillOpacity: 1,
    strokeOpacity: 1,
    xKey: '',
    xName: '',
    yKeys: [],
    yNames: [],
    grouped: false,
    normalizedTo: undefined,
    strokeWidth: 1,
    lineDash: undefined,
    lineDashOffset: 0,
    shadow: undefined,
    highlightStyle: {
        fill: 'yellow'
    }
};

const shadowMapping: any = {
    shadow: {
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
    }
};

const labelDefaults: any = {
    enabled: true,
    fontStyle: undefined,
    fontWeight: undefined,
    fontSize: 12,
    fontFamily: 'Verdana, sans-serif',
    color: 'rgb(70, 70, 70)'
};

const barLabelMapping: any = {
    label: {
        meta: {
            defaults: {
                ...labelDefaults,
                formatter: undefined
            }
        }
    }
};

const tooltipMapping: any = {
    tooltip: {
        meta: {
            defaults: {
                enabled: true,
                renderer: undefined,
                format: undefined
            }
        }
    }
};

const axisMappings: any = {
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
                enabled: true,
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
            defaults: {
                width: 1,
                size: 6,
                color: 'rgb(195, 195, 195)',
                count: 10
            }
        }
    }
};

const mappings: any = {
    [CartesianChart.type]: {
        meta: { // unlike other entries, 'meta' is not a component type or a config name
            constructor: CartesianChart, // Constructor function for the `cartesian` type.
            ...chartMeta,
            defaults: { // These values will be used if properties in question are not in the config object.
                ...chartDefaults,
                axes: [{
                    type: NumberAxis.type,
                    position: 'left'
                }, {
                    type: CategoryAxis.type,
                    position: 'bottom'
                }]
            },
        },
        ...commonChartMappings,
        axes: {
            [NumberAxis.type]: {
                meta: {
                    constructor: NumberAxis,
                    setAsIs: ['gridStyle', 'visibleRange'],
                    ...axisDefaults
                },
                ...axisMappings
            },
            [CategoryAxis.type]: {
                meta: {
                    constructor: CategoryAxis,
                    setAsIs: ['gridStyle', 'visibleRange'],
                    ...axisDefaults
                },
                ...axisMappings
            },
            [GroupedCategoryAxis.type]: {
                meta: {
                    constructor: GroupedCategoryAxis,
                    setAsIs: ['gridStyle', 'visibleRange'],
                    ...axisDefaults
                },
                ...axisMappings
            },
            [TimeAxis.type]: {
                meta: {
                    constructor: TimeAxis,
                    setAsIs: ['gridStyle', 'visibleRange'],
                    ...axisDefaults
                },
                ...axisMappings
            }
        },
        series: {
            column: {
                meta: {
                    constructor: BarSeries,
                    setAsIs: ['lineDash'],
                    defaults: {
                        flipXY: false, // vertical bars
                        ...seriesDefaults,
                        ...columnSeriesDefaults
                    }
                },
                highlightStyle: {},
                ...tooltipMapping,
                ...barLabelMapping,
                ...shadowMapping
            },
            [BarSeries.type]: {
                meta: {
                    constructor: BarSeries,
                    setAsIs: ['lineDash'],
                    defaults: {
                        flipXY: true, // horizontal bars
                        ...seriesDefaults,
                        ...columnSeriesDefaults
                    }
                },
                highlightStyle: {},
                ...tooltipMapping,
                ...barLabelMapping,
                ...shadowMapping
            },
            [LineSeries.type]: {
                meta: {
                    constructor: LineSeries,
                    setAsIs: ['lineDash'],
                    defaults: {
                        ...seriesDefaults,
                        title: undefined,
                        xKey: '',
                        xName: '',
                        yKey: '',
                        yName: '',
                        strokeWidth: 2,
                        strokeOpacity: 1,
                        lineDash: undefined,
                        lineDashOffset: 0,
                        highlightStyle: {
                            fill: 'yellow'
                        }
                    }
                },
                ...tooltipMapping,
                highlightStyle: {},
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
            [ScatterSeries.type]: {
                meta: {
                    constructor: ScatterSeries,
                    defaults: {
                        ...seriesDefaults,
                        title: undefined,
                        xKey: '',
                        yKey: '',
                        sizeKey: undefined,
                        labelKey: undefined,
                        xName: '',
                        yName: '',
                        sizeName: 'Size',
                        labelName: 'Label',
                        strokeWidth: 2,
                        fillOpacity: 1,
                        strokeOpacity: 1,
                        highlightStyle: {
                            fill: 'yellow'
                        }
                    }
                },
                ...tooltipMapping,
                highlightStyle: {},
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
            [AreaSeries.type]: {
                meta: {
                    constructor: AreaSeries,
                    setAsIs: ['lineDash'],
                    defaults: {
                        ...seriesDefaults,
                        xKey: '',
                        xName: '',
                        yKeys: [],
                        yNames: [],
                        normalizedTo: undefined,
                        fillOpacity: 1,
                        strokeOpacity: 1,
                        strokeWidth: 2,
                        lineDash: undefined,
                        lineDashOffset: 0,
                        shadow: undefined,
                        highlightStyle: {
                            fill: 'yellow'
                        }
                    }
                },
                ...tooltipMapping,
                highlightStyle: {},
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
                ...shadowMapping
            },
            [HistogramSeries.type]: {
                meta: {
                    constructor: HistogramSeries,
                    setAsIs: ['lineDash'],
                    defaults: {
                        ...seriesDefaults,
                        title: undefined,
                        xKey: '',
                        yKey: '',
                        xName: '',
                        yName: '',
                        strokeWidth: 1,
                        fillOpacity: 1,
                        strokeOpacity: 1,
                        lineDash: undefined,
                        lineDashOffset: 0,
                        areaPlot: false,
                        binCount: undefined,
                        bins: undefined,
                        aggregation: 'sum',
                        highlightStyle: {
                            fill: 'yellow'
                        }
                    }
                },
                ...tooltipMapping,
                highlightStyle: {},
                label: {
                    meta: {
                        defaults: {
                            ...labelDefaults,
                            formatter: undefined
                        }
                    }
                },
                ...shadowMapping
            }
        },
        navigator: {
            meta: {
                constructor: Navigator,
                defaults: {
                    enabled: false,
                    height: 30,
                    min: 0,
                    max: 1
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
        }
    },
    [PolarChart.type]: {
        meta: {
            constructor: PolarChart,
            ...chartMeta,
            defaults: {
                ...chartDefaults,
                padding: {
                    meta: {
                        constructor: Padding,
                        defaults: {
                            top: 40,
                            right: 40,
                            bottom: 40,
                            left: 40
                        }
                    }
                }
            }
        },
        ...commonChartMappings,
        series: {
            [PieSeries.type]: {
                meta: {
                    constructor: PieSeries,
                    setAsIs: ['lineDash'],
                    defaults: {
                        ...seriesDefaults,
                        title: undefined,
                        angleKey: '',
                        angleName: '',
                        radiusKey: undefined,
                        radiusName: undefined,
                        labelKey: undefined,
                        labelName: undefined,
                        callout: {},
                        fillOpacity: 1,
                        strokeOpacity: 1,
                        rotation: 0,
                        outerRadiusOffset: 0,
                        innerRadiusOffset: 0,
                        strokeWidth: 1,
                        lineDash: undefined,
                        lineDashOffset: 0,
                        shadow: undefined
                    }
                },
                ...tooltipMapping,
                highlightStyle: {},
                title: {
                    meta: {
                        constructor: Caption,
                        defaults: {
                            enabled: true,
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
                        defaults: {
                            ...labelDefaults,
                            offset: 3,
                            minAngle: 20
                        }
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
                ...shadowMapping
            }
        }
    }
};

// Amend the `mappings` object with aliases for different chart types.
{
    const typeToAliases: { [key in string]: string[] } = {
        cartesian: ['line', 'area', 'bar', 'column'],
        polar: ['pie']
    };
    for (const type in typeToAliases) {
        typeToAliases[type].forEach(alias => {
            mappings[alias] = mappings[type];
        });
    }
}

// Special handling for scatter and histogram charts, for which both axes should default to type `number`.
mappings['scatter'] =
mappings['histogram'] = {
    ...mappings.cartesian,
    meta: {
        ...mappings.cartesian.meta,
        defaults: { // These values will be used if properties in question are not in the config object.
            ...chartDefaults,
            axes: [{
                type: 'number',
                position: 'bottom'
            }, {
                type: 'number',
                position: 'left'
            }]
        }
    }
};

const groupedCategoryChartMapping = Object.create(mappings[CartesianChart.type]);
const groupedCategoryChartMeta = Object.create(groupedCategoryChartMapping.meta);
groupedCategoryChartMeta.constructor = GroupedCategoryChart;
groupedCategoryChartMapping.meta = groupedCategoryChartMeta;
mappings[GroupedCategoryChart.type] = groupedCategoryChartMapping;

export default mappings;