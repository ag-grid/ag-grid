import { convertFunctionToConstProperty, getFunctionName, getModuleRegistration, ImportType, isInstanceMethod } from './parser-utils';
import { convertFunctionalTemplate, convertFunctionToConstCallback, getImport, getValueType } from './react-utils';
import { templatePlaceholder } from "./grid-vanilla-src-parser";

function getModuleImports(bindings: any, componentFilenames: string[]): string[] {
    let imports = [
        "import React, { useCallback, useMemo, useRef, useState } from 'react';",
        "import { render } from 'react-dom';",
        "import { AgGridReact } from '@ag-grid-community/react';"
    ];

    imports.push("import '@ag-grid-community/styles/ag-grid.css';");
    // to account for the (rare) example that has more than one class...just default to alpine if it does
    const theme = bindings.gridSettings.theme || 'ag-theme-alpine';
    imports.push(`import '@ag-grid-community/styles/${theme}.css';`);

    if (componentFilenames) {
        imports.push(...componentFilenames.map(getImport));
    }

    imports = [...imports, ...getModuleRegistration(bindings)];

    return imports;
}

function getPackageImports(bindings: any, componentFilenames: string[]): string[] {
    const { gridSettings } = bindings;

    const imports = [
        "import React, { useCallback, useMemo, useRef, useState } from 'react';",
        "import { render } from 'react-dom';",
        "import { AgGridReact } from 'ag-grid-react';"
    ];

    if (gridSettings.enterprise) {
        imports.push("import 'ag-grid-enterprise';");
    }

    imports.push("import 'ag-grid-community/dist/styles/ag-grid.css';");

    // to account for the (rare) example that has more than one class...just default to alpine if it does
    const theme = gridSettings.theme || 'ag-theme-alpine';
    imports.push(`import 'ag-grid-community/dist/styles/${theme}.css';`);

    if (componentFilenames) {
        imports.push(...componentFilenames.map(getImport));
    }

    return imports;
}

function getImports(bindings: any, componentFileNames: string[], importType: ImportType): string[] {
    if (importType === 'packages') {
        return getPackageImports(bindings, componentFileNames);
    } else {
        return getModuleImports(bindings, componentFileNames);
    }
}

function getTemplate(bindings: any, componentAttributes: string[]): string {
    const { gridSettings } = bindings;
    const agGridTag = `
        <div ${gridSettings.myGridReference ? 'id="myGrid"' : ''} style={gridStyle} className="${gridSettings.theme}">             
            <AgGridReact
                ref={gridRef}
                ${componentAttributes.join('\n')}
            >
            </AgGridReact>
        </div>`;

    const template = bindings.template ? bindings.template.replace(templatePlaceholder, agGridTag.replace('$', '$$$$')) : agGridTag;

    return convertFunctionalTemplate(template);
}

function extractComponentInformation(properties, componentFilenames: string[]): { [key: string]: string } {
    const components: { [key: string]: string } = {};
    if (componentFilenames.length <= 0) {
        return components;
    }

    properties.forEach(property => {
        if (property.name === 'components') {
            property.value.split(`\n`).filter(keyValue => keyValue.includes(":"))
                .map(keyValue => keyValue.replace(/\s/g, ''))
                .map(keyValue => keyValue.replace(/,/g, ''))
                .map(keyValue => keyValue.split(':'))
                .reduce((accumulator, keyValue) => {
                    accumulator[keyValue[0]] = keyValue[1]
                    return accumulator
                }, components);
        }
    });

    return components;
}

function getEventAndCallbackNames() {
    const interfaces = require('../../documentation/doc-pages/grid-api/interfaces.AUTO.json');
    const docs = require('../../documentation/doc-pages/grid-api/doc-interfaces.AUTO.json');
    const gridOptions = docs['GridOptions'];
    const callbacksAndEvents = Object.entries(gridOptions).filter(([k, v]: [any, any]) => {
        const isCallback = v.type.arguments && !v.meta?.isEvent;
        // Some callbacks use call signature interfaces and so do not have arguments like you might expect.
        const isCallSigInterface = interfaces[v.type?.returnType]?.meta?.isCallSignature;
        const isEvent = v.meta?.isEvent && !k.startsWith('on');
        return isCallback || isCallSigInterface || isEvent;
    }).map(([k, v]) => k);
    return callbacksAndEvents;;
}

