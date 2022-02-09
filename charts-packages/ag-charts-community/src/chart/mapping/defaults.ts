import { AgBaseChartOptions, AgChartPaddingOptions, AgChartLegendOptions, AgNavigatorOptions, AgChartTooltipOptions, AgChartCaptionOptions, FontWeight, AgCartesianChartOptions, AgLineSeriesOptions, AgBarSeriesOptions, AgNumberAxisOptions, AgCategoryAxisOptions, AgLogAxisOptions, AgGroupedCategoryAxisOptions, AgTimeAxisOptions, AgChartOptions, AgAreaSeriesOptions, AgDropShadowOptions, AgCartesianSeriesMarker, AgBaseSeriesOptions, AgHistogramSeriesOptions, AgCartesianSeriesOptions, AgScatterSeriesOptions, AgPieSeriesOptions, AgTreemapSeriesOptions, AgPolarChartOptions, AgHierarchyChartOptions, AgCartesianAxisOptions, AgSeriesTooltip } from "../agChartOptions";
import { LegendPosition } from "../legend";
import { Chart } from "../chart";
import { NumberAxis } from "../axis/numberAxis";
import { ChartAxisPosition } from "../chartAxis";
import { CategoryAxis } from "../axis/categoryAxis";
import { BarLabelPlacement } from "../series/cartesian/barSeries";

type CartesianSeriesOptions =
    AgLineSeriesOptions |
    AgScatterSeriesOptions |
    AgAreaSeriesOptions |
    AgBarSeriesOptions |
    AgHistogramSeriesOptions;
export type SeriesOptionsTypes = NonNullable<AgChartOptions['series']>[number];

const DEFAULT_BACKGROUND: AgBaseChartOptions['background'] = { visible: true, fill: 'white' };
const DEFAULT_PADDING: AgChartPaddingOptions = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
};
const DEFAULT_LEGEND: AgChartLegendOptions = {
    enabled: true,
    position: LegendPosition.Right,
    spacing: 20,
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
            fontFamily: 'Verdana, sans-serif',
            // formatter: undefined,
        },
    },
};

const DEFAULT_NAVIGATOR: AgNavigatorOptions = {
    enabled: false,
    height: 30,
    mask: {
        fill: '#999999',
        stroke: '#999999',
        strokeWidth: 1,
        fillOpacity: 0.2,
    },
    minHandle: {
        fill: '#f2f2f2',
        stroke: '#999999',
        strokeWidth: 1,
        width: 8,
        height: 16,
        gripLineGap: 2,
        gripLineLength: 8,
    },
    maxHandle: {
        fill: '#f2f2f2',
        stroke: '#999999',
        strokeWidth: 1,
        width: 8,
        height: 16,
        gripLineGap: 2,
        gripLineLength: 8,
    },
};
const DEFAULT_CHART_TOOLTIP: AgChartTooltipOptions = {
    enabled: true,
    tracking: true,
    delay: 0,
    class: Chart.defaultTooltipClass,
};
const DEFAULT_SERIES_TOOLTIP: AgSeriesTooltip = {
    enabled: true,
};
const DEFAULT_TITLE: AgChartCaptionOptions = {
    enabled: false,
    text: 'Title',
    fontStyle: undefined,
    fontWeight: 'bold' as FontWeight,
    fontSize: 14,
    fontFamily: 'Verdana, sans-serif',
    color: 'rgb(70, 70, 70)',
    padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
    },
};
const DEFAULT_SUBTITLE: AgChartCaptionOptions = {
    enabled: false,
    padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
    },
    text: 'Subtitle',
    fontStyle: undefined,
    fontWeight: undefined,
    fontSize: 12,
    fontFamily: 'Verdana, sans-serif',
    color: 'rgb(140, 140, 140)',
};

export const DEFAULT_CARTESIAN_CHART_OPTIONS: AgCartesianChartOptions = {
    type: 'cartesian',
    autoSize: true,
    background: DEFAULT_BACKGROUND,
    height: 300,
    width: 600,
    legend: DEFAULT_LEGEND,
    navigator: DEFAULT_NAVIGATOR,
    padding: DEFAULT_PADDING,
    subtitle: DEFAULT_SUBTITLE,
    title: DEFAULT_TITLE,
    tooltip: DEFAULT_CHART_TOOLTIP,
    series: [],
    axes: [{
        type: NumberAxis.type,
        position: ChartAxisPosition.Left,
    }, {
        type: CategoryAxis.type,
        position: ChartAxisPosition.Bottom,
    }],
};

