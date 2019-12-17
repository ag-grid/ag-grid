import React, {useState} from 'react';
import './App.css';

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

const OptionsCode = ({options}) => <pre>options = {JSON.stringify(options, null, 2)}</pre>;

const ApiCode = ({options}) => {
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

const Option = ({name, description, value, updateValue, options, Editor}) => {
    return <div>
        <hr/>
        <strong>{name}</strong>: {description}<br/>
        Default: {value.toString()}<br/>
        <Editor value={value} onChange={updateValue} options={options}/>
    </div>;
}

const NumberEditor = ({value, onChange}) => {
    const [stateValue, setValueChange] = useState(value);
    const inputOnChange = event => {
        const newValue = parseInt(event.target.value);
        setValueChange(newValue);
        onChange(newValue);
    }

    return <input type="number" value={stateValue} onChange={inputOnChange}/>
}

const StringEditor = ({value, onChange}) => {
    const [stateValue, setValueChange] = useState(value);
    const inputOnChange = event => {
        const newValue = event.target.value;
        setValueChange(newValue);
        onChange(newValue);
    }

    return <input type="text" value={stateValue} onChange={inputOnChange}/>
}

const CheckboxEditor = ({value, onChange}) => {
    const [stateValue, setValueChange] = useState(value);
    const inputOnChange = event => {
        const newValue = event.target.checked;
        setValueChange(newValue);
        onChange(newValue);
    }

    return <input type="checkbox" value={stateValue} onChange={inputOnChange}/>
}

const DropDownEditor = ({value, options, onChange}) => {
    const [stateValue, setValueChange] = useState(value);
    const inputOnChange = event => {
        const newValue = event.target.value;
        setValueChange(newValue);
        onChange(newValue);
    }

    return <select value={stateValue} onChange={inputOnChange}>
        {options.map(o => <option>{o}</option>)}
    </select>;
}

export class App extends React.Component {
    state = {
        options: {}
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
        legend: {
            enabled: {
                default: true,
                description: "Configures whether to show the legend",
                editor: CheckboxEditor
            },
            position: {
                default: "right",
                description: "The position to show the legend",
                options: ['top', 'right', 'bottom', 'left'],
                editor: DropDownEditor
            }
        }
    };

    createUpdatedOptions = (expression, value) => {
        const newOptions = {...this.state.options};
        const keys = expression.split(".");
        let objectToUpdate = newOptions;

        while (keys.length > 1) {
            const parent = objectToUpdate;
            const key = keys.shift();

            objectToUpdate = parent[key];

            if (objectToUpdate == null) {
                objectToUpdate = {};
                parent[key] = objectToUpdate;
            }
        }

        objectToUpdate[keys[0]] = value;

        return newOptions;
    };

    componentDidMount() {
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
                        name={key}
                        description={value.description}
                        value={value.default}
                        updateValue={value => this.setState({options: this.createUpdatedOptions(`${prefix}${key}`, value)})}
                        options={value.options}
                        Editor={value.editor}
                    />);
                } else {
                    elements.push(<h2>{key}</h2>);

                    elements = elements.concat(generateOptionConfig(value, `${prefix}${key}.`));
                }
            });

            return elements;
        }

        return <div className="App">
            <div>
                <pre>>> ChartBuilder.createChart({JSON.stringify(this.state.options)}}</pre>
            </div>
            <div>
                {generateOptionConfig(this.config, '')}
            </div>
            <hr/>
            <OptionsCode options={this.state.options}/>
            <ApiCode options={this.state.options}/>
        </div>;
    }
}

export default App;