export function vanillaToReactFunctional(bindings: any, componentFilenames: string[]): (importType: ImportType) => string {
    const { properties, data, gridSettings, onGridReady, resizeToFit } = bindings;

    const eventAndCallbackNames = getEventAndCallbackNames();
    const utilMethodNames = bindings.utils.map(getFunctionName);
    const callbackDependencies = Object.keys(bindings.callbackDependencies).reduce((acc, callbackName) => {
        acc[callbackName] = bindings.callbackDependencies[callbackName].filter(dependency => !utilMethodNames.includes(dependency))
            .filter(dependency => dependency !== 'gridOptions')
            .filter(dependency => !global[dependency]) // exclude things like Number, isNaN etc
        return acc;
    }, {})

    return importType => {
        // instance values
        const stateProperties = [
            `const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);`,
            `const gridStyle = useMemo(() => ({height: '${gridSettings.height}', width: '${gridSettings.width}'}), []);`,
            `const [rowData, setRowData] = useState();`
        ];

        const imports = getImports(bindings, componentFilenames, importType);

        // for when binding a method
        // see javascript-grid-keyboard-navigation for an example
        // tabToNextCell needs to be bound to the react component
        // rarely used (one example only - can be improved and this be removed)
        const instanceBindings = [];

        const componentProps = ['rowData={rowData}'];

        const additionalInReady = [];
        if (data) {
            const setRowDataBlock = data.callback.replace('params.api.setRowData', 'setRowData');

            additionalInReady.push(`
                fetch(${data.url})
                .then(resp => resp.json())
                .then(data => ${setRowDataBlock});`
            );
        }

        if (onGridReady) {
            const hackedHandler = onGridReady.replace(/^{|}$/g, '')
                .replace('params.api.setRowData', 'setRowData');
            additionalInReady.push(hackedHandler);
        }

        if (resizeToFit) {
            additionalInReady.push('gridRef.current.api.sizeColumnsToFit();');
        }

        const components: { [componentName: string]: string } = extractComponentInformation(properties, componentFilenames);

        const containsQuotes = (data: string) => {
            const withoutBoundaryQuotes = data.replace(/^"|"$/g, '');
            return withoutBoundaryQuotes.includes('"') || withoutBoundaryQuotes.includes("'");
        };
        const stripQuotes = (data: string) => data.replace(/"/g, '').replace(/'/g, '');
        const componentNameExists = (componentName: string) => Object.keys(components).includes(stripQuotes(componentName));

        properties.filter(property => property.name !== 'onGridReady').forEach(property => {
            if (property.name === 'rowData') {
                if (property.value !== "null" && property.value !== null) {
                    const rowDataIndex = stateProperties.indexOf('const [rowData, setRowData] = useState();');
                    stateProperties[rowDataIndex] = `const [rowData, setRowData] = useState(${property.value});`
                }
            } else if (property.value === 'true' || property.value === 'false') {
                componentProps.push(`${property.name}={${property.value}}`);
            } else if (property.value === null) {
                componentProps.push(`${property.name}={${property.name}}`);
            } else {
                // for when binding a method
                // see javascript-grid-keyboard-navigation for an example
                // tabToNextCell needs to be bound to the react component
                if (isInstanceMethod(bindings.instanceMethods, property)) {
                    instanceBindings.push(`${property.name}=${property.value}`);
                } else {
                    if (property.name === 'columnDefs') {
                        stateProperties.push(`const [${property.name}, setColumnDefs] = useState(${property.value});`);
                        componentProps.push(`${property.name}={${property.name}}`);
                    } else {
                        // for values like booleans or strings just inline the prop - no need for a separate variable for it
                        const valueType = getValueType(property.value);
                        if (valueType === 'string') {
                            if (componentNameExists(property.value)) {
                                componentProps.push(`${property.name}={${components[stripQuotes(property.value)]}}`);
                            } else {
                                if (containsQuotes(property.value)) {
                                    componentProps.push(`${property.name}={${property.value}}`);
                                } else {
                                    componentProps.push(`${property.name}=${property.value}`);
                                }
                            }
                        } else if (valueType === 'boolean' || valueType === 'number') {
                            componentProps.push(`${property.name}={${property.value}}`);
                        } else {
                            if (eventAndCallbackNames.includes(property.name)) {
                                stateProperties.push(`const ${property.name} = useCallback(${property.value}, [${callbackDependencies[property.name] || ''}]);`);
                            } else {
                                stateProperties.push(`const ${property.name} = useMemo(() => { return ${property.value} }, []);`);
                            }
                            componentProps.push(`${property.name}={${property.name}}`);
                        }
                    }
                }
            }
        });

        const componentEventAttributes = bindings.eventHandlers.map(event => `${event.handlerName}={${event.handlerName}}`);
        if (additionalInReady.length > 0) {
            componentProps.push('onGridReady={onGridReady}');
        }
        componentProps.push.apply(componentProps, componentEventAttributes);


        // convert this.xxx to just xxx
        // no real need for "this" in hooks
        const thisReferenceConverter = content => content.replace(/this\./g, "");

        const gridInstanceConverter = content => content
            .replace(/params\.api\.setRowData(data)/g, 'setRowData(data)')
            .replace(/params\.api\./g, 'gridRef.current.api.')
            .replace(/params\.columnApi\./g, "gridRef.current.columnApi.")
            .replace(/gridInstance\.api\./g, "gridRef.current.api.")
            .replace(/gridInstance\.columnApi\./g, "gridRef.current.columnApi.")
            .replace(/gridApi\./g, "gridRef.current.api.")
            .replace(/(\s+)columnApi\./g, "$1gridRef.current.columnApi.")
            .replace(/gridApi;/g, "gridRef.current.api;")
            .replace(/columnApi;/g, "gridRef.current.columnApi;")
            .replace(/gridColumnApi\./g, "gridRef.current.columnApi.")
            .replace("gridRef.current.api.setRowData", "setRowData")
            .replace("gridApi", "gridRef.current.api")

        const template = getTemplate(bindings, componentProps.map(thisReferenceConverter));
        const eventHandlers = bindings.eventHandlers.map(event => convertFunctionToConstCallback(event.handler, callbackDependencies)).map(thisReferenceConverter).map(gridInstanceConverter);
        const externalEventHandlers = bindings.externalEventHandlers.map(handler => convertFunctionToConstCallback(handler.body, callbackDependencies)).map(thisReferenceConverter).map(gridInstanceConverter);
        const instanceMethods = bindings.instanceMethods.map(instance => convertFunctionToConstCallback(instance, callbackDependencies)).map(thisReferenceConverter).map(gridInstanceConverter);
        const containerStyle = gridSettings.noStyle ? '' : `style={containerStyle}`;

        const gridReady = additionalInReady.length > 0 ? `
            const onGridReady = useCallback((params) => {
                ${additionalInReady.join('\n')}
            }, []);` : '';


        let generatedOutput = `
'use strict';

${imports.join('\n')}

${bindings.utils.map(convertFunctionToConstProperty).join('\n\n')}

${bindings.classes.join('\n')}

const GridExample = () => {
    const gridRef = useRef();
    ${stateProperties.join('\n    ')}

${gridReady}

${[].concat(eventHandlers, externalEventHandlers, instanceMethods).join('\n\n   ')}


    return  (
            <div ${containerStyle}>
                ${template}
            </div>
        );

}

render(<GridExample></GridExample>, document.querySelector('#root'))
`;

        for (const [componentName, component] of Object.entries(components)) {
            let regex = new RegExp(`'${componentName}'`, "g");
            generatedOutput = generatedOutput.replace(regex, component);
            regex = new RegExp(`"${componentName}"`, "g");
            generatedOutput = generatedOutput.replace(regex, component);
        }

        if ((generatedOutput.match(/gridRef\.current/g) || []).length === 0) {
            generatedOutput = generatedOutput.replace("const gridRef = useRef();", "")
            generatedOutput = generatedOutput.replace("ref={gridRef}", "")
        }
        if (generatedOutput.includes("const [rowData, setRowData] = useState();") && (generatedOutput.match(/setRowData/g) || []).length === 1) {
            generatedOutput = generatedOutput.replace("const [rowData, setRowData] = useState();", "")
            generatedOutput = generatedOutput.replace("rowData={rowData}", "")
        }

        return generatedOutput;
    };
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToReactFunctional = vanillaToReactFunctional;
}