export const DEFAULT_BAR_CHART_OVERRIDES: AgCartesianChartOptions = {
    axes: [{
        type: 'number',
        position: ChartAxisPosition.Bottom,
    }, {
        type: 'category',
        position: ChartAxisPosition.Left,
    }],
};

export const DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES: AgCartesianChartOptions = {
    axes: [{
        type: 'number',
        position: ChartAxisPosition.Bottom,
    }, {
        type: 'number',
        position: ChartAxisPosition.Left,
    }],
};

export const DEFAULT_POLAR_CHART_OPTIONS: AgPolarChartOptions = {
    type: 'polar',
    autoSize: true,
    background: DEFAULT_BACKGROUND,
    height: 300,
    width: 600,
    legend: DEFAULT_LEGEND,
    padding: DEFAULT_PADDING,
    subtitle: DEFAULT_SUBTITLE,
    title: DEFAULT_TITLE,
    tooltip: DEFAULT_CHART_TOOLTIP,
    series: [],
};

export const DEFAULT_HIERARCHY_CHART_OPTIONS: AgHierarchyChartOptions = {
    type: 'hierarchy',
    autoSize: true,
    background: DEFAULT_BACKGROUND,
    height: 300,
    width: 600,
    legend: DEFAULT_LEGEND,
    padding: DEFAULT_PADDING,
    subtitle: DEFAULT_SUBTITLE,
    title: DEFAULT_TITLE,
    tooltip: DEFAULT_CHART_TOOLTIP,
    series: [],
};

const DEFAULT_DROP_SHADOW: AgDropShadowOptions = {
    enabled: true,
    color: 'rgba(0, 0, 0, 0.5)',
    xOffset: 0,
    yOffset: 0,
    blur: 5
};

const DEFAULT_MARKER: AgCartesianSeriesMarker = {
    enabled: true,
    shape: 'circle',
    size: 6,
    maxSize: 30,
    strokeWidth: 1,
    formatter: undefined
};

const DEFAULT_HIGHLIGHT_STYLE: AgBaseSeriesOptions['highlightStyle'] = {
    item: { fill: 'yellow' },
    series: { dimOpacity: 1 },
};

const DEFAULT_LABEL: CartesianSeriesOptions['label'] = {
    enabled: true,
    fontStyle: undefined,
    fontWeight: undefined,
    fontSize: 12,
    fontFamily: 'Verdana, sans-serif',
    color: 'rgb(70, 70, 70)'
};

const DEFAULT_AXIS_LABEL: AgCartesianAxisOptions['label'] = {
    fontStyle: undefined,
    fontWeight: undefined,
    fontSize: 12,
    fontFamily: 'Verdana, sans-serif',
    padding: 5,
    rotation: 0,
    color: 'rgb(87, 87, 87)',
    formatter: undefined
};

const DEFAULT_CARTESIAN_SERIES_OPTIONS: CartesianSeriesOptions = {
    visible: true,
    showInLegend: true,
    cursor: 'default',
    xKey: '',
    xName: '',
    strokeWidth: 2,
    strokeOpacity: 1,
    lineDash: undefined,
    lineDashOffset: 0,
    highlightStyle: DEFAULT_HIGHLIGHT_STYLE,
    tooltip: DEFAULT_SERIES_TOOLTIP,
    label: DEFAULT_LABEL,
};

const DEFAULT_LINE_SERIES_OPTIONS: AgLineSeriesOptions = {
    ...DEFAULT_CARTESIAN_SERIES_OPTIONS,
    type: 'line',
    title: undefined,
    yKey: '',
    yName: '',
    tooltip: {
        ...DEFAULT_CARTESIAN_SERIES_OPTIONS.tooltip,
        format: undefined,
    },
    label: {
        ...DEFAULT_CARTESIAN_SERIES_OPTIONS.label,
        formatter: undefined,
    },
    marker: DEFAULT_MARKER,
};

