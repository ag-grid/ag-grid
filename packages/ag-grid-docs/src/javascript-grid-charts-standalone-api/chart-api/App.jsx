import React, { useState } from 'react';
import './App.css';
import { agChart } from "ag-charts-community";
import { data, series, getTemplates } from "./templates.jsx";

const OptionsCode = ({ options }) => <pre>options = {JSON.stringify(options, null, 2)}</pre>;

const ApiCode = ({ options }) => {
    const lines = [];
    const extractLines = (prefix, object) => {
        Object.keys(object).forEach(key => {
            const value = object[key];
            if (typeof value === 'object') {
                extractLines(`${prefix}.${key}`, value);
            } else {
                lines.push(`${prefix}.${key} = ${JSON.stringify(value)};`);
            }
        });
    }

    extractLines("this.chart", options);

    return <pre>{lines.join("\n")}</pre>;
}

const Option = ({ name, description, value, updateValue, options, Editor }) => {
    return <div>
        <hr />
        <strong>{name}</strong>: {description}<br />
        Default: {value ? value.toString() : "N/A"}<br />
        Value: <Editor value={value} onChange={updateValue} options={options} />
    </div>;
}

const NumberEditor = ({ value, onChange }) => {
    const [stateValue, setValueChange] = useState(value);
    const inputOnChange = event => {
        const newValue = parseInt(event.target.value);
        setValueChange(newValue);
        onChange(newValue);
    }

    return <input type="number" value={stateValue} onChange={inputOnChange} />
}

const StringEditor = ({ value, onChange }) => {
    const [stateValue, setValueChange] = useState(value);
    const inputOnChange = event => {
        const newValue = event.target.value;
        setValueChange(newValue);
        onChange(newValue);
    }

    return <input type="text" value={stateValue} onChange={inputOnChange} />
}

const CheckboxEditor = ({ value, onChange }) => {
    const [stateValue, setValueChange] = useState(value);
    const inputOnChange = event => {
        const newValue = event.target.checked;
        setValueChange(newValue);
        onChange(newValue);
    }

    return <input type="checkbox" checked={stateValue} onChange={inputOnChange} />
}

const DropDownEditor = ({ value, options, onChange }) => {
    const [stateValue, setValueChange] = useState(value);
    const inputOnChange = event => {
        const newValue = event.target.value;
        setValueChange(newValue);
        onChange(newValue);
    }

    return <select value={stateValue} onChange={inputOnChange}>
        {options.map(o => <option key={o}>{o}</option>)}
    </select>;
}

const ColourEditor = ({ value, onChange }) => {
    const [stateValue, setValueChange] = useState(value);
    const inputOnChange = color => {
        setValueChange(color);
        onChange(color);
    }

    const [isShown, setIsShown] = useState(false);
    const onClick = () => setIsShown(!isShown);

    return <React.Fragment>
        <span style={{ display: "inline-block", "backgroundColor": stateValue, width: "15px", height: "15px", border: "solid 1px black" }} onClick={onClick}></span>
        {isShown && <ChromePicker color={stateValue} onChangeComplete={color => inputOnChange(color.hex)} />}
    </React.Fragment>
}

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

const getCaptionOptions = (name, fontWeight = 'normal', fontSize = 12) => ({
    enabled: {
        default: false,
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

class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.chart = React.createRef();
    }

    componentDidMount() {
        this.componentDidUpdate();
    }

    componentDidUpdate() {
        this.chart.current.innerHTML = "";

        agChart.create({
            ...this.props.options,
            data,
            parent: this.chart.current,
            series,
        });
    }

    render() {
        return <div ref={this.chart}></div>;
    }
}

export class App extends React.Component {
    state = {
        framework: 'react',
        options: {
        }
    };

    config = {
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
                default: 10,
                description: "Padding at the top of the chart area",
                editor: NumberEditor
            },
            right: {
                default: 10,
                description: "Padding at the right of the chart area",
                editor: NumberEditor
            },
            bottom: {
                default: 10,
                description: "Padding at the bottom of the chart area",
                editor: NumberEditor
            },
            left: {
                default: 10,
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
                default: false,
                description: "Whether the background should be visible or not",
                editor: CheckboxEditor
            }
        },
        title: getCaptionOptions("title", "bold", 16),
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
                description: "The padding to use around the legend",
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

    updateOptions = (expression, value, defaultValue) => {
        const newOptions = { ...this.state.options };
        const keys = expression.split(".");
        const objects = [];
        let objectToUpdate = newOptions;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            const parent = objectToUpdate;

            objects.push(parent);
            objectToUpdate = parent[key];

            if (objectToUpdate == null) {
                objectToUpdate = {};
                parent[key] = objectToUpdate;
            }
        }

        let keyIndex = keys.length - 1;
        let key = keys[keyIndex];

        if (value === defaultValue) {
            delete objectToUpdate[key];

            while (keyIndex > 0 && Object.keys(objectToUpdate).length < 1) {
                keyIndex--;
                objectToUpdate = objects[keyIndex];
                key = keys[keyIndex];

                delete objectToUpdate[key];
            }
        } else {
            objectToUpdate[key] = value;
        }

        this.setState({ options: newOptions });
    }

    componentDidMount() {
        this.componentDidUpdate();
    }

    componentDidUpdate() {
        window.parent.document.getElementById('chart-api').setAttribute('data-context',
            JSON.stringify({
                files: getTemplates(this.state.framework, this.state.options)
            })
        );
    }

    render() {
        const generateOptionConfig = (options, prefix) => {
            let elements = [];

            Object.keys(options).forEach(key => {
                const value = options[key];

                if (value.description) {
                    elements.push(<Option
                        key={`${prefix}${key}`}
                        name={key}
                        description={value.description}
                        value={value.default}
                        updateValue={newValue => this.updateOptions(`${prefix}${key}`, newValue, value.default)}
                        options={value.options}
                        Editor={value.editor}
                    />);
                } else {
                    elements.push(<div class="section">
                        <h2 key={`${prefix}${key}`}>{key}</h2>
                        {generateOptionConfig(value, `${prefix}${key}.`)}
                    </div>);
                }
            });

            return elements;
        }

        return <div className="app">
            <div className="chart"><Chart options={this.state.options} /></div>
            <div className="options">
                {generateOptionConfig(this.config, '')}
            </div>
            <div className="code">
                <OptionsCode options={this.state.options} />
                <ApiCode options={this.state.options} />
            </div>
        </div>;
    }
}

export default App;
