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
        description: `The font size to use for the ${name}.`,
        editor: NumberEditor,
        min: 1,
        max: 30,
    },
    fontFamily: {
        default: 'Verdana, sans-serif',
        options: ['Verdana, sans-serif', 'Arial, sans-serif', 'Times New Roman, serif'],
        description: `The font family to use for the ${name}.`,
        editor: PresetEditor,
    },
});

const getCaptionOptions = (name, defaultText, fontSize = 10, fontWeight = 'normal') => ({
    enabled: {
        default: true,
        description: `Whether the ${name} should be shown or not.`,
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
    description: `Padding at the ${position} of the chart area.`,
    editor: NumberEditor,
    min: 0,
    max: 40,
});

const getChartContainer = () => document.querySelector('.container__chart') || {};

export const generalConfig = Object.freeze({
    data: {
        type: 'object[]',
        isRequired: true,
        description: 'The data to render the chart from. If it is not specified, it must be set on individual series instead.',
    },
    container: {
        type: 'HTMLElement',
        description: 'The element to place the rendered chart canvas element into.'
    },
    width: {
        default: 800,
        description: 'The width of the chart.',
        editor: NumberEditor,
        min: 1,
        max: () => getChartContainer().offsetWidth - (getChartContainer().offsetWidth % 10),
    },
    height: {
        default: 400,
        description: 'The height of the chart.',
        editor: NumberEditor,
        min: 1,
        max: () => getChartContainer().offsetHeight - (getChartContainer().offsetHeight % 10),
    },
    tooltipOffset: {
        type: '[number, number]',
        default: [20, 20],
        description: 'Offset of a tooltip from the cursor, specified as <code>[xOffset,&nbsp;yOffset]</code>.',
        editor: ArrayEditor,
    },
    tooltipClass: {
        type: 'string',
        description: 'A class to be added to tooltips in the chart.',
    },
    padding: {
        top: getPaddingOption('top'),
        right: getPaddingOption('right'),
        bottom: getPaddingOption('bottom'),
        left: getPaddingOption('left'),
    },
    background: {
        fill: {
            default: '#FFFFFF',
            description: 'Colour of the chart background.',
            editor: ColourEditor,
        },
        visible: {
            default: true,
            description: 'Whether the background should be visible or not.',
            editor: BooleanEditor,
        }
    },
    title: getCaptionOptions('title', 'Title', 18, 'bold'),
    subtitle: {
        ...getCaptionOptions('subtitle', 'Subtitle', 14, 'normal'),
        enabled: {
            default: true,
            description: `Whether the subtitle should be shown or not. Note: a subtitle will only be shown if a title is also visible.`,
            editor: BooleanEditor,
        },
    },
    legend: {
        enabled: {
            default: true,
            description: 'Configures whether to show the legend.',
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
            description: 'The spacing to use outside the legend.',
            editor: NumberEditor,
            min: 0,
            max: 40,
        },
        layoutHorizontalSpacing: {
            default: 16,
            description: 'The horizontal spacing to use between legend items.',
            editor: NumberEditor,
            min: 0,
            max: 40,
        },
        layoutVerticalSpacing: {
            default: 8,
            description: 'The vertical spacing to use between legend items.',
            editor: NumberEditor,
            min: 0,
            max: 40,
        },
        itemSpacing: {
            default: 8,
            description: 'The spacing between a legend marker and the corresponding label.',
            editor: NumberEditor,
            min: 0,
            max: 40,
        },
        markerShape: {
            default: 'square',
            description: 'This will override the marker shape from the series and show the specified marker shape in the legend instead.',
            editor: PresetEditor,
            options: ['circle', 'cross', 'diamond', 'plus', 'square', 'triangle'],
        },
        markerSize: {
            default: 15,
            description: 'The size of the markers in the legend.',
            editor: NumberEditor,
            min: 0,
            max: 30,
        },
        strokeWidth: {
            default: 1,
            description: 'The width of the stroke for markers in the legend.',
            editor: NumberEditor,
            min: 0,
            max: 10,
        },
        textColor: {
            default: 'black',
            description: 'Colour of the text.',
            editor: ColourEditor
        },
        ...getFontOptions('legend'),
    },
});

export const axisConfig = Object.freeze({
    type: {
        type: 'string',
        description: 'The type of the axis.',
        options: ['category', 'number', 'time'],
    },
    position: {
        type: 'string',
        description: 'The position on the chart to render the axis in.',
        editor: PresetEditor,
        options: ['top', 'right', 'bottom', 'left'],
    },
    rotation: {
        type: 'number',
        description: 'The rotation of the axis in degrees.',
    },
    title: getCaptionOptions('axis title', 'Axis Title', 14, 'bold'),
    line: {
        width: {
            default: 1,
            description: 'Width of the axis line.',
            editor: NumberEditor,
            min: 0,
            max: 10,
        },
        color: {
            default: 'rgba(195, 195, 195, 1)',
            description: 'Colour of the axis line.',
            editor: ColourEditor,
        }
    },
    tick: {
        width: {
            default: 1,
            description: 'Width of the axis ticks (and corresponding grid line).',
            editor: NumberEditor,
            min: 0,
            max: 10,
        },
        size: {
            default: 6,
            description: 'Length of the axis ticks.',
            editor: NumberEditor,
            min: 0,
            max: 20,
        },
        color: {
            default: 'rgba(195, 195, 195, 1)',
            description: 'Colour of the axis ticks.',
            editor: ColourEditor,
        },
        count: {
            default: 10,
            description: 'A hint of how many ticks to use across an axis.',
            editor: NumberEditor,
            min: 0,
            max: 50,
        }
    },
    label: {
        ...getFontOptions('labels'),
        color: {
            default: '#000000',
            description: `The colour to use for the labels.`,
            editor: ColourEditor,
        },
        padding: {
            default: 5,
            description: 'Padding between the axis label and the tick.',
            editor: NumberEditor,
            min: 0,
            max: 20,
        },
        rotation: {
            default: 0,
            description: 'Rotation of the axis labels.',
            editor: NumberEditor,
            min: -359,
            max: 359
        },
        mirrored: {
            default: false,
            description: 'By default, labels and ticks are positioned to the left of the axis. Setting this to <code>true</code> will position them on the right instead.',
            editor: BooleanEditor,
        },
        parallel: {
            default: false,
            description: 'By default, labels are rendered perpendicular to the axis. Setting this to <true> will render them parallel to the line instead.',
            editor: BooleanEditor,
        },
        format: {
            type: 'string',
            description: 'Format string used when rendering labels for time axes. For more information on the structure of the string, <a href="http://localhost:8080/javascript-grid-charts-integrated-customisation-cartesian/">click here</a>.',
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
        },
        stroke: {
            default: 'rgba(195, 195, 195, 1)',
            description: 'Colour of the grid line.',
            editor: ColourEditor,
        },
        lineDash: {
            default: [4, 2],
            description: 'Defines how the gridlines are rendered. Every number in the array specifies the length of alternating dashes and gaps. For example, [6, 3] means dash of length 6 and gap of length 3.',
            editor: ArrayEditor,
        }
    }
});

const seriesConfig = {
    data: {
        type: 'object[]',
        isRequired: true,
        description: 'The data to use when rendering the series. If it is not supplied, data must be set on the chart instead.',
    },
    visible: {
        default: true,
        description: 'Whether to display the series or not.',
        editor: BooleanEditor,
    },
    showInLegend: {
        default: true,
        description: 'Whether to include the series in the legend.',
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
                title: 'string',
                color: 'string',
                xKey: 'string',
                xName: 'string',
                yKey: 'string',
                yName: 'string',
            },
            returnType: 'string',
        },
        description: 'Function used to create the content for tooltips.',
    },
};

