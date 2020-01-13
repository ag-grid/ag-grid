import { StringEditor, NumberEditor, CheckboxEditor, DropDownEditor, ColourEditor } from "./Editors.jsx";

const getFontOptions = (name, fontWeight = 'normal', fontSize = 12) => ({
    fontStyle: {
        default: 'normal',
        options: ['normal', 'italic', 'oblique'],
        description: `The font style to use for the ${name}`,
        editor: DropDownEditor
    },
    fontWeight: {
        default: fontWeight,
        options: ['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
        description: `The font weight to use for the ${name}`,
        editor: DropDownEditor
    },
    fontSize: {
        default: fontSize,
        description: `The font size to use for the ${name}`,
        editor: NumberEditor
    },
    fontFamily: {
        default: 'Verdana, sans-serif',
        options: ['Verdana, sans-serif', 'Arial, sans-serif', 'Times New Roman, serif'],
        description: `The font family to use for the ${name}`,
        editor: DropDownEditor
    },
    color: {
        default: '#000000',
        description: `The colour to use for the ${name}`,
        editor: ColourEditor
    }
});

const getCaptionOptions = (name, fontWeight = 'normal', fontSize = 10) => ({
    enabled: {
        default: true,
        description: `Whether the ${name} should be shown or not`,
        editor: CheckboxEditor
    },
    text: {
        default: '',
        description: `The text to show in the ${name}`,
        editor: StringEditor
    },
    ...getFontOptions(name, fontWeight, fontSize)
});

export const generalConfig = {
    width: {
        default: 600,
        description: "The width of the chart",
        editor: NumberEditor
    },
    height: {
        default: 300,
        description: "The height of the chart",
        editor: NumberEditor
    },
    tooltipClass: {
        description: "A class to be added to tooltips in the chart, if required",
        editor: StringEditor
    },
    padding: {
        top: {
            default: 20,
            description: "Padding at the top of the chart area",
            editor: NumberEditor
        },
        right: {
            default: 20,
            description: "Padding at the right of the chart area",
            editor: NumberEditor
        },
        bottom: {
            default: 20,
            description: "Padding at the bottom of the chart area",
            editor: NumberEditor
        },
        left: {
            default: 20,
            description: "Padding at the left of the chart area",
            editor: NumberEditor
        }
    },
    background: {
        fill: {
            default: "#FFFFFF",
            description: "Colour of the chart background",
            editor: ColourEditor
        },
        visible: {
            default: true,
            description: "Whether the background should be visible or not",
            editor: CheckboxEditor
        }
    },
    title: getCaptionOptions("title"),
    subtitle: getCaptionOptions("subtitle"),
    legend: {
        enabled: {
            default: true,
            description: "Configures whether to show the legend",
            editor: CheckboxEditor
        },
        position: {
            default: "right",
            description: "Where the legend should show in relation to the chart",
            options: ['top', 'right', 'bottom', 'left'],
            editor: DropDownEditor
        },
        padding: {
            default: 20,
            description: "The padding to use outside the legend",
            editor: NumberEditor
        },
        item: {
            label: getFontOptions("legend item"),
            marker: {
                type: {
                    default: 'square',
                    options: ['circle', 'cross', 'diamond', 'plus', 'square', 'triangle'],
                    description: "The type of marker to use for chart series",
                    editor: DropDownEditor
                },
                size: {
                    default: 15,
                    description: "The size of legend markers",
                    editor: NumberEditor
                },
                padding: {
                    default: 8,
                    description: "The padding between the marker and the text",
                    editor: NumberEditor
                },
                strokeWidth: {
                    default: 1,
                    description: "The width of the stroke around the marker",
                    editor: NumberEditor
                }
            },
            paddingX: {
                default: 16,
                description: "The horizontal padding between items",
                editor: NumberEditor
            },
            paddingY: {
                default: 8,
                description: "The vertical padding between items",
                editor: NumberEditor
            },
        }
    },
};

export const axisConfig = Object.freeze({
    type: {
        default: 'category',
        description: 'The type of the axis',
        editor: DropDownEditor,
        options: ['category', 'number', 'time']
    },
    title: getCaptionOptions('title'),
    line: {
        width: {
            default: 1,
            description: 'Width of the axis line',
            editor: NumberEditor
        },
        color: {
            default: 'rgba(195, 195, 195, 1)',
            description: 'Colour of the axis line',
            editor: ColourEditor
        }
    },
    tick: {
        width: {
            default: 1,
            description: 'Width of the axis ticks (and corresponding grid line)',
            editor: NumberEditor,
            min: 0,
        },
        size: {
            default: 6,
            description: 'Length of the axis ticks',
            editor: NumberEditor,
            min: 0
        },
        color: {
            default: 'rgba(195, 195, 195, 1)',
            description: 'Colour of the axis ticks',
            editor: ColourEditor
        }
    },
    label: {
        ...getFontOptions('label'),
        padding: {
            default: 5,
            description: 'Padding between the axis label and the tick',
            editor: NumberEditor,
            min: 0,
        },
        rotation: {
            default: 0,
            description: 'Rotation of the axis labels',
            editor: NumberEditor,
        },
        format: {
            description: 'Format string used when rendering labels for time axes',
            editor: StringEditor,
        },
        formatter: {
            description: 'Function used to render axis labels',
        }
    },
    gridStyle: {
        stroke: {
            default: 'rgba(195, 195, 195, 1)',
            description: 'Colour of the grid line',
            editor: ColourEditor,
        },
        lineDash: {
            default: '4, 2',
            description: 'Defines how the gridlines are rendered. Every number in the array specifies the length of alternating dashes and gaps. For example, [6, 3] means dash of length 6 and gap of length 3.',
            editor: StringEditor,
            transform: value => value.split(',').map(x => parseInt(x)).filter(x => !isNaN(x))
        }
    }
});