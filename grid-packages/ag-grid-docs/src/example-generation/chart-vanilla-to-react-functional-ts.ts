import { templatePlaceholder } from './chart-vanilla-src-parser';
import { isInstanceMethod, convertFunctionToProperty, addBindingImports } from './parser-utils';
import { convertFunctionalTemplate, convertFunctionToConstCallback, getImport } from './react-utils';
import { wrapOptionsUpdateCode } from './chart-utils';
import { toTitleCase } from './angular-utils';

export function processFunction(code: string): string {
    return wrapOptionsUpdateCode(
        convertFunctionToProperty(code),
        'const clone = {...options};',
        'setOptions(clone);', 'clone');
}

function getImports(componentFilenames: string[], bindings): string[] {

    const useCallback = (bindings.externalEventHandlers?.length + bindings.instanceMethods?.length) > 0;

    const imports = [
        `import React, { useState${useCallback ? ', useCallback ' : ''}${bindings.usesChartApi ? ', useRef ' : ''}} from 'react';`,
        "import { render } from 'react-dom';",
        "import { AgChartsReact } from 'ag-charts-react';",
    ];

    if (bindings.imports.length > 0) {
        addBindingImports(bindings.imports, imports, false, true);
    }

    if (componentFilenames) {
        imports.push(...componentFilenames.map(getImport));
    }

    return imports;
}

function getTemplate(bindings: any, componentAttributes: string[]): string {
    const agChartTag = `<AgChartsReact
    ${bindings.usesChartApi ? 'ref={chartRef}' : ''}
    ${componentAttributes.join('\n')}
/>`;

    const template = bindings.template ? bindings.template.replace(templatePlaceholder, agChartTag) : agChartTag;

    return convertFunctionalTemplate(template);
}

export function vanillaToReactFunctionalTs(bindings: any, componentFilenames: string[]): () => string {
    return () => {
        const { properties, } = bindings;
        const imports = getImports(componentFilenames, bindings);
        const stateProperties = [];
        const componentAttributes = [];
        const instanceBindings = [];

        properties.forEach(property => {

            if (property.value === 'true' || property.value === 'false') {
                componentAttributes.push(`${property.name}={${property.value}}`);
            } else if (property.value === null) {
                componentAttributes.push(`${property.name}={${property.name}}`);
            } else {
                // for when binding a method
                // see javascript-grid-keyboard-navigation for an example
                // tabToNextCell needs to be bound to the react component
                if (isInstanceMethod(bindings.instanceMethods, property)) {
                    instanceBindings.push(`this.${property.name}=${property.value}`);
                } else {
                    stateProperties.push(`const [${property.name}, set${toTitleCase(property.name)}] = useState${property.name === 'options' ? '<AgChartOptions>' : ''}(${property.value});`);
                    componentAttributes.push(`${property.name}={${property.name}}`);
                }
            }
        });

        const template = getTemplate(bindings, componentAttributes);
        const externalEventHandlers = bindings.externalEventHandlers.map(handler => processFunction(convertFunctionToConstCallback(handler.body, bindings.callbackDependencies)));
        const instanceMethods = bindings.instanceMethods.map(m => processFunction(convertFunctionToConstCallback(m, bindings.callbackDependencies)));

        let indexFile = `'use strict';

${imports.join('\n')}

const ChartExample = () => {
    
        ${bindings.usesChartApi ? `
        const chartRef = useRef<AgChartsReact>(null);` : ''}
        ${stateProperties.join(',\n            ')}

        ${instanceBindings.join(';\n        ')}
        ${instanceMethods.concat(externalEventHandlers).join('\n\n    ')}

        return ${template};
    }

${bindings.globals.join('\n')}

render(
    <ChartExample />,
    document.querySelector('#root')
)
`;

        if (bindings.usesChartApi) {
            indexFile = indexFile.replace(/AgChart.(\w*)\((\w*)(,|\))/g, 'AgChart.$1(chartRef.current!.chart$3');
            indexFile = indexFile.replace(/\(this.chartRef.current.chart, options/g, '(chartRef.current!.chart, options');
        }

        return indexFile;

    };
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToReactFunctionalTs = vanillaToReactFunctionalTs;
}
