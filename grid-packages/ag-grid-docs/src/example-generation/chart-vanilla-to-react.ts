import { templatePlaceholder } from './chart-vanilla-src-parser';
import { isInstanceMethod, convertFunctionToProperty } from './parser-utils';
import { convertTemplate, getImport } from './react-utils';
import { wrapOptionsUpdateCode, getChartImports } from './chart-utils';

export function processFunction(code: string): string {
    return wrapOptionsUpdateCode(
        convertFunctionToProperty(code),
        'const options = {...this.state.options};',
        'this.setState({ options });');
}

function getImports(componentFilenames: string[], bindings): string[] {
    const imports = [
        "import React, { Component } from 'react';",
        "import { createRoot } from 'react-dom';",
        "import { AgChartsReact } from 'ag-charts-react';",
    ];

    const chartImport = getChartImports(bindings.imports, bindings.usesChartApi)
    if (chartImport) {
        imports.push(chartImport);
    }

    if (componentFilenames) {
        imports.push(...componentFilenames.map(getImport));
    }

    return imports;
}

function getTemplate(bindings: any, componentAttributes: string[]): string {
    const agChartTag = `<AgChartsReact
    ${bindings.usesChartApi ? `ref={this.chartRef}` : ''}
    ${componentAttributes.join('\n')}
/>`;

    const template = bindings.template ? bindings.template.replace(templatePlaceholder, agChartTag) : agChartTag;

    return convertTemplate(template);
}

export function vanillaToReact(bindings: any, componentFilenames: string[]): () => string {
    return () => {
        const { properties, imports: bindingImports } = bindings;
        const imports = getImports(componentFilenames, bindings);
        const stateProperties = [];
        const componentAttributes = [];
        const instanceBindings = [];

        properties.forEach(property => {

            if (property.value === 'true' || property.value === 'false') {
                componentAttributes.push(`${property.name}={${property.value}}`);
            } else if (property.value === null) {
                componentAttributes.push(`${property.name}={this.${property.name}}`);
            } else {
                // for when binding a method
                // see javascript-grid-keyboard-navigation for an example
                // tabToNextCell needs to be bound to the react component
                if (isInstanceMethod(bindings.instanceMethods, property)) {
                    instanceBindings.push(`this.${property.name}=${property.value}`);
                } else {
                    stateProperties.push(`${property.name}: ${property.value}`);
                    componentAttributes.push(`${property.name}={this.state.${property.name}}`);
                }
            }
        });

        const template = getTemplate(bindings, componentAttributes);
        const externalEventHandlers = bindings.externalEventHandlers.map(handler => processFunction(handler.body));
        const instanceMethods = bindings.instanceMethods.map(processFunction);

        let indexFile = `'use strict';

${imports.join('\n')}

class ChartExample extends Component {
    constructor(props) {
        super(props);
        ${bindings.usesChartApi ? `
        this.chartRef = React.createRef();` : ''}
        this.state = {
            ${stateProperties.join(',\n            ')}
        };

        ${instanceBindings.join(';\n        ')}
    }

    componentDidMount() {
        ${bindings.init.join(';\n        ')}
    }

    ${instanceMethods.concat(externalEventHandlers).join('\n\n    ')}

    render() {
        return ${template};
    }
}

${bindings.globals.join('\n')}

const root = createRoot(document.getElementById('root'));
root.render(<ChartExample />);
`;

        if (bindings.usesChartApi) {
            indexFile = indexFile.replace(/AgChart.(\w*)\((\w*)(,|\))/g, 'AgChart.$1(this.chartRef.current.chart$3');
            indexFile = indexFile.replace(/\(this.chartRef.current.chart, options/g, '(this.chartRef.current.chart, this.state.options');
        }

        return indexFile;

    };
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToReact = vanillaToReact;
}