const DEFAULT_BAR_SERIES_OPTIONS: AgBarSeriesOptions & { type: 'bar' } = {
    ...DEFAULT_CARTESIAN_SERIES_OPTIONS,
    type: 'bar',
    flipXY: true,
    fillOpacity: 1,
    yKeys: [],
    yNames: [],
    grouped: false,
    normalizedTo: undefined,
    label: {
        ...DEFAULT_CARTESIAN_SERIES_OPTIONS.label,
        formatter: undefined,
        placement: BarLabelPlacement.Inside,
    },
    shadow: DEFAULT_DROP_SHADOW,
};

const DEFAULT_COLUMN_SERIES_OPTIONS: AgBarSeriesOptions & { type: 'column' } = {
    ...DEFAULT_BAR_SERIES_OPTIONS,
    type: 'column',
    flipXY: false,
}

const DEFAULT_AREA_SERIES_OPTIONS: AgAreaSeriesOptions = {
    ...DEFAULT_CARTESIAN_SERIES_OPTIONS,
    type: 'area',
    // flipXY: true,
    // title: undefined,
    yKeys: [],
    yNames: [],
    normalizedTo: undefined,
    fillOpacity: 1,
    // label: {
    //     ...DEFAULT_LABEL,
    //     formatter: undefined,
    //     // placement: BarLabelPlacement.Inside,
    // },
    marker: DEFAULT_MARKER,
    shadow: DEFAULT_DROP_SHADOW,
};

const DEFAULT_SCATTER_SERIES_OPTIONS: AgScatterSeriesOptions = {
    type: 'scatter',
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
    highlightStyle: DEFAULT_HIGHLIGHT_STYLE,
    tooltip: DEFAULT_SERIES_TOOLTIP,
    label: DEFAULT_LABEL,
    marker: DEFAULT_MARKER,
}

const DEFAULT_HISTOGRAM_SERIES_OPTIONS: AgHistogramSeriesOptions = {
    type: 'histogram',
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
    highlightStyle: DEFAULT_HIGHLIGHT_STYLE,
    tooltip: DEFAULT_SERIES_TOOLTIP,
    label: DEFAULT_LABEL,
    shadow: DEFAULT_DROP_SHADOW,
};

const DEFAULT_PIE_SERIES_OPTIONS: AgPieSeriesOptions = {
    visible: true,
    showInLegend: true,
    cursor: 'default',
    angleKey: '',
    angleName: '',
    radiusKey: undefined,
    radiusName: undefined,
    labelKey: undefined,
    labelName: undefined,
    fillOpacity: 1,
    strokeOpacity: 1,
    rotation: 0,
    outerRadiusOffset: 0,
    innerRadiusOffset: 0,
    strokeWidth: 1,
    lineDash: undefined,
    lineDashOffset: 0,
    tooltip: DEFAULT_SERIES_TOOLTIP,
    highlightStyle: DEFAULT_HIGHLIGHT_STYLE,
    title: {
        enabled: true,
        padding: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        },
        text: 'Series Title',
        fontStyle: undefined,
        fontWeight: 'bold',
        fontSize: 14,
        fontFamily: 'Verdana, sans-serif',
        color: 'black'
    },
    label: {
        ...DEFAULT_LABEL,
        offset: 3,
        minAngle: 20,
    },
    callout: {
        length: 10,
        strokeWidth: 1
    },
    shadow: DEFAULT_DROP_SHADOW,
};

