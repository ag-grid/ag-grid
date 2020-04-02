import { Padding } from "../util/padding";
import { CartesianChart } from "./cartesianChart";
import { NumberAxis } from "./axis/numberAxis";
import { CategoryAxis } from "./axis/categoryAxis";
import { LineSeries } from "./series/cartesian/lineSeries";
import { ColumnSeries } from "./series/cartesian/columnSeries";
import { BarSeries } from "./series/cartesian/barSeries";
import { ScatterSeries } from "./series/cartesian/scatterSeries";
import { AreaSeries } from "./series/cartesian/areaSeries";
import { PolarChart } from "./polarChart";
import { PieSeries } from "./series/polar/pieSeries";
import { AxisLabel, AxisTick } from "../axis";
import { TimeAxis } from "./axis/timeAxis";
import { Caption } from "../caption";
import { DropShadow } from "../scene/dropShadow";
import { Legend, LegendPosition } from "./legend";
import palette from "./palettes";

/*
    This file defines the specs for creating different kinds of charts, but
    contains no code that uses the specs to actually create charts
*/

const chartMappings = {
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
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            }
        }
    },
    title: {
        meta: {
            constructor: Caption,
            defaults: {
                enabled: true,
                padding: new Padding(10),
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
            constructor: Caption,
            defaults: {
                enabled: true,
                padding: new Padding(10),
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
            constructor: Legend,
            defaults: {
                enabled: true,
                position: LegendPosition.Right,
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
} as any;

const chartDefaults = {
    container: undefined,
    data: [],
    padding: new Padding(20),
    title: undefined,
    subtitle: undefined,
} as any;

const chartMeta = {
    // Charts components' constructors normally don't take any parameters (which makes things consistent -- everything
    // is configured the same way, via the properties, and makes the factory pattern work well) but the charts
    // themselves are the exceptions.
    // If a chart config has the (optional) `document` property, it will be passed to the constructor.
    // There is no actual `document` property on the chart, it can only be supplied during instantiation.
    constructorParams: ['document'], // Config object properties to be used as constructor parameters, in that order.
    setAsIs: ['container', 'data', 'tooltipOffset'], // Properties that should be set on the component as is (without pre-processing).
};

const axisDefaults = {
    defaults: {
        gridStyle: [{
            stroke: 'rgba(219, 219, 219, 1)',
            lineDash: [4, 2]
        }]
    }
};

const seriesDefaults = {
    visible: true,
    showInLegend: true
} as any;

const columnSeriesDefaults = {
    fills: palette.fills,
    strokes: palette.strokes,
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
} as any;

const shadowMapping = {
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

const labelDefaults = {
    enabled: true,
    fontStyle: undefined,
    fontWeight: undefined,
    fontSize: 12,
    fontFamily: 'Verdana, sans-serif',
    color: 'rgba(70, 70, 70, 1)'
} as any;

const labelMapping = {
    label: {
        meta: {
            defaults: {
                ...labelDefaults
            }
        }
    }
} as any;

const axisMappings = {
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
            constructor: Caption,
            defaults: {
                enabled: true,
                padding: new Padding(10),
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
            constructor: AxisLabel,
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
            constructor: AxisTick,
            defaults: {
                width: 1,
                size: 6,
                color: 'rgba(195, 195, 195, 1)',
                count: 10
            }
        }
    }
} as any;

const mappings = {
    [CartesianChart.type]: {
        meta: { // unlike other entries, 'meta' is not a component type or a config name
            constructor: CartesianChart, // Constructor function for the `cartesian` type.
            ...chartMeta,
            defaults: { // These values will be used if properties in question are not in the config object.
                ...chartDefaults,
                axes: [{
                    type: CategoryAxis.type,
                    position: 'bottom'
                }, {
                    type: NumberAxis.type,
                    position: 'left'
                }]
            },
        },
        ...chartMappings,
        axes: {
            [NumberAxis.type]: {
                meta: {
                    constructor: NumberAxis,
                    setAsIs: ['gridStyle'],
                    ...axisDefaults
                },
                ...axisMappings
            },
            [CategoryAxis.type]: {
                meta: {
                    constructor: CategoryAxis,
                    setAsIs: ['gridStyle'],
                    ...axisDefaults
                },
                ...axisMappings
            },
            [TimeAxis.type]: {
                meta: {
                    constructor: TimeAxis,
                    setAsIs: ['gridStyle'],
                    ...axisDefaults
                },
                ...axisMappings
            }
        },
        series: {
            [LineSeries.type]: {
                meta: {
                    constructor: LineSeries,
                    defaults: {
                        title: undefined,
                        xKey: '',
                        xName: '',
                        yKey: '',
                        yName: '',
                        stroke: palette.fills[0],
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
            [ColumnSeries.type]: {
                meta: {
                    constructor: ColumnSeries,
                    defaults: {
                        ...seriesDefaults,
                        ...columnSeriesDefaults
                    }
                },
                highlightStyle: {},
                ...labelMapping,
                ...shadowMapping
            },
            [BarSeries.type]: {
                meta: {
                    constructor: BarSeries,
                    defaults: {
                        ...seriesDefaults,
                        ...columnSeriesDefaults
                    }
                },
                highlightStyle: {},
                ...labelMapping,
                ...shadowMapping
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
                        fill: palette.fills[0],
                        stroke: palette.strokes[0],
                        strokeWidth: 2,
                        fillOpacity: 1,
                        strokeOpacity: 1,
                        tooltipRenderer: undefined,
                        highlightStyle: {
                            fill: 'yellow'
                        }
                    }
                },
                highlightStyle: {},
                marker: {}
            },
            [AreaSeries.type]: {
                meta: {
                    constructor: AreaSeries,
                    defaults: {
                        ...seriesDefaults,
                        xKey: '',
                        xName: '',
                        yKeys: [],
                        yNames: [],
                        normalizedTo: undefined,
                        fills: palette.fills,
                        strokes: palette.strokes,
                        fillOpacity: 1,
                        strokeOpacity: 1,
                        strokeWidth: 2,
                        shadow: undefined,
                        highlightStyle: {
                            fill: 'yellow'
                        }
                    }
                },
                highlightStyle: {},
                marker: {},
                ...shadowMapping
            }
        }
    },
    [PolarChart.type]: {
        meta: {
            constructor: PolarChart,
            ...chartMeta,
            defaults: {
                ...chartDefaults,
                padding: new Padding(40),
            }
        },
        ...chartMappings,
        series: {
            [PieSeries.type]: {
                meta: {
                    constructor: PieSeries,
                    defaults: {
                        ...seriesDefaults,
                        title: undefined,
                        calloutColors: palette.strokes,
                        calloutStrokeWidth: 1,
                        calloutLength: 10,
                        angleKey: '',
                        angleName: '',
                        radiusKey: undefined,
                        radiusName: undefined,
                        labelKey: undefined,
                        labelName: undefined,
                        fills: palette.fills,
                        strokes: palette.strokes,
                        fillOpacity: 1,
                        strokeOpacity: 1,
                        rotation: 0,
                        outerRadiusOffset: 0,
                        innerRadiusOffset: 0,
                        strokeWidth: 1,
                        shadow: undefined
                    }
                },
                highlightStyle: {},
                title: {
                    meta: {
                        constructor: Caption,
                        defaults: {
                            enabled: true,
                            padding: new Padding(10),
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
                            colors: palette.strokes,
                            length: 10,
                            strokeWidth: 1
                        }
                    }
                },
                ...shadowMapping
            }
        }
    }
} as any;

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

    // Special handling for scatter charts where both axes should default to type `number`.
    mappings['scatter'] = {
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
}

export default mappings;