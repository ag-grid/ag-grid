import { getFunctionName } from './chart-vanilla-src-parser';
import styleConvertor from './lib/convert-style-to-react';

function isInstanceMethod(instance: any, property: any): boolean {
    const instanceMethods = instance.map(getFunctionName);
    return instanceMethods.filter(methodName => methodName === property.name).length > 0;
}

function convertFunctionToProperty(definition: string): string {
    return definition.replace(/^function\s+([^\(\s]+)\s*\(([^\)]*)\)/, '$1 = ($2) => ');
}

function toTitleCase(value: string): string {
    return value[0].toUpperCase() + value.slice(1);
}

function getImports(componentFilenames: string[]): string[] {
    const imports = [
        "import React, { Component } from 'react';",
        "import { render } from 'react-dom';",
        "import * as agCharts from 'ag-charts-community';",
        "import { AgChartsReact } from 'ag-charts-react';",
    ];

    if (componentFilenames) {
        componentFilenames.forEach(filename => {
            const componentName = toTitleCase(filename.split('.')[0]);
            imports.push(`import ${componentName} from './${filename}';`);
        });
    }

    return imports;
}

function getTemplate(bindings: any, componentAttributes: string[]): string {
    const agChartTag = `<AgChartsReact
    ${componentAttributes.join('\n')}
/>`;

    let template = bindings.template ? bindings.template.replace('$$CHART$$', agChartTag) : agChartTag;

    template = template
        .replace(/\(this\, \)/g, '(this)')
        .replace(/<input type="(radio|checkbox|text)" (.+?)>/g, '<input type="$1" $2 />')
        .replace(/<input placeholder(.+?)>/g, '<input placeholder$1 />')
        .replace(/ class=/g, " className=");

    return styleConvertor(template);
}

export function vanillaToReact(bindings: any, componentFilenames: string[]): string {
    const { properties } = bindings;
    const imports = getImports(componentFilenames);
    const stateProperties = [];
    const componentAttributes = [];
    const instanceBindings = [];

    properties.forEach(property => {
        if (componentFilenames.length > 0 && property.name === 'components') {
            property.name = 'frameworkComponents';
        }

        if (property.value === 'true' || property.value === 'false') {
            componentAttributes.push(`${property.name}={${property.value}}`);
        } else if (property.value === null) {
            componentAttributes.push(`${property.name}={this.${property.name}}`);
        } else {
            // for when binding a method
            // see javascript-grid-keyboard-navigation for an example
            // tabToNextCell needs to be bound to the react component
            if (isInstanceMethod(bindings.instance, property)) {
                instanceBindings.push(`this.${property.name}=${property.value}`);
            } else {
                stateProperties.push(`${property.name}: ${property.value}`);
                componentAttributes.push(`${property.name}={this.state.${property.name}}`);
            }
        }
    });

    const template = getTemplate(bindings, componentAttributes);
    const instance = bindings.instance.filter(p => p.name === 'chart').map(convertFunctionToProperty);

    return `
'use strict'

${imports.join('\n')}

class ChartExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ${stateProperties.join(',\n    ')}
        };

        ${instanceBindings.join(';\n    ')}
    }
${instance.join('\n\n   ')}

    render() {
        return (
            ${template}
        );
    }
}

${bindings.globals.join('\n')}

render(
    <ChartExample />,
    document.querySelector('#root')
)
`;
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToReact = vanillaToReact;
}
