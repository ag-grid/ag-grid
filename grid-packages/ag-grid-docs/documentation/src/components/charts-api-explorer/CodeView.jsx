import React from 'react';
import { formatJson } from './utils.jsx';
import Code from '../Code.jsx';
import styles from './CodeView.module.scss';

/**
 * This renders the code inside the Standalone Charts API Explorer.
 */
export const CodeView = ({ framework, options }) => {
    const codeMap = {
        javascript: VanillaCode,
        angular: AngularCode,
        react: ReactCode,
        vue: VueCode
    };

    const FrameworkCode = codeMap[framework];

    return <div className={styles['code']}>
        {FrameworkCode && <FrameworkCode options={options} />}
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
                lines.push(`${prefix}.${key} = ${formatJson(value)};`);
            }
        });
    };

    extractLines('chart', options);

    if (lines.length > 0) {
        lines.unshift('\n// update existing chart');
    }

    lines.unshift('// create new chart', `chart = AgChart.create(${formatJson(options)});`);

    return <Code code={lines} />;
};

const ReactCode = ({ options }) =>
    <Code code={[`const options = ${formatJson(options)};`, '', '<AgChartsReact options={options} />']} language='jsx' />;

const AngularCode = ({ options }) => <>
    <Code code={[`const options = ${formatJson(options)};`]} />
    <Code code={['<ag-charts-angular [options]="options">', '</ag-charts-angular>']} language='html' />
</>;

const VueCode = ({ options }) => <>
    <Code code={[`const options = ${formatJson(options)};`]} />
    <Code code={['<ag-charts-vue :options="options"></ag-charts-vue>']} language='html' />
</>;