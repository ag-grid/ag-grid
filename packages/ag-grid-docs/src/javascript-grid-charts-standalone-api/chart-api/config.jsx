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
        max: 800,
    },
    height: {
        default: 400,
        description: 'The height of the chart.',
        editor: NumberEditor,
        min: 1,
        max: 400,
    },
    tooltipOffset: {
        type: '[number, number]',
        default: [20, 20],
        description: 'Offset of a tooltip from the cursor, specified as <code>[xOffset, yOffset]</code>.',
        editor: ArrayEditor,
    },
    tooltipClass: {
        type: 'string',
        description: 'A class to be added to tooltips in the chart.',
    },
    padding: {
        top: {
            default: 20,
            description: 'Padding at the top of the chart area.',
            editor: NumberEditor,
            min: 0,
            max: 40,
        },
        right: {
            default: 20,
            description: 'Padding at the right of the chart area.',
            editor: NumberEditor,
            min: 0,
            max: 40,
        },
        bottom: {
            default: 20,
            description: 'Padding at the bottom of the chart area.',
            editor: NumberEditor,
            min: 0,
            max: 40,
        },
        left: {
            default: 20,
            description: 'Padding at the left of the chart area.',
            editor: NumberEditor,
            min: 0,
            max: 40,
        }
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
    subtitle: getCaptionOptions('subtitle', 'Subtitle', 14, 'normal'),
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
    title: getCaptionOptions('axis title', 'Axis title', 14, 'bold'),
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
            max: 100,
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
                parameters: { params: '{ value, index, fractionDigits?, formatter?: x => string }' },
                returnType: 'string',
            },
            description: 'Function used to render axis labels. If <code>value</code> is a number, <code>fractionDigits</code> will also be provided, which indicates the number of fractional digits used in the step between ticks; for example, a tick step of <code>0.0005</code> would have <code>fractionDigits</code> set to <code>4</code>.',
        }
    },
    gridStyle: {
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
        default: false,
        description: 'Whether or not to show tooltips when the series are hovered over.',
        editor: BooleanEditor,
    },
};

export const barSeriesConfig = Object.freeze({
    ...seriesConfig,
    xKey: {
        type: 'string',
        isRequired: true,
        description: 'The key to use to retrieve x-values from the data.',
    },
    xName: {
        type: 'string',
        description: 'A human-readable description of the x-values.',
    },
    yKeys: {
        type: 'string[]',
        isRequired: true,
        description: 'The keys to use to retrieve y-values from the data.',
    },
    yName: {
        type: 'string[]',
        description: 'A human-readable description of the y-values.',
    },
    grouped: {
        default: false,
        description: 'Whether to show different y-values as separate bars (grouped) or not (stacked).',
        editor: BooleanEditor,
    },
    normalizedTo: {
        type: 'number',
        description: 'The number to normalise the bar stacks to. Has no effect when <code>grouped</code> is <code>true</code>.',
        editor: NumberEditor,
    },
    flipXY: {
        default: false,
        description: 'Flips the direction of the bars.',
    },
    fills: {
        default: [
            '#f3622d',
            '#fba71b',
            '#57b757',
            '#41a9c9',
            '#4258c9',
            '#9a42c8',
            '#c84164',
            '#888888'
        ],
        description: 'Colours to cycle through for the fills of the series.',
    },
    fillOpacity: {
        default: 1,
        description: 'The opacity of the fill of the bars.',
        editor: NumberEditor,
        min: 0,
        max: 1,
        step: 0.1,
    },
    strokes: {
        default: [
            '#aa4520',
            '#b07513',
            '#3d803d',
            '#2d768d',
            '#2e3e8d',
            '#6c2e8c',
            '#8c2d46',
            '#5f5f5f'
        ],
        description: 'Colours to cycle through for the strokes of the series.',
    },
    strokeOpacity: {
        default: 1,
        description: 'The opacity of the stroke of the bars.',
        editor: NumberEditor,
        min: 0,
        max: 1,
        step: 0.1,
    },
    strokeWidth: {
        default: 1,
        description: 'The width of the stroke around the bars.',
        editor: NumberEditor,
        min: 0,
        max: 20,
    },
    shadow: {
        enabled: {
            default: true,
            description: 'Whether the shadow is visible or not',
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
    highlightStyle: {
        fill: {
            default: 'yellow',
            description: 'The fill colour of the bar when hovered over.',
            editor: ColourEditor,
        },
        stroke: {
            type: 'string',
            description: 'The colour of the stroke around the bar when hovered over.',
            editor: ColourEditor,
        }
    },
});
