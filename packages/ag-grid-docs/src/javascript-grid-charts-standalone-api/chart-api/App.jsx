import React from 'react';
import './App.css';
import { AgChart } from "ag-charts-community";
import { data, getTemplates, series } from "./templates.jsx";
import { generalConfig } from "./config.jsx";

const appName = 'chart-api';

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
    };

    extractLines("this.chart", options);

    return <pre>{lines.join("\n")}</pre>;
};

const Option = ({ name, description, value, updateValue, options, Editor }) => {
    return <div>
        <hr />
        <strong>{name}</strong>: {description}<br />
        Default: {value != null ? value.toString() : "N/A"}<br />
        Value: <Editor value={value} onChange={updateValue} options={options} />
    </div>;
};

class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.chart = React.createRef();
    }

    chartInstance = undefined;

    componentDidMount() {
        this.chartInstance = AgChart.create(this.createOptions());
    }

    componentDidUpdate() {
        if (this.chartInstance) {
            AgChart.update(this.chartInstance, this.createOptions());
        }
    }

    createOptions() {
        return {
            ...JSON.parse(JSON.stringify(this.props.options)),
            data,
            container: this.chart.current,
            series,
        };
    }

    render() {
        return <div ref={this.chart}></div>;
    }
}

class Options extends React.PureComponent {
    config = {
        ...generalConfig,
    };

    generateOptionConfig = (options, prefix = '') => {
        let elements = [];

        Object.keys(options).forEach(name => {
            const key = `${prefix}${name}`;
            const config = options[name];

            if (config.description) {
                elements.push(<Option
                    key={key}
                    name={name}
                    description={config.description}
                    value={config.default}
                    updateValue={newValue => this.props.updateOptions(key, newValue, config.default)}
                    options={config.options}
                    Editor={config.editor}
                />);
            } else {
                elements.push(<div class="section">
                    <h2 key={key}>{name}</h2>
                    {this.generateOptionConfig(config, `${key}.`)}
                </div>);
            }
        });

        return elements;
    };

    render() {
        return this.generateOptionConfig(this.config);
    }
};

export class App extends React.Component {
    state = {
        framework: this.getCurrentFramework(),
        options: {}
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
    };

    getCurrentFramework() {
        const frameworkDropdownElement = window.parent.document.querySelector(`[data-framework-dropdown=${appName}]`);
        const currentFramework = frameworkDropdownElement && frameworkDropdownElement.getAttribute('data-current-framework');
        return currentFramework || 'vanilla';
    }

    componentDidMount() {
        this.componentDidUpdate();

        window.parent.document.querySelectorAll(`[data-framework-item=${appName}]`).forEach(element => {
            element.addEventListener('click', () => this.setState({ framework: this.getCurrentFramework() }));
        });
    }

    componentDidUpdate() {
        window.parent.document.getElementById(appName).setAttribute('data-context',
            JSON.stringify({
                files: getTemplates(this.state.framework, this.state.options)
            })
        );
    }

    render() {
        const { options } = this.state;

        return <div className="app">
            <div className="chart"><Chart options={options} /></div>
            <div className="options">
                <Options updateOptions={this.updateOptions} />
            </div>
            <div className="code">
                <OptionsCode options={options} />
                <ApiCode options={options} />
            </div>
        </div>;
    }
}

export default App;
