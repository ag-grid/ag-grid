import React, { useState } from 'react';
import './App.css';
import { AgChart } from "ag-charts-community";
import { data, getTemplates, series } from "./templates.jsx";
import { generalConfig, axisConfig, barSeriesConfig } from "./config.jsx";

const appName = 'chart-api';

const formatJson = object => {
    // custom formatting for number arrays
    const formattedJson = JSON.stringify(object, (_, v) => Array.isArray(v) && v.every(x => !isNaN(x)) ? `[${v.join(', ')}]` : v, 2);

    return formattedJson.replace('"[', '[').replace(']"', ']');
}

const Code = ({ options }) => <div className='code'>
    <OptionsCode options={options} />
    <ApiCode options={options} />
</div>;

const OptionsCode = ({ options }) => <pre>// create new chart<br />AgChart.create({formatJson(options)});</pre>;

const ApiCode = ({ options }) => {
    const lines = ['// update existing chart'];
    const extractLines = (prefix, object) => {
        if (Array.isArray(object) && prefix !== 'this.chart.axes') {
            // arrays should be specified in their entirety
            lines.push(`${prefix} = ${formatJson(object)};`);
            return;
        }

        Object.keys(object).forEach(key => {
            const value = object[key];

            if (typeof value === 'object') {
                extractLines(Array.isArray(object) ? `${prefix}[${key}]` : `${prefix}.${key}`, value);
            } else if (value != null) {
                lines.push(`${prefix}.${key} = ${JSON.stringify(value)};`);
            }
        });
    };

    extractLines('this.chart', options);

    return lines.length > 1 && <pre>{lines.join('\n')}</pre>;
};

const Option = ({ name, isRequired, type, description, defaultValue, Editor, editorProps }) => {
    return <div className='option'>
        <span className='option__name'>{name}</span>
        {type && <span className='option__type'>{type}</span>}
        <div className='option__default'>Default: {defaultValue != null ? <code className='option__code'>{formatJson(defaultValue)}</code>: 'N/A'}</div><br />
        {isRequired && <span className='option__required'>Required.</span>}<span className='option__description'>{description}</span><br />
        {Editor && <React.Fragment>Value: <Editor value={defaultValue} {...editorProps} /></React.Fragment>}
    </div>;
};

const deepClone = object => JSON.parse(JSON.stringify(object || {}));

const createOptionsJson = options => {
    const json = {
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
        series: [{
            type: 'column',
            xKey: 'month',
            yKeys: ['revenue', 'profit'],
            ...options.series,
        }]
    };

    const gridStyle = json.axes && json.axes[0].gridStyle;

    if (gridStyle) {
        // special handling for gridStyle which requires an array
        json.axes[0].gridStyle = [gridStyle];
    }

    return json;
};

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
        return <div className='chart' ref={this.chart}></div>;
    }
}

class Options extends React.PureComponent {
    config = {
        chart: generalConfig,
        axis: axisConfig,
        series: barSeriesConfig
    };

    configNameMappings = {
        'chart': 'General chart options',
        'axis': 'Axis options',
        'series': 'Series options'
    };

    getName = name => this.configNameMappings[name] || name;

    generateOptions = (options, prefix = '') => {
        let elements = [];

        Object.keys(options).forEach(name => {
            const key = `${prefix}${name}`;
            const config = options[name];
            const {
                type,
                isRequired,
                description,
                default: defaultValue,
                editor,
                ...editorProps
            } = config;

            if (config.description) {
                elements.push(<Option
                    key={key}
                    name={name}
                    type={type}
                    isRequired={isRequired}
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
        return <div className="options">{this.generateOptions(this.config)}</div>;
    }
};

const Section = ({ title, children }) => {
    const [expanded, setExpanded] = useState(true);

    return <div className={`section ${expanded ? 'section--expanded' : ''}`}>
        <h2 className={`section__heading ${expanded ? 'section__heading--expanded' : ''}`}
            onClick={() => setExpanded(!expanded)}>
            {title}
        </h2>
        {expanded && children}
    </div>;
}

export class App extends React.Component {
    state = {
        framework: this.getCurrentFramework(),
        options: {}
    };

    updateOptions = (expression, value, defaultValue) => {
        const newOptions = deepClone(this.state.options);
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

        if (value == null || value === '' || JSON.stringify(value) === JSON.stringify(defaultValue)) {
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
            <Chart options={options} />
            <Options updateOptions={this.updateOptions} />
            <Code options={options} />
        </div>;
    }
}

export default App;
