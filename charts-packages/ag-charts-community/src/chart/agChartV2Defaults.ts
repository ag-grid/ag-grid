import { AgBaseChartOptions, AgChartPaddingOptions, AgChartLegendOptions, AgNavigatorOptions, AgChartTooltipOptions, AgChartCaptionOptions, FontWeight, AgCartesianChartOptions, AgLineSeriesOptions, AgBarSeriesOptions, AgNumberAxisOptions, AgCategoryAxisOptions, AgLogAxisOptions, AgGroupedCategoryAxisOptions, AgTimeAxisOptions, AgChartOptions } from "./agChartOptions";
import { LegendPosition } from "./legend";
import { Chart } from "./chart";
import { NumberAxis } from "./axis/numberAxis";
import { ChartAxisPosition } from "./chartAxis";
import { CategoryAxis } from "./axis/categoryAxis";
import { BarLabelPlacement } from "./series/cartesian/barSeries";

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
const DEFAULT_TOOLTIP: AgChartTooltipOptions = {
    enabled: true,
    tracking: true,
    delay: 0,
    class: Chart.defaultTooltipClass,
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
    autoSize: true,
    background: DEFAULT_BACKGROUND,
    height: 300,
    width: 600,
    legend: DEFAULT_LEGEND,
    navigator: DEFAULT_NAVIGATOR,
    padding: DEFAULT_PADDING,
    subtitle: DEFAULT_SUBTITLE,
    title: DEFAULT_TITLE,
    tooltip: DEFAULT_TOOLTIP,
    type: 'cartesian',
    series: [],
    axes: [{
        type: NumberAxis.type,
        position: ChartAxisPosition.Left,
    }, {
        type: CategoryAxis.type,
        position: ChartAxisPosition.Bottom,
    }],
};

const DEFAULT_LINE_SERIES_OPTIONS: AgLineSeriesOptions = {
    type: 'line',
    visible: true,
    showInLegend: true,
    cursor: 'default',
    title: undefined,
    xKey: '',
    xName: '',
    yKey: '',
    yName: '',
    strokeWidth: 2,
    strokeOpacity: 1,
    lineDash: undefined,
    lineDashOffset: 0,
    tooltip: {
        enabled: true,
        renderer: undefined,
        format: undefined,
    },
    highlightStyle: {
        item: { fill: 'yellow' },
        series: { dimOpacity: 1 },
    },
    label: {
        enabled: true,
        fontStyle: undefined,
        fontWeight: undefined,
        fontSize: 12,
        fontFamily: 'Verdana, sans-serif',
        color: 'rgb(70, 70, 70)',
        formatter: undefined,
    },
    marker: {
        enabled: true,
        shape: 'circle',
        size: 6,
        maxSize: 30,
        strokeWidth: 1,
        formatter: undefined,
    },
};

const DEFAULT_BAR_SERIES_OPTIONS: AgBarSeriesOptions & { type: 'bar' } = {
    type: 'bar',
    flipXY: true,
    visible: true,
    showInLegend: true,
    cursor: 'default',
    // title: undefined,
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
    tooltip: {
        enabled: true,
    },
    highlightStyle: {
        item: { fill: 'yellow' },
        series: { dimOpacity: 1 },
    },
    label: {
        enabled: true,
        fontStyle: undefined,
        fontWeight: undefined,
        fontSize: 12,
        fontFamily: 'Verdana, sans-serif',
        color: 'rgb(70, 70, 70)',
        formatter: undefined,
        placement: BarLabelPlacement.Inside,
    },
    shadow: {
        enabled: true,
        color: 'rgba(0, 0, 0, 0.5)',
        xOffset: 0,
        yOffset: 0,
        blur: 5
    },
};

const DEFAULT_COLUMN_SERIES_OPTIONS: AgBarSeriesOptions & { type: 'column' } = {
    ...DEFAULT_BAR_SERIES_OPTIONS,
    type: 'column',
    flipXY: false,
}

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
        fontStyle: undefined,
        fontWeight: undefined,
        fontSize: 12,
        fontFamily: 'Verdana, sans-serif',
        padding: 5,
        rotation: 0,
        color: 'rgb(87, 87, 87)',
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
    base: 10,
    type: 'log',
};

const DEFAULT_GROUPED_CATEGORY_AXIS_OPTIONS: AgGroupedCategoryAxisOptions = {
    ...DEFAULT_NUMBER_AXIS_OPTIONS,
    type: 'groupedCategory',
};

const DEFAULT_TIME_AXIS_OPTIONS: AgTimeAxisOptions = {
    ...DEFAULT_NUMBER_AXIS_OPTIONS,
    type: 'time',
};

export type SeriesOptionsTypes = NonNullable<AgChartOptions['series']>[number];
export const DEFAULT_SERIES_OPTIONS: {[K in NonNullable<SeriesOptionsTypes['type']>]: SeriesOptionsTypes & { type?: K }} = {
    line: DEFAULT_LINE_SERIES_OPTIONS,
    bar: DEFAULT_BAR_SERIES_OPTIONS,
    area: {},
    column: DEFAULT_COLUMN_SERIES_OPTIONS,
    histogram: {},
    ohlc: {},
    pie: {},
    scatter: {},
    treemap: {},
};

export type AxesOptionsTypes = NonNullable<AgCartesianChartOptions['axes']>[number];
export const DEFAULT_AXES_OPTIONS: {[K in NonNullable<AxesOptionsTypes['type']>]: AxesOptionsTypes & { type?: K }} = {
    number: DEFAULT_NUMBER_AXIS_OPTIONS,
    category: DEFAULT_CATEGORY_AXIS_OPTIONS,
    groupedCategory: DEFAULT_GROUPED_CATEGORY_AXIS_OPTIONS,
    log: DEFAULT_LOG_AXIS_OPTIONS,
    time: DEFAULT_TIME_AXIS_OPTIONS,
};
