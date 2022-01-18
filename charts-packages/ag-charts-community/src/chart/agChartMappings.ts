import { Padding } from "../util/padding";
import { CartesianChart } from "./cartesianChart";
import { GroupedCategoryChart } from "./groupedCategoryChart";
import { NumberAxis } from "./axis/numberAxis";
import { CategoryAxis } from "./axis/categoryAxis";
import { GroupedCategoryAxis } from "./axis/groupedCategoryAxis";
import { LineSeries, LineSeriesTooltip } from "./series/cartesian/lineSeries";
import { BarSeries, BarLabelPlacement, BarSeriesTooltip } from "./series/cartesian/barSeries";
import { HistogramSeries, HistogramSeriesTooltip } from "./series/cartesian/histogramSeries";
import { ScatterSeries, ScatterSeriesTooltip } from "./series/cartesian/scatterSeries";
import { AreaSeries, AreaSeriesTooltip } from "./series/cartesian/areaSeries";
import { PolarChart } from "./polarChart";
import { PieSeries, PieTitle, PieSeriesTooltip } from "./series/polar/pieSeries";
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
import { TreemapSeries, TreemapSeriesTooltip } from "./series/hierarchy/treemapSeries";
import { LogAxis } from "./axis/logAxis";
import { Label } from "./label";
import { ChartAxisPosition, ChartAxis } from "./chartAxis";
import { HighlightStyle } from "./series/series";
import { FontWeight } from "../scene/shape/text";

/*
    This file defines the specs for creating different kinds of charts, but
    contains no code that uses the specs to actually create charts
*/

type Primitive = number | string | boolean;
type ChartTypeAlias = 'line' | 'area' | 'bar' | 'column' | 'scatter' | 'histogram' | 'pie' | 'treemap';
type ChartType = ChartTypeAlias | typeof CartesianChart.type | typeof PolarChart.type | typeof HierarchyChart.type;

type SeriesTypeMapping = {
    [TreemapSeries.type]: TreemapSeries,
    [BarSeries.type]: BarSeries,
    [LineSeries.type]: LineSeries,
    [ScatterSeries.type]: ScatterSeries,
    [AreaSeries.type]: AreaSeries,
    [HistogramSeries.type]: HistogramSeries,
    [PieSeries.type]: PieSeries,
    column: BarSeries,
};

type CartesianSeriesTypeMapping = Omit<SeriesTypeMapping, typeof TreemapSeries.type | typeof PieSeries.type>;
type PolarTypeMapping = Pick<SeriesTypeMapping, typeof PieSeries.type>;
type HeirarchySeriesTypeMapping = Pick<SeriesTypeMapping, typeof TreemapSeries.type>;

type AxesTypeMapping = {
    number: NumberAxis,
    [LogAxis.type]: LogAxis,
    [CategoryAxis.type]: CategoryAxis,
    [GroupedCategoryAxis.type]: GroupedCategoryAxis,
    [TimeAxis.type]: TimeAxis,
};

interface MetaDefinition<C, D> {
    // Charts components' constructors normally don't take any parameters (which makes things consistent -- everything
    // is configured the same way, via the properties, and makes the factory pattern work well) but the charts
    // themselves are the exceptions.
    // If a chart config has the (optional) `document` property, it will be passed to the constructor.
    // There is no actual `document` property on the chart, it can only be supplied during instantiation.
    constructor?: (new (...params: any[]) => C) | Function,
    /** Config object properties to be used as constructor parameters, in that order. */
    constructorParams?: ('document' | keyof C)[],
    /** Properties that should be set on the component as is (without pre-processing). */
    setAsIs?: (keyof C)[],
    nonSerializable?: (keyof C)[],
    defaults?: D,
}

interface BaseDefinition<T> {
    meta?: MetaDefinition<T, {[K in keyof T]?: T[K] | BasicMapping<T[K]> }>;
    listeners?: {[K in keyof T]?: Function} | undefined;
}

type PropertyType<P, C> = P extends Primitive | Primitive[] ? P : C;

