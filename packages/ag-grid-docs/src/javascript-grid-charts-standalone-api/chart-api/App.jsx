import React, { useState } from 'react';
import './App.css';
import { agChart } from "ag-charts-community";
import { AgChartsReact } from "ag-charts-react";

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<script> var __basePath = ''; </script>
<style media="only screen">
    html, body {
        height: 100%;
        width: 100%;
        margin: 0;
        box-sizing: border-box;
        -webkit-overflow-scrolling: touch;
    }
    html {
        position: absolute;
        top: 0;
        left: 0;
        padding: 0;
        overflow: auto;
    }
    body {
        padding: 1rem;
        overflow: auto;
    }
</style>
<link rel='stylesheet' href='//localhost:8080/dev/@ag-grid-community/all-modules/dist/styles/ag-grid.css'><link rel='stylesheet' href='//localhost:8080/dev/@ag-grid-community/all-modules/dist/styles/ag-theme-alpine-dark.css'><link rel='stylesheet' href='//localhost:8080/dev/@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css'><link rel='stylesheet' href='//localhost:8080/dev/@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css'><link rel='stylesheet' href='//localhost:8080/dev/@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css'><link rel='stylesheet' href='//localhost:8080/dev/@ag-grid-community/all-modules/dist/styles/ag-theme-material.css'><script src='//localhost:8080/dev/@ag-grid-community/all-modules/dist/ag-grid-community.js'></script></head>
<body>

<div id="myGrid" style="height: 100%;" class="ag-theme-alpine"></div>

    <script src="main.js"></script>
</body>
</html>`;

const mainJs = `
        var columnDefs = [
    {field: 'athlete'},
    {field: 'age'},
    {field: 'country', headerTooltip: 'The country the athlete represented'},
    {field: 'year', headerTooltip: 'The year of the olympics'},
    {field: 'date', headerTooltip: 'The date of the olympics'},
    {field: 'sport', headerTooltip: 'The sport the medal was for'},
    {field: 'gold', headerTooltip: 'How many gold medals'},
    {field: 'silver', headerTooltip: 'How many silver medals'},
    {field: 'bronze', headerTooltip: 'How many bronze medals'},
    {field: 'total', headerTooltip: 'The total number of medals'}
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        width: 100
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});`

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

        const data = [{
            month: 'Jan',
            revenue: 155000,
            profit: 33000
        }, {
            month: 'Feb',
            revenue: 123000,
            profit: 35500
        }, {
            month: 'Mar',
            revenue: 172500,
            profit: 41000
        }, {
            month: 'Apr',
            revenue: 185000,
            profit: 50000
        }];

        agChart.create({
            ...this.props.options,
            data,
            parent: this.chart.current,
            series: [{
                type: 'column',
                xKey: 'month',
                yKeys: ['revenue', 'profit'],
            }],
        });
    }

    render() {
        return <div ref={this.chart}></div>;
    }
}

const ReactChart = (props) => {
    return (
        <AgChartsReact
            options={{
                data: [{
                    month: 'Jan',
                    revenue: 155000,
                    profit: 33000
                }, {
                    month: 'Feb',
                    revenue: 123000,
                    profit: 35500
                }, {
                    month: 'Mar',
                    revenue: 172500,
                    profit: 41000
                }, {
                    month: 'Apr',
                    revenue: 185000,
                    profit: 50000
                }],
                series: [{
                    xKey: 'month',
                    yKey: 'revenue'
                }],
                legend: {
                    markerSize: 25
                }
            }}
        />
    )
};


export class App extends React.Component {
    state = {
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

    componentDidUpdate() {
        window.parent.document.getElementById('chart-api').setAttribute('data-context',
            JSON.stringify({
                files: {
                    'index.html': indexHtml,
                    'main.js': mainJs
                }
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
            <ReactChart/>
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
