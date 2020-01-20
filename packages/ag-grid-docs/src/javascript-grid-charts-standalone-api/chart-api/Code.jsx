import React from 'react';
import './Code.css';
import { formatJson } from "./utils.jsx";

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
    const lines = ['// update existing chart'];
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

    return <React.Fragment>
        <pre>// create new chart<br />chart = AgChart.create({formatJson(options)});</pre>
        {lines.length > 1 && <pre>{lines.join('\n')}</pre>}
    </React.Fragment>;
};

const ReactCode = ({ options }) => {
    return <pre>
const options = {formatJson(options)};

{`\n\n<AgChartsReact options={options} />;`}
    </pre>;
}

const AngularCode = ({ options }) => {
    return <pre>
const options = {formatJson(options)};

{`\n\n<ag-charts-angular [options]="options"></ag-charts-angular>`}
    </pre>;
}

const VueCode = ({ options }) => {
    return <pre>
const options = {formatJson(options)};

{`\n\n<ag-charts-vue :options="options"></ag-charts-vue>`}
    </pre>;
}