// Due to lack of support in Typescript 3.x for recursive types, this is the best we can do to
// represent the mapping model with a restricted nesting level until we upgrade to TS 4.x.
type BasicMapping<T> = BaseDefinition<T> & {
    [P in keyof T]?: T[P] extends Array<infer E> ? PropertyType<T[P], BaseDefinition<E>> : PropertyType<T[P], BaseDefinition<T[P]> & {
        [P2 in keyof T[P]]?: T[P][P2] extends Array<infer E> ? PropertyType<T[P][P2], BaseDefinition<E>> : PropertyType<T[P][P2], BaseDefinition<T[P][P2]> & {
            [P3 in keyof T[P][P2]]?: T[P][P2][P3] extends Array<infer E> ? PropertyType<T[P][P2][P3], BaseDefinition<E>> : PropertyType<T[P][P2][P3], BaseDefinition<T[P][P2][P3]> & {
                [P4 in keyof T[P][P2][P3]]?: T[P][P2][P3][P4] extends Array<infer E> ? PropertyType<T[P][P2][P3][P4], BaseDefinition<E>> : PropertyType<T[P][P2][P3][P4], BaseDefinition<T[P][P2][P3][P4]> & {
                    [P5 in keyof T[P][P2][P3][P4]]?: T[P][P2][P3][P4][P5] extends Array<infer E> ? PropertyType<T[P][P2][P3][P4][P5], BaseDefinition<E>> : PropertyType<T[P][P2][P3][P4][P5], BaseDefinition<T[P][P2][P3][P4][P5]>>
                }>
            }>
        }>     
    }>
};

type SwitchableMapping<T, M extends {[key in keyof T]?: { [key: string]: any }}> = BaseDefinition<T> & {
    [K in Exclude<keyof T, keyof M>]?: PropertyType<T[K], BasicMapping<T[K]>>;
} & {
    [K in Extract<keyof T, keyof M>]: {[C in keyof M[K]]: BasicMapping<M[K][C]>};
};

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
                fontWeight: 'bold' as FontWeight,
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
    constructorParams: ['document'] as ['document'],
    // Properties that should be set on the component as is (without pre-processing).
    setAsIs: ['container', 'data'] as ['container', 'data'],
    nonSerializable: ['container', 'data'] as ['container', 'data'],
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

const highlightStyleMapping: BasicMapping<HighlightStyle> = {
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
        defaults: {
            ...labelDefaults,
            formatter: undefined,
            placement: BarLabelPlacement.Inside,
        }
    }
};

const tooltipMapping: BasicMapping<AreaSeriesTooltip | BarSeriesTooltip | HistogramSeriesTooltip | LineSeriesTooltip | ScatterSeriesTooltip | TreemapSeriesTooltip | PieSeriesTooltip> = {
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
                fontWeight: 'bold' as 'bold',
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
            setAsIs: ['count'] as (keyof AxisTick)[],
            defaults: {
                width: 1,
                size: 6,
                color: 'rgb(195, 195, 195)',
                count: 10
            }
        }
    }
};

const CARTESIAN_MAPPING: SwitchableMapping<CartesianChart, { axes: AxesTypeMapping, series: CartesianSeriesTypeMapping }> = {
    meta: { // unlike other entries, 'meta' is not a component type or a config name
        constructor: CartesianChart, // Constructor function for the `cartesian` type.
        ...chartMeta,
        defaults: { // These values will be used if properties in question are not in the config object.
            ...chartDefaults,
            axes: [{
                type: NumberAxis.type,
                position: ChartAxisPosition.Left,
            }, {
                type: CategoryAxis.type,
                position: ChartAxisPosition.Bottom,
            }]
        },
    },
    ...commonChartMappings,
    axes: {
        ['number']: {
            meta: {
                constructor: NumberAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: axisDefaults,
            },
            ...axisMappings
        },
        [LogAxis.type]: {
            meta: {
                constructor: LogAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: {
                    ...axisDefaults,
                    base: 10
                },
            },
            ...axisMappings
        },
        [CategoryAxis.type]: {
            meta: {
                constructor: CategoryAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: axisDefaults,
            },
            ...axisMappings
        },
        [GroupedCategoryAxis.type]: {
            meta: {
                constructor: GroupedCategoryAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: axisDefaults,
            },
            ...axisMappings
        },
        [TimeAxis.type]: {
            meta: {
                constructor: TimeAxis,
                setAsIs: ['gridStyle', 'visibleRange'],
                defaults: axisDefaults,
            },
            ...axisMappings
        },
    },
    series: {
        column: {
            meta: {
                constructor: BarSeries,
                setAsIs: ['lineDash', 'yNames'],
                defaults: {
                    flipXY: false, // vertical bars
                    ...seriesDefaults,
                    ...columnSeriesDefaults
                }
            },
            highlightStyle: highlightStyleMapping,
            tooltip: tooltipMapping,
            label: barLabelMapping,
            shadow: shadowMapping,
        },
        [BarSeries.type]: {
            meta: {
                constructor: BarSeries,
                setAsIs: ['lineDash', 'yNames'],
                defaults: {
                    flipXY: true, // horizontal bars
                    ...seriesDefaults,
                    ...columnSeriesDefaults
                }
            },
            highlightStyle: highlightStyleMapping,
            tooltip: tooltipMapping,
            label: barLabelMapping,
            shadow: shadowMapping,
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
                    lineDashOffset: 0
                }
            },
            tooltip: tooltipMapping,
            highlightStyle: highlightStyleMapping,
            label: {
                meta: {
                    defaults: {
                        ...labelDefaults,
                        formatter: undefined
                    }
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
                    strokeOpacity: 1
                }
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
                    defaults: {
                        ...labelDefaults
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
                    shadow: undefined
                }
            },
            tooltip: tooltipMapping,
            highlightStyle: highlightStyleMapping,
            label: {
                meta: {
                    defaults: {
                        ...labelDefaults,
                        formatter: undefined
                    }
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
        [HistogramSeries.type]: {
            meta: {
                constructor: HistogramSeries,
                setAsIs: ['lineDash'],
                defaults: {
                    ...seriesDefaults,
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
                    aggregation: 'sum'
                }
            },
            tooltip: tooltipMapping,
            highlightStyle: highlightStyleMapping,
            label: {
                meta: {
                    defaults: {
                        ...labelDefaults,
                        formatter: undefined
                    }
                }
            },
            shadow: shadowMapping,
        }
    },
    navigator: {
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
    },
};

const POLAR_MAPPING: SwitchableMapping<PolarChart, { series: PolarTypeMapping }> = {
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
            shadow: shadowMapping,
        }
    },
};