const DEFAULT_TREEMAP_SERIES_OPTIONS: AgTreemapSeriesOptions = {
    visible: true,
    cursor: 'default',
    showInLegend: false,
    labelKey: 'label',
    sizeKey: 'size',
    colorKey: 'color',
    colorDomain: [-5, 5],
    colorRange: ['#cb4b3f', '#6acb64'],
    colorParents: false,
    gradient: true,
    nodePadding: 2,
    tooltip: DEFAULT_SERIES_TOOLTIP,
    highlightStyle: DEFAULT_HIGHLIGHT_STYLE,
    title: {
        enabled: true,
        color: 'white',
        fontStyle: undefined,
        fontWeight: 'bold',
        fontSize: 12,
        fontFamily: 'Verdana, sans-serif',
        padding: 15,
    },
    subtitle: {
        enabled: true,
        color: 'white',
        fontStyle: undefined,
        fontWeight: undefined,
        fontSize: 9,
        fontFamily: 'Verdana, sans-serif',
        padding: 13
    },
    labels: {
        large: {
            enabled: true,
            fontStyle: undefined,
            fontWeight: 'bold',
            fontSize: 18,
            fontFamily: 'Verdana, sans-serif',
            color: 'white'
        },
        medium: {
            enabled: true,
            fontStyle: undefined,
            fontWeight: 'bold',
            fontSize: 14,
            fontFamily: 'Verdana, sans-serif',
            color: 'white'
        },
        small: {
            enabled: true,
            fontStyle: undefined,
            fontWeight: 'bold',
            fontSize: 10,
            fontFamily: 'Verdana, sans-serif',
            color: 'white'
        },
        color: {
            enabled: true,
            fontStyle: undefined,
            fontWeight: undefined,
            fontSize: 12,
            fontFamily: 'Verdana, sans-serif',
            color: 'white'
        }
    }
};

const DEFAULT_NUMBER_AXIS_OPTIONS: AgNumberAxisOptions = {
    type: 'number',
    // visibleRange: [0, 1],
    // thickness: 0,
    gridStyle: [{
        stroke: 'rgb(219, 219, 219)',
        lineDash: [4, 2]
    }],
    line: {
        width: 1,
        color: 'rgb(195, 195, 195)'
    },
    title: {
        padding: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        },
        text: 'Axis Title',
        fontStyle: undefined,
        fontWeight: 'bold' as 'bold',
        fontSize: 12,
        fontFamily: 'Verdana, sans-serif',
        color: 'rgb(70, 70, 70)'
    },
    label: {
        ...DEFAULT_AXIS_LABEL,
        formatter: undefined
    },
    tick: {
        width: 1,
        size: 6,
        color: 'rgb(195, 195, 195)',
        count: 10
    }
};

const DEFAULT_CATEGORY_AXIS_OPTIONS: AgCategoryAxisOptions = {
    ...DEFAULT_NUMBER_AXIS_OPTIONS,
    type: 'category',
};

const DEFAULT_LOG_AXIS_OPTIONS: AgLogAxisOptions = {
    ...DEFAULT_NUMBER_AXIS_OPTIONS,
    type: 'log',
    base: 10,
};

const DEFAULT_GROUPED_CATEGORY_AXIS_OPTIONS: AgGroupedCategoryAxisOptions = {
    ...DEFAULT_NUMBER_AXIS_OPTIONS,
    type: 'groupedCategory',
};

const DEFAULT_TIME_AXIS_OPTIONS: AgTimeAxisOptions = {
    ...DEFAULT_NUMBER_AXIS_OPTIONS,
    type: 'time',
};

export const DEFAULT_SERIES_OPTIONS: {[K in NonNullable<SeriesOptionsTypes['type']>]: SeriesOptionsTypes & { type?: K }} = {
    line: DEFAULT_LINE_SERIES_OPTIONS,
    bar: DEFAULT_BAR_SERIES_OPTIONS,
    area: DEFAULT_AREA_SERIES_OPTIONS,
    column: DEFAULT_COLUMN_SERIES_OPTIONS,
    histogram: DEFAULT_HISTOGRAM_SERIES_OPTIONS,
    scatter: DEFAULT_SCATTER_SERIES_OPTIONS,
    ohlc: {},
    pie: DEFAULT_PIE_SERIES_OPTIONS,
    treemap: DEFAULT_TREEMAP_SERIES_OPTIONS,
};

export type AxesOptionsTypes = NonNullable<AgCartesianChartOptions['axes']>[number];
export const DEFAULT_AXES_OPTIONS: {[K in NonNullable<AxesOptionsTypes['type']>]: AxesOptionsTypes & { type?: K }} = {
    number: DEFAULT_NUMBER_AXIS_OPTIONS,
    category: DEFAULT_CATEGORY_AXIS_OPTIONS,
    groupedCategory: DEFAULT_GROUPED_CATEGORY_AXIS_OPTIONS,
    log: DEFAULT_LOG_AXIS_OPTIONS,
    time: DEFAULT_TIME_AXIS_OPTIONS,
};