const markerConfig = {
    marker: {
        enabled: {
            default: true,
            description: 'Whether to show markers or not.',
            editor: BooleanEditor,
        },
        shape: {
            type: 'string | Marker',
            default: 'circle',
            description: 'The shape to use for the markers. You can also supply a custom marker by extending the <code>Marker</code> class and providing that.',
            editor: PresetEditor,
            options: ['circle', 'cross', 'diamond', 'plus', 'square', 'triangle']
        },
        size: {
            default: 8,
            description: 'The size of the markers.',
            editor: NumberEditor,
            min: 1,
            max: 20,
        },
        minSize: {
            default: 12,
            description: 'For series where the size of the marker is determined by the data, this determines the smallest size a marker can be.',
            editor: NumberEditor,
            min: 1,
            max: 20,
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
            description: 'The width of the marker stroke. If this is not specified, the markers will take their stroke width from the series.',
            editor: NumberEditor,
            min: 0,
            max: 10,
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
            description: 'Function used to return formatting for individual markers, based on the supplied information.',
        }
    }
};

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

const getColourConfig = (name = 'markers', hasMultipleSeries = false) => {
    const config = {};

    if (hasMultipleSeries) {
        config.fills = {
            default: fills,
            description: `Colours to cycle through for the fills of the ${name}.`,
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

    if (hasMultipleSeries) {
        config.strokes = {
            default: strokes,
            description: `Colours to cycle through for the strokes of the ${name}.`,
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
        description: `The width of the stroke for the ${name}.`,
        editor: NumberEditor,
        min: 0,
        max: 20,
    };

    return config;
};

const shadowConfig = {
    shadow: {
        enabled: {
            default: true,
            description: 'Whether the shadow is visible or not.',
            editor: BooleanEditor,
        },
        color: {
            default: 'rgba(0, 0, 0, 0.5)',
            description: 'Colour of the shadow.',
            editor: ColourEditor,
        },
        xOffset: {
            default: 0,
            description: 'Horizontal offset for the shadow.',
            editor: NumberEditor,
            min: -20,
            max: 20,
        },
        yOffset: {
            default: 0,
            description: 'Vertical offset for the shadow.',
            editor: NumberEditor,
            min: -20,
            max: 20,
        },
        blur: {
            default: 5,
            description: 'How much to blur the shadow.',
            editor: NumberEditor,
            min: 0,
            max: 20,
        }
    },
};

const getHighlightConfig = (name = 'markers') => ({
    highlightStyle: {
        meta: {
            requiresWholeObject: true,
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
    ...getCartesianKeyConfig(true),
    ...seriesConfig,
    grouped: {
        default: false,
        description: 'Whether to show different y-values as separate bars (grouped) or not (stacked).',
        editor: BooleanEditor,
    },
    normalizedTo: {
        type: 'number',
        description: 'The number to normalise the bar stacks to. Has no effect when <code>grouped</code> is <code>true</code>.',
        editor: NumberEditor,
        min: 1,
        max: 100,
    },
    flipXY: {
        default: false,
        description: 'Flips the direction of the bars.',
    },
    ...getColourConfig('bars', true),
    ...getHighlightConfig('bars'),
    ...shadowConfig,
});

export const lineSeriesConfig = Object.freeze({
    ...getCartesianKeyConfig(),
    ...seriesConfig,
    title: {
        type: 'string',
        description: 'The title to use for the series. Defaults to <code>yName</code> if it exists, or <code>yKey</code> if not.',
        editor: StringEditor,
    },
    ...getColourConfig('lines'),
    ...getHighlightConfig(),
    ...markerConfig,
});

export const areaSeriesConfig = Object.freeze({
    ...getCartesianKeyConfig(true),
    ...seriesConfig,
    normalizedTo: {
        type: 'number',
        description: 'The number to normalise the areas stack to.',
        editor: NumberEditor,
        min: 1,
        max: 100,
    },
    ...getColourConfig('areas', true),
    ...getHighlightConfig(),
    ...markerConfig,
    ...shadowConfig,
});

export const scatterSeriesConfig = Object.freeze({
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
                title: 'string',
                color: 'string',
                xKey: 'string',
                xName: 'string',
                yKey: 'string',
                yName: 'string',
                sizeKey: 'string',
                sizeName: 'string',
                labelKey: 'string',
                labelName: 'string',
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
    ...getHighlightConfig(),
    ...markerConfig,
});

export const pieSeriesConfig = Object.freeze({
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
    rotation: {
        default: 0,
        description: 'The rotation of the pie series.',
        editor: NumberEditor,
        min: -359,
        max: 359,
    },
    innerRadiusOffset: {
        default: 0,
        description: 'The offset of the inner radius of the series. Used to construct doughnut charts.',
        editor: NumberEditor,
        min: -50,
        max: 50,
    },
    outerRadiusOffset: {
        default: 0,
        description: 'The offset of the outer radius of the series. Used to construct doughnut charts.',
        editor: NumberEditor,
        min: -50,
        max: 50,
    },
    title: {
        ...getCaptionOptions('title'),
    },
    ...getColourConfig('segments', true),
    ...getHighlightConfig('segments'),
    label: {
        enabled: {
            default: true,
            description: `Whether the labels should be shown or not.`,
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
            description: 'Distance between the callout line and the label text.',
            editor: NumberEditor,
            min: 0,
            max: 20,
        },
        minAngle: {
            default: 20,
            description: 'Minimum angle required for a segment to show a label.',
            editor: NumberEditor,
            min: 0,
            max: 360,
        },
    },
    callout: {
        colors: {
            default: strokes,
            description: 'Colours to cycle through for the strokes of the callouts.',
        },
        strokeWidth: {
            default: 1,
            description: 'Width of the stroke for callout lines.',
            editor: NumberEditor,
            min: 1,
            max: 10,
        },
        length: {
            default: 10,
            description: 'The length of the callout lines.',
            editor: NumberEditor,
            min: 0,
            max: 20,
        },
    },
    ...shadowConfig,
});
