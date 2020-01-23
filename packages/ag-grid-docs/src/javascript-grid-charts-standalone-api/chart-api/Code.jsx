import React from 'react';
import './Code.css';
import { formatJson } from './utils.jsx';
import { CodeSnippet } from './CodeSnippet.jsx';

export const Code = ({ framework, options }) => {
    let Code;

    switch (framework) {
        case 'vanilla':
            Code = VanillaCode;
            break;
        case 'react':
            Code = ReactCode;
            break;
        case 'angular':
            Code = AngularCode;
            break;
        case 'vue':
            Code = VueCode;
            break;
    }

    return <div className='code'>
        {Code && <Code options={options} />}
    </div>;
};

const VanillaCode = ({ options }) => {
    const lines = [];
    const extractLines = (prefix, object) => {
        if (Array.isArray(object) && ['chart.axes', 'chart.series'].indexOf(prefix) < 0) {
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

    extractLines('chart', options);

    if (lines.length > 0) {
        lines.unshift('\n// update existing chart');
    }

    lines.unshift('// create new chart', `chart = AgChart.create(${formatJson(options)});`);

    return <CodeSnippet lines={lines} />;
};

const ReactCode = ({ options }) => <CodeSnippet lines={[`const options = ${formatJson(options)};`, '', '<AgChartsReact options={options} />']} language='jsx' />;

const AngularCode = ({ options }) => <React.Fragment>
    <CodeSnippet lines={[`const options = ${formatJson(options)};`]} />
    <CodeSnippet lines={['<ag-charts-angular [options]="options">', '</ag-charts-angular>']} language='html' />
</React.Fragment>;


const VueCode = ({ options }) => <React.Fragment>
    <CodeSnippet lines={[`const options = ${formatJson(options)};`]} />
    <CodeSnippet lines={['<ag-charts-vue :options="options"></ag-charts-vue>']} language='html' />
</React.Fragment>;
