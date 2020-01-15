import React from 'react';
import './Code.css';
import { formatJson } from "./utils.jsx";

export const Code = ({ options }) => <div className='code'>
    <OptionsCode options={options} />
    <ApiCode options={options} />
</div>;

const OptionsCode = ({ options }) => <pre>// create new chart<br />AgChart.create({formatJson(options)});</pre>;

const ApiCode = ({ options }) => {
    const lines = ['// update existing chart'];
    const extractLines = (prefix, object) => {
        if (Array.isArray(object) && ['this.chart.axes', 'this.chart.series'].indexOf(prefix) < 0) {
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