const HIERARCHY_MAPPING: SwitchableMapping<HierarchyChart, { series: HeirarchySeriesTypeMapping }> = {
    meta: {
        constructor: HierarchyChart,
        ...chartMeta,
        defaults: {
            ...chartDefaults
        }
    },
    ...commonChartMappings,
    series: {
        [TreemapSeries.type]: {
            meta: {
                constructor: TreemapSeries,
                defaults: {
                    ...seriesDefaults,
                    showInLegend: false,
                    labelKey: 'label',
                    sizeKey: 'size',
                    colorKey: 'color',
                    colorDomain: [-5, 5],
                    colorRange: ['#cb4b3f', '#6acb64'],
                    colorParents: false,
                    gradient: true,
                    nodePadding: 2,
                    title: {},
                    subtitle: {},
                    labels: {
                        large: {},
                        medium: {},
                        small: {},
                        color: {}
                    }
                }
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
        }
    }
};

function tweakAxes<M extends { meta?: { defaults?: {} } }>(
    input: M,
    newAxes: BasicMapping<ChartAxis>[],
): M & { meta: { defaults: { axes: typeof newAxes } } } {
    return {
        ...input,
        meta: {
            ...input.meta,
            defaults: { 
                ...input.meta?.defaults,
                axes: newAxes,
            }
        }
    };
}

function tweakConstructor<M extends { meta?: any }, T>(
    input: M,
    constructor: { new (): T },
): M & { meta: { constructor: typeof constructor } } {
    return {
        ...input,
        meta: {
            ...input.meta,
            constructor,
        }
    };
}

const SCATTER_HISTOGRAM_AXES: BasicMapping<ChartAxis>[] = [{
    type: 'number',
    position: ChartAxisPosition.Bottom,
}, {
    type: 'number',
    position: ChartAxisPosition.Left,
}];

const BAR_AXES: BasicMapping<ChartAxis>[] = [{
    type: 'number',
    position: ChartAxisPosition.Bottom,
}, {
    type: 'category',
    position: ChartAxisPosition.Left,
}];

export const mappings: Record<ChartType, BasicMapping<any>> = {
    [CartesianChart.type as 'cartesian']: CARTESIAN_MAPPING,
    [GroupedCategoryChart.type]: tweakConstructor(CARTESIAN_MAPPING, GroupedCategoryChart),
    'line': CARTESIAN_MAPPING,
    'area': CARTESIAN_MAPPING, 
    'bar': tweakAxes(CARTESIAN_MAPPING, BAR_AXES), 
    'column': CARTESIAN_MAPPING,
    'scatter': tweakAxes(CARTESIAN_MAPPING, SCATTER_HISTOGRAM_AXES),
    'histogram': tweakAxes(CARTESIAN_MAPPING, SCATTER_HISTOGRAM_AXES),

    [PolarChart.type]: POLAR_MAPPING,
    'pie': POLAR_MAPPING,

    [HierarchyChart.type]: HIERARCHY_MAPPING,
    'treemap': HIERARCHY_MAPPING,
};
