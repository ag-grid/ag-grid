import { StringEditor, NumberEditor, BooleanEditor, PresetEditor, ColourEditor, ArrayEditor } from "./Editors.jsx";

const getFontOptions = (name, fontWeight = 'normal', fontSize = 12) => ({
    fontStyle: {
        default: 'normal',
        options: ['normal', 'italic', 'oblique'],
        description: `The font style to use for the ${name}.`,
        editor: PresetEditor,
    },
    fontWeight: {
        default: fontWeight,
        options: ['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
        description: `The font weight to use for the ${name}.`,
        editor: PresetEditor,
        breakIndex: 4,
    },
    fontSize: {
        default: fontSize,
        description: `The font size in pixels to use for the ${name}.`,
        editor: NumberEditor,
        min: 1,
        max: 30,
        unit: 'px',
    },
    fontFamily: {
        default: 'Verdana, sans-serif',
        suggestions: ['Verdana, sans-serif', 'Arial, sans-serif', 'Times New Roman, serif'],
        description: `The font family to use for the ${name}.`,
        editor: PresetEditor,
    },
});

const getCaptionOptions = (name, description, defaultText, fontSize = 10, fontWeight = 'normal') => ({
    meta: {
        description,
    },
    enabled: {
        default: true,
        description: `Whether or not the ${name} should be shown.`,
        editor: BooleanEditor,
    },
    text: {
        type: 'string',
        default: defaultText,
        description: `The text to show in the ${name}.`,
        editor: StringEditor,
    },
    color: {
        default: '#000000',
        description: `The colour to use for the ${name}.`,
        editor: ColourEditor,
    },
    ...getFontOptions(name, fontWeight, fontSize)
});

const getPaddingOption = position => ({
    default: 20,
    description: `The number of pixels of padding at the ${position} of the chart area.`,
    editor: NumberEditor,
    min: 0,
    max: 40,
});

const getChartContainer = () => document.querySelector('.container__chart') || {};

export const generalConfig = Object.freeze({
    meta: {
        displayName: 'General Configuration',
        description: 'Configuration common to all charts.',
    },
    data: {
        type: 'object[]',
        isRequired: true,
        description: 'The data to render the chart from. If this is not specified, it must be set on individual series instead.',
    },
    container: {
        type: 'HTMLElement',
        description: 'The element to place the rendered chart into.'
    },
    autoSize: {
        default: true,
        description: 'By default, the chart will resize automatically to fill the container element. Set this to <code>false</code> to disable this behaviour. If either the <code>width</code> or <code>height</code> are set, auto-sizing will be disabled unless this is explicitly set to <code>true</code>.',
        editor: BooleanEditor,
    },
    width: {
        type: 'number',
        description: 'The width of the chart in pixels. Has no effect if <code>autoSize</code> is set to <code>true</code>.',
        editor: NumberEditor,
        min: 1,
        max: () => getChartContainer().offsetWidth - (getChartContainer().offsetWidth % 10),
        unit: 'px',
    },
    height: {
        type: 'number',
        description: 'The height of the chart in pixels. Has no effect if <code>autoSize</code> is set to <code>true</code>.',
        editor: NumberEditor,
        min: 1,
        max: () => getChartContainer().offsetHeight - (getChartContainer().offsetHeight % 10),
        unit: 'px',
    },
    tooltipOffset: {
        type: '[number, number]',
        default: [20, 20],
        description: 'Offset of a tooltip from the cursor in pixels, specified as <code>[xOffset,&nbsp;yOffset]</code>.',
        editor: ArrayEditor,
    },
    tooltipClass: {
        type: 'string',
        description: 'A class to be added to tooltips in the chart.',
    },
    padding: {
        meta: {
            description: 'Configuration for the padding shown around the chart.',
        },
        top: getPaddingOption('top'),
        right: getPaddingOption('right'),
        bottom: getPaddingOption('bottom'),
        left: getPaddingOption('left'),
    },
    background: {
        meta: {
            description: 'Configuration for the background shown behind the chart.',
        },
        fill: {
            default: '#FFFFFF',
            description: 'Colour of the chart background.',
            editor: ColourEditor,
        },
        visible: {
            default: true,
            description: 'Whether or not the background should be visible.',
            editor: BooleanEditor,
        }
    },
    title: getCaptionOptions('title', 'Configuration for the title shown at the top of the chart.', 'Title', 18, 'bold'),
    subtitle: {
        ...getCaptionOptions('subtitle', 'Configuration for the subtitle shown beneath the chart title. Note: a subtitle will only be shown if a title is also present.', 'Subtitle', 14, 'normal'),
    },
    legend: {
        meta: {
            description: 'Configuration for the chart legend.',
        },
        enabled: {
            default: true,
            description: 'Whether or not to show the legend.',
            editor: BooleanEditor,
        },
        position: {
            default: 'right',
            description: 'Where the legend should show in relation to the chart.',
            options: ['top', 'right', 'bottom', 'left'],
            editor: PresetEditor,
        },
        spacing: {
            default: 20,
            description: 'The spacing in pixels to use outside the legend.',
            editor: NumberEditor,
            min: 0,
            max: 40,
            unit: 'px',
        },
        layoutHorizontalSpacing: {
            default: 16,
            description: 'The horizontal spacing in pixels to use between legend items.',
            editor: NumberEditor,
            min: 0,
            max: 40,
            unit: 'px',
        },
        layoutVerticalSpacing: {
            default: 8,
            description: 'The vertical spacing in pixels to use between legend items.',
            editor: NumberEditor,
            min: 0,
            max: 40,
            unit: 'px',
        },
        itemSpacing: {
            default: 8,
            description: 'The spacing in pixels between a legend marker and the corresponding label.',
            editor: NumberEditor,
            min: 0,
            max: 40,
            unit: 'px',
        },
        markerShape: {
            type: 'string',
            description: 
                `If set, overrides the marker shape from the series and the Legend will show the 
                specified marker shape instead. If not set, will use a marker shape matching the 
                shape from the series, or fall back to square if there is none.`,
            editor: PresetEditor,
            options: ['circle', 'cross', 'diamond', 'plus', 'square', 'triangle'],
        },
        markerSize: {
            default: 15,
            description: 'The size in pixels of the markers in the legend.',
            editor: NumberEditor,
            min: 0,
            max: 30,
            unit: 'px',
        },
        strokeWidth: {
            default: 1,
            description: 'The width in pixels of the stroke for markers in the legend.',
            editor: NumberEditor,
            min: 0,
            max: 10,
            unit: 'px',
        },
        color: {
            default: 'black',
            description: 'The colour of the text.',
            editor: ColourEditor
        },
        ...getFontOptions('legend'),
    },
});

export const axisConfig = Object.freeze({
    meta: {
        displayName: 'Axis Configuration',
        description: 'Configuration for axes in cartesian charts.',
    },
    type: {
        type: 'string',
        description: 'The type of the axis.',
        options: ['category', 'number', 'time'],
    },
    position: {
        type: 'string',
        description: 'The position on the chart where the axis should be rendered.',
        editor: PresetEditor,
        options: ['top', 'right', 'bottom', 'left'],
    },
    rotation: {
        type: 'number',
        description: 'The rotation of the axis in degrees.',
    },
    title: getCaptionOptions('axis title', 'Configuration for the title shown next to the axis.', 'Axis Title', 14, 'bold'),
    line: {
        meta: {
            description: 'Configuration for the axis line.',
        },
        width: {
            default: 1,
            description: 'The width in pixels of the axis line.',
            editor: NumberEditor,
            min: 0,
            max: 10,
            unit: 'px',
        },
        color: {
            default: 'rgba(195, 195, 195, 1)',
            description: 'The colour of the axis line.',
            editor: ColourEditor,
        }
    },
    tick: {
        meta: {
            description: 'Configuration for the axis ticks.',
        },
        width: {
            default: 1,
            description: 'The width in pixels of the axis ticks (and corresponding grid line).',
            editor: NumberEditor,
            min: 0,
            max: 10,
            unit: 'px',
        },
        size: {
            default: 6,
            description: 'The length in pixels of the axis ticks.',
            editor: NumberEditor,
            min: 0,
            max: 20,
            unit: 'px',
        },
        color: {
            default: 'rgba(195, 195, 195, 1)',
            description: 'The colour of the axis ticks.',
            editor: ColourEditor,
        },
        count: {
            default: 10,
            description: `A hint of how many ticks to use across an axis. The axis is not guaranteed to use exactly
            this number of ticks, but will try to use a number of ticks that is close to the number given.`,
            editor: NumberEditor,
            min: 0,
            max: 50,
        }
    },
    label: {
        meta: {
            description: 'Configuration for the axis labels, shown next to the ticks.',
        },
        ...getFontOptions('labels'),
        color: {
            default: '#000000',
            description: `The colour to use for the labels.`,
            editor: ColourEditor,
        },
        padding: {
            default: 5,
            description: 'Padding in pixels between the axis label and the tick.',
            editor: NumberEditor,
            min: 0,
            max: 20,
            unit: 'px',
        },
        rotation: {
            default: 0,
            description: 'The rotation of the axis labels in degrees.',
            editor: NumberEditor,
            min: -359,
            max: 359,
            unit: '&deg;',
        },
        // mirrored: {
        //     default: false,
        //     description: 'By default, labels and ticks are positioned to the left of the axis. Setting this to <code>true</code> will position them on the right instead.',
        //     editor: BooleanEditor,
        // },
        // parallel: {
        //     default: false,
        //     description: 'By default, labels are rendered perpendicular to the axis. Setting this to <code>true</code> will render them parallel to the line instead.',
        //     editor: BooleanEditor,
        // },
        format: {
            type: 'string',
            description: 'Format string used when rendering labels for time axes. For more information on the structure of the string, <a href="./javascript-grid-charts-integrated-customisation-cartesian/#format-string">click here</a>.',
        },
        formatter: {
            type: {
                parameters: {
                    value: 'any',
                    index: 'number',
                    fractionDigits: 'number',
                    formatter: '(x: any) => string',
                },
                returnType: 'string',
            },
            description: 'Function used to render axis labels. If <code>value</code> is a number, <code>fractionDigits</code> will also be provided, which indicates the number of fractional digits used in the step between ticks; for example, a tick step of <code>0.0005</code> would have <code>fractionDigits</code> set to <code>4</code>.',
        }
    },
    gridStyle: {
        meta: {
            requiresWholeObject: true,
            description: 'Configuration of the lines used to form the grid in the chart area.',
        },
        stroke: {
            default: 'rgba(195, 195, 195, 1)',
            description: 'The colour of the grid line.',
            editor: ColourEditor,
        },
        lineDash: {
            default: [4, 2],
            description: 'Defines how the gridlines are rendered. Every number in the array specifies the length in pixels of alternating dashes and gaps. For example, <code>[6, 3]</code> means dashes with a length of <code>6</code> pixels with gaps between of <code>3</code> pixels.',
            editor: ArrayEditor,
        }
    }
});

const seriesConfig = {
    data: {
        type: 'object[]',
        isRequired: true,
        description: 'The data to use when rendering the series. If this is not supplied, data must be set on the chart instead.',
    },
    visible: {
        default: true,
        description: 'Whether or not to display the series.',
        editor: BooleanEditor,
    },
    showInLegend: {
        default: true,
        description: 'Whether or not to include the series in the legend.',
        editor: BooleanEditor,
    },
    tooltipEnabled: {
        default: true,
        description: 'Whether or not to show tooltips when the series are hovered over.',
        editor: BooleanEditor,
    },
    tooltipRenderer: {
        type: {
            parameters: {
                datum: 'any',
                'title?': 'string',
                'color?': 'string',
                xKey: 'string',
                'xName?': 'string',
                yKey: 'string',
                'yName?': 'string',
            },
            returnType: 'string',
        },
        description: 'Function used to create the content for tooltips.',
    },
};

const markerConfig = ({enabledByDefault = true} = {enabledByDefault:true}) => ({
    marker: {
        meta: {
            description: 'Configuration for the markers used in the series.',
        },
        enabled: {
            default: enabledByDefault,
            description: 'Whether or not to show markers.',
            editor: BooleanEditor,
        },
        shape: {
            type: 'string | Marker',
            default: 'circle',
            description: 'The shape to use for the markers. You can also supply a custom marker by providing a <code>Marker</code> subclass.',
            editor: PresetEditor,
            options: ['circle', 'cross', 'diamond', 'plus', 'square', 'triangle']
        },
        size: {
            default: 8,
            description: 'The size in pixels of the markers.',
            editor: NumberEditor,
            min: 1,
            max: 20,
            unit: 'px',
        },
        minSize: {
            default: 12,
            description: 'For series where the size of the marker is determined by the data, this determines the smallest size a marker can be in pixels.',
            editor: NumberEditor,
            min: 1,
            max: 20,
            unit: 'px',
        },
        fill: {
            type: 'string',
            description: 'The colour to use for marker fills. If this is not specified, the markers will take their fill from the series.',
            editor: ColourEditor,
        },
        stroke: {
            type: 'string',
            description: 'The colour to use for marker strokes. If this is not specified, the markers will take their stroke from the series.',
            editor: ColourEditor,
        },
        strokeWidth: {
            type: 'number',
            description: 'The width in pixels of the marker stroke. If this is not specified, the markers will take their stroke width from the series.',
            editor: NumberEditor,
            min: 0,
            max: 10,
            unit: 'px',
        },
        formatter: {
            type: {
                parameters: {
                    datum: 'any',
                    fill: 'string',
                    stroke: 'string',
                    strokeWidth: 'number',
                    size: 'number',
                    highlighted: 'boolean',
                    xKey: 'string',
                    yKey: 'string',
                },
                returnType: {
                    fill: 'string',
                    stroke: 'string',
                    strokeWidth: 'number',
                    size: 'number',
                },
            },
            description: 'Function used to return formatting for individual markers, based on the supplied information.'
                + ' If the current marker is highlighted the correponding property will be set to `true`. Make sure to'
                + ' check for the value of the `highlighted` property if you want to differentiate between the highlighted'
                + ' and unhighlighted states.',
        }
    }
});

const getCartesianKeyConfig = (hasMultipleYValues = false) => {
    const config = {
        xKey: {
            type: 'string',
            isRequired: true,
            description: 'The key to use to retrieve x-values from the data.',
        },
        xName: {
            type: 'string',
            description: 'A human-readable description of the x-values.',
        },
    };

    if (hasMultipleYValues) {
        config.yKeys = {
            type: 'string[]',
            isRequired: true,
            description: 'The keys to use to retrieve y-values from the data.',
        };

        config.yNames = {
            type: 'string[]',
            description: 'Human-readable descriptions of the y-values.',
        };
    } else {
        config.yKey = {
            type: 'string',
            isRequired: true,
            description: 'The key to use to retrieve y-values from the data.',
        };

        config.yName = {
            type: 'string',
            description: 'A human-readable description of the y-values.',
        };
    }

    return config;
};

const fills = [
    '#f3622d',
    '#fba71b',
    '#57b757',
    '#41a9c9',
    '#4258c9',
    '#9a42c8',
    '#c84164',
    '#888888',
];

const strokes = [
    '#aa4520',
    '#b07513',
    '#3d803d',
    '#2d768d',
    '#2e3e8d',
    '#6c2e8c',
    '#8c2d46',
    '#5f5f5f'
];

const getColourConfig = (name = 'markers', hasMultipleSeries = false, includeFill = true) => {
    const config = {};

    if (includeFill) {
        if (hasMultipleSeries) {
            config.fills = {
                default: fills,
                description: `The colours to cycle through for the fills of the ${name}.`,
            };
        } else {
            config.fill = {
                default: fills[0],
                description: `The colour of the fill for the ${name}.`,
                editor: ColourEditor,
            };
        }

        config.fillOpacity = {
            default: 1,
            description: `The opacity of the fill for the ${name}.`,
            editor: NumberEditor,
            min: 0,
            max: 1,
            step: 0.05,
        };
    }

    if (hasMultipleSeries) {
        config.strokes = {
            default: strokes,
            description: `The colours to cycle through for the strokes of the ${name}.`,
        };
    } else {
        config.stroke = {
            default: strokes[0],
            description: `The colour of the stroke for the ${name}.`,
            editor: ColourEditor,
        };
    }

    config.strokeOpacity = {
        default: 1,
        description: `The opacity of the stroke for the ${name}.`,
        editor: NumberEditor,
        min: 0,
        max: 1,
        step: 0.05,
    };

    config.strokeWidth = {
        default: 1,
        description: `The width in pixels of the stroke for the ${name}.`,
        editor: NumberEditor,
        min: 0,
        max: 20,
        unit: 'px',
    };

    return config;
};

const shadowConfig = {
    shadow: {
        meta: {
            description: 'Configuration for the shadow used behind the chart series.',
        },
        enabled: {
            default: true,
            description: 'Whether or not the shadow is visible.',
            editor: BooleanEditor,
        },
        color: {
            default: 'rgba(0, 0, 0, 0.5)',
            description: 'The colour of the shadow.',
            editor: ColourEditor,
        },
        xOffset: {
            default: 0,
            description: 'The horizontal offset in pixels for the shadow.',
            editor: NumberEditor,
            min: -20,
            max: 20,
            unit: 'px',
        },
        yOffset: {
            default: 0,
            description: 'The vertical offset in pixels for the shadow.',
            editor: NumberEditor,
            min: -20,
            max: 20,
            unit: 'px',
        },
        blur: {
            default: 5,
            description: 'The radius of the shadow\'s blur, given in pixels.',
            editor: NumberEditor,
            min: 0,
            max: 20,
            unit: 'px',
        }
    },
};

const getHighlightConfig = (name = 'markers') => ({
    highlightStyle: {
        meta: {
            requiresWholeObject: true,
            description: `Configuration for the highlighting used when the ${name} are hovered over.`,
        },
        fill: {
            default: 'yellow',
            description: `The fill colour of the ${name} when hovered over.`,
            editor: ColourEditor,
        },
        stroke: {
            type: 'string',
            description: `The colour of the stroke around the ${name} when hovered over.`,
            editor: ColourEditor,
        },
    },
});

export const barSeriesConfig = Object.freeze({
    meta: {
        displayName: 'Bar/Column Series Configuration',
        description: 'Configuration for bar/column series.',
    },
    ...getCartesianKeyConfig(true),
    ...seriesConfig,
    grouped: {
        default: false,
        description: 'Whether to show different y-values as separate bars (grouped) or not (stacked).',
        editor: BooleanEditor,
    },
    normalizedTo: {
        type: 'number',
        description: `The number to normalise the bar stacks to. Has no effect when <code>grouped</code> is <code>true</code>.
        For example, if normalizedTo is set to 100, the bar stacks will all be scaled proportionally so that each of their
        totals is 100.`,
        editor: NumberEditor,
        min: 1,
        max: 100,
    },
    ...getColourConfig('bars', true),
    ...getHighlightConfig('bars'),
    ...shadowConfig,
    label: {
        meta: {
            description: 'Configuration for the labels shown on bars.',
        },
        enabled: {
            default: true,
            description: `Whether or not the labels should be shown.`,
            editor: BooleanEditor,
        },
        color: {
            default: 'rgba(70, 70, 70, 1)',
            description: `The colour to use for the labels.`,
            editor: ColourEditor,
        },
        ...getFontOptions('labels'),
    }
});

export const lineSeriesConfig = Object.freeze({
    meta: {
        displayName: 'Line Series Configuration',
        description: 'Configuration for line series.',
    },
    ...getCartesianKeyConfig(),
    ...seriesConfig,
    title: {
        type: 'string',
        description: 'The title to use for the series. Defaults to <code>yName</code> if it exists, or <code>yKey</code> if not.',
        editor: StringEditor,
    },
    ...getColourConfig('lines', false, false),
    ...markerConfig(),
    ...getHighlightConfig(),
});

export const areaSeriesConfig = Object.freeze({
    meta: {
        displayName: 'Area Series Configuration',
        description: 'Configuration for area series.',
    },
    ...getCartesianKeyConfig(true),
    ...seriesConfig,
    normalizedTo: {
        type: 'number',
        description: `The number to normalise the area stacks to.
        For example, if normalizedTo is set to 100, the stacks will all be scaled proportionally so that their total
        height is always 100.`,
        editor: NumberEditor,
        min: 1,
        max: 100,
    },
    ...getColourConfig('areas', true),
    ...markerConfig({enabledByDefault: false}),
    ...getHighlightConfig(),
    ...shadowConfig,
});

export const scatterSeriesConfig = Object.freeze({
    meta: {
        displayName: 'Scatter/Bubble Series Configuration',
        description: 'Configuration for scatter/bubble series.',
    },
    ...getCartesianKeyConfig(),
    sizeKey: {
        type: 'string',
        description: 'The key to use to retrieve size values from the data, used to control the size of the markers in bubble charts.'
    },
    sizeName: {
        type: 'string',
        description: 'A human-readable description of the size values.',
    },
    labelKey: {
        type: 'string',
        description: 'The key to use to retrieve values from the data to use as labels for the markers.',
    },
    labelName: {
        type: 'string',
        description: 'A human-readable description of the label values.',
    },
    ...seriesConfig,
    tooltipRenderer: {
        type: {
            parameters: {
                datum: 'any',
                'title?': 'string',
                'color?': 'string',
                xKey: 'string',
                'xName?': 'string',
                yKey: 'string',
                'yName?': 'string',
                'sizeKey?': 'string',
                'sizeName?': 'string',
                'labelKey?': 'string',
                'labelName?': 'string',
            },
            returnType: 'string',
        },
        description: 'Function used to create the content for tooltips.'
    },
    title: {
        type: 'string',
        description: 'The title to use for the series. Defaults to <code>yName</code> if it exists, or <code>yKey</code> if not.',
        editor: StringEditor,
    },
    ...getColourConfig(),
    ...markerConfig(),
    ...getHighlightConfig(),
});

export const pieSeriesConfig = Object.freeze({
    meta: {
        displayName: 'Pie/Doughnut Series Configuration',
        description: 'Configuration for pie/doughnut series.',
    },
    angleKey: {
        type: 'string',
        isRequired: true,
        description: 'The key to use to retrieve angle values from the data.',
    },
    angleName: {
        type: 'string',
        description: 'A human-readable description of the angle values.',
    },
    labelKey: {
        type: 'string',
        isRequired: true,
        description: 'The key to use to retrieve label values from the data.',
    },
    labelName: {
        type: 'string',
        description: 'A human-readable description of the label values.',
    },
    radiusKey: {
        type: 'string',
        description: 'The key to use to retrieve radius values from the data.',
    },
    radiusName: {
        type: 'string',
        description: 'A human-readable description of the radius values.',
    },
    ...seriesConfig,
    tooltipRenderer: {
        type: {
            parameters: {
                datum: 'any',
                'title?': 'string',
                'color?': 'string',
                'angleKey': 'string',
                'angleName?': 'string',
                'radiusKey?': 'string',
                'radiusName?': 'string',
                'labelKey?': 'string',
                'labelName?': 'string'
            },
            returnType: 'string',
        },
        description: 'Function used to create the content for tooltips.'
    },
    rotation: {
        default: 0,
        description: 'The rotation of the pie series in degrees.',
        editor: NumberEditor,
        min: -359,
        max: 359,
        unit: '&deg',
    },
    innerRadiusOffset: {
        default: 0,
        description: `The offset in pixels of the inner radius of the series. Used to construct doughnut charts. If
        this is not given, or a value of zero is given, a pie chart will be rendered.`,
        editor: NumberEditor,
        min: -50,
        max: 50,
        unit: 'px',
    },
    outerRadiusOffset: {
        default: 0,
        description: 'The offset in pixels of the outer radius of the series. Used to construct doughnut charts.',
        editor: NumberEditor,
        min: -50,
        max: 50,
        unit: 'px',
    },
    title: {
        ...getCaptionOptions('title', 'Configuration for the series title.'),
    },
    ...getColourConfig('segments', true),
    ...getHighlightConfig('segments'),
    label: {
        meta: {
            description: 'Configuration for the labels used for the segments.',
        },
        enabled: {
            default: true,
            description: `Whether or not the labels should be shown.`,
            editor: BooleanEditor,
        },
        color: {
            default: '#000000',
            description: `The colour to use for the labels.`,
            editor: ColourEditor,
        },
        ...getFontOptions('labels'),
        offset: {
            default: 3,
            description: 'Distance in pixels between the callout line and the label text.',
            editor: NumberEditor,
            min: 0,
            max: 20,
            unit: 'px',
        },
        minAngle: {
            default: 20,
            description: 'Minimum angle in degrees required for a segment to show a label.',
            editor: NumberEditor,
            min: 0,
            max: 360,
            unit: '&deg;'
        },
    },
    callout: {
        meta: {
            description: 'Configuration for the callouts used with the labels for the segments.',
        },
        colors: {
            default: strokes,
            description: 'The colours to cycle through for the strokes of the callouts.',
        },
        strokeWidth: {
            default: 1,
            description: 'The width in pixels of the stroke for callout lines.',
            editor: NumberEditor,
            min: 1,
            max: 10,
            unit: 'px',
        },
        length: {
            default: 10,
            description: 'The length in pixels of the callout lines.',
            editor: NumberEditor,
            min: 0,
            max: 20,
            unit: 'px',
        },
    },
    ...shadowConfig,
});
