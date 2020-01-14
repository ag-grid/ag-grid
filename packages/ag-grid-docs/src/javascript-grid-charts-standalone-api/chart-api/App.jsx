import React, { useState } from 'react';
import './App.css';
import { AgChart } from "ag-charts-community";
import { data, getTemplates, series } from "./templates.jsx";
import { generalConfig, axisConfig } from "./config.jsx";

const appName = 'chart-api';

const OptionsCode = ({ options }) => <pre>// create new chart<br />AgChart.create({JSON.stringify(options, null, 2)});</pre>;

const ApiCode = ({ options }) => {
    const lines = ['// update existing chart'];
    const extractLines = (prefix, object) => {
        Object.keys(object).forEach(key => {
            const value = object[key];

            if (Array.isArray(object)) {
                extractLines(`${prefix}[${key}]`, value);
            }
            else if (typeof value === 'object') {
                extractLines(`${prefix}.${key}`, value);
            } else if (value != null) {
                lines.push(`${prefix}.${key} = ${JSON.stringify(value)};`);
            }
        });
    };

    extractLines("this.chart", options);

    return lines.length > 1 && <pre>{lines.join("\n")}</pre>;
};

const Option = ({ name, description, defaultValue, Editor, editorProps }) => {
    return <div className='option'>
        <strong>{name}</strong>: {description}<br />
        Default: {defaultValue != null ? defaultValue.toString() : "N/A"}<br />
        {Editor && <React.Fragment>Value: <Editor value={defaultValue} {...editorProps} /></React.Fragment>}
    </div>;
};

const deepClone = object => JSON.parse(JSON.stringify(object || {}));

const createOptionsJson = options => ({
    ...options.chart,
    axes: options.axis && Object.keys(options.axis).length > 0 ? [{
        type: 'category',
        position: 'bottom',
        ...options.axis,
    },
    {
        type: 'number',
        position: 'left',
    }] : undefined,
});

class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.chart = React.createRef();
        this.useDynamicUpdates = false;
    }

    chartInstance = undefined;

    componentDidMount() {
        this.createChart();
    }

    componentDidUpdate() {
        if (this.chartInstance && this.useDynamicUpdates) {
            AgChart.update(this.chartInstance, this.createOptionsJson());
        } else {
            this.chartInstance && this.chartInstance.destroy();
            this.createChart();
        }
    }

    createChart() {
        this.chartInstance = AgChart.create(this.createOptionsJson());
    }

    createOptionsJson() {
        return {
            container: this.chart.current,
            data,
            series,
            ...deepClone(this.props.options),
        };
    }

    render() {
        return <div ref={this.chart}></div>;
    }
}

class Options extends React.PureComponent {
    config = {
        chart: generalConfig,
        axis: axisConfig
    };

    getName = name => {
        switch (name) {
            case 'chart':
                return "General chart options";
            case 'axis':
                return "Axis options";
            default:
                return name;
        }
    }

    generateOptions = (options, prefix = '') => {
        let elements = [];

        Object.keys(options).forEach(name => {
            const key = `${prefix}${name}`;
            const config = options[name];
            const { description, default: defaultValue, editor, ...editorProps } = config;

            if (config.description) {
                elements.push(<Option
                    key={key}
                    name={name}
                    description={description}
                    defaultValue={defaultValue}
                    Editor={editor}
                    editorProps={{
                        ...editorProps,
                        onChange: newValue => this.props.updateOptions(key, newValue, defaultValue)
                    }}
                />);
            } else {
                elements.push(<Section key={key} title={this.getName(name)}>
                    {this.generateOptions(config, `${key}.`)}
                </Section>);
            }
        });

        return elements;
    };

    render() {
        return this.generateOptions(this.config);
    }
};

const Section = ({ title, children }) => {
    const [expanded, setExpanded] = useState(true);

    return <div className={`section ${expanded ? 'expanded' : ''}`}>
        <h2 onClick={() => setExpanded(!expanded)}>{title}</h2>
        {expanded && children}
    </div>;
}

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
                files: getTemplates(this.state.framework, createOptionsJson(this.state.options))
            })
        );
    }

    render() {
        const options = createOptionsJson(this.state.options);

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
