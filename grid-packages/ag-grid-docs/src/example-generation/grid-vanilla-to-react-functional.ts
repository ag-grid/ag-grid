import { convertFunctionToConstProperty, getFunctionName, ImportType, isInstanceMethod, modulesProcessor } from './parser-utils';
import { convertFunctionalTemplate, convertFunctionToConstCallback, getImport, getValueType } from './react-utils';
import { templatePlaceholder } from "./grid-vanilla-src-parser";

function getModuleImports(bindings: any, componentFilenames: string[], stateProperties: string[]): string[] {
    const { gridSettings } = bindings;
    const { modules } = gridSettings;

    const imports = [
        "import React, { useCallback, useMemo, useRef, useState } from 'react';",
        "import { render } from 'react-dom';",
        "import { AgGridReact } from '@ag-grid-community/react';"
    ];

    if (modules) {
        let exampleModules = modules;

        if (modules === true) {
            exampleModules = ['clientside'];
        }

        const { moduleImports, suppliedModules } = modulesProcessor(exampleModules);

        imports.push(...moduleImports);
        bindings.gridSuppliedModules = `modules`;
        stateProperties.push(`const modules = useMemo(() => [${suppliedModules.join(', ')}], []);`)

        imports.push("import '@ag-grid-community/core/dist/styles/ag-grid.css';");

        // to account for the (rare) example that has more than one class...just default to alpine if it does
        const theme = gridSettings.theme || 'ag-theme-alpine';
        imports.push(`import "@ag-grid-community/core/dist/styles/${theme}.css";`);
    } else {
        if (bindings.gridSettings.enterprise) {
            imports.push("import { AllModules } from '@ag-grid-enterprise/all-modules';");
            bindings.gridSuppliedModules = 'AllModules';
        } else {
            imports.push("import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';");
            bindings.gridSuppliedModules = '[ ClientSideRowModelModule ] ';
        }

        imports.push("import '@ag-grid-community/core/dist/styles/ag-grid.css';");

        // to account for the (rare) example that has more than one class...just default to alpine if it does
        const theme = bindings.gridSettings.theme || 'ag-theme-alpine';
        imports.push(`import '@ag-grid-community/core/dist/styles/${theme}.css';`);
    }

    if (componentFilenames) {
        imports.push(...componentFilenames.map(getImport));
    }

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

function getImports(bindings: any, componentFileNames: string[], importType: ImportType, stateProperties: string[]): string[] {
    if (importType === 'packages') {
        return getPackageImports(bindings, componentFileNames);
    } else {
        return getModuleImports(bindings, componentFileNames, stateProperties);
    }
}

function getTemplate(bindings: any, componentAttributes: string[]): string {
    const { gridSettings } = bindings;
    const agGridTag = `
        <div style={gridStyle} className="${gridSettings.theme}">
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

function getCallbackNames() {
    const callbackJson = require('../../documentation/doc-pages/grid-callbacks/callbacks.json');
    const callbacks = Object.keys(callbackJson).map(topLevel => Object.keys(callbackJson[topLevel]));
    return [].concat.apply([], callbacks).filter(callback => callback !== 'meta')
}

export function vanillaToReactFunctional(bindings: any, componentFilenames: string[]): (importType: ImportType) => string {
    const { properties, data, gridSettings, onGridReady, resizeToFit } = bindings;

    const callbackNames = getCallbackNames();

    const utilMethodNames = bindings.utils.map(getFunctionName);
    const callbackDependencies = Object.keys(bindings.callbackDependencies).reduce((acc, callbackName) => {
        acc[callbackName] = bindings.callbackDependencies[callbackName].filter(dependency => !utilMethodNames.includes(dependency)).map(dependency => dependency === 'gridOptions' ? 'gridRef.current' : dependency);
        return acc;
    }, {})

    return importType => {
        // instance values
        const stateProperties = [
            `const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);`,
            `const gridStyle = useMemo(() => ({height: '${gridSettings.height}', width: '${gridSettings.width}'}), []);`
        ];

        const imports = getImports(bindings, componentFilenames, importType, stateProperties);

        // for when binding a method
        // see javascript-grid-keyboard-navigation for an example
        // tabToNextCell needs to be bound to the react component
        // rarely used (one example only - can be improved and this be removed)
        const instanceBindings = [];

        // ie 'modules={modules}',
        const componentProps = [];

        if (importType === 'modules') {
            componentProps.push(`modules={${bindings.gridSuppliedModules}}`);
        }

        // is the row data loaded asynchronously?
        const needsRowDataState = data && data.callback.indexOf('api.setRowData') >= 0;
        const additionalInReady = [];
        if (data) {
            let setRowDataBlock = data.callback;

            if (needsRowDataState) {
                if (stateProperties.filter(item => item.indexOf('rowData') >= 0).length === 0) {
                    stateProperties.push('const [rowData, setRowData] = useState();');
                }

                if (componentProps.filter(item => item.indexOf('rowData') >= 0).length === 0) {
                    componentProps.push('rowData={rowData}');
                }

                setRowDataBlock = data.callback.replace('params.api.setRowData(data);', 'setRowData(data);');
            }

            additionalInReady.push(`
                const updateData = (data) => ${setRowDataBlock};
                
                fetch(${data.url})
                .then(resp => resp.json())
                .then(data => updateData(data));`
            );
        }

        if (onGridReady) {
            const hackedHandler = onGridReady.replace(/^{|}$/g, '');
            additionalInReady.push(hackedHandler);
        }

        if (resizeToFit) {
            additionalInReady.push('params.api.sizeColumnsToFit();');
        }

        const components: { [componentName: string]: string } = extractComponentInformation(properties, componentFilenames);

        const containsQuotes = (data: string) => {
            const withoutBoundaryQuotes = data.replace(/^"|"$/g, '');
            return withoutBoundaryQuotes.includes('"') || withoutBoundaryQuotes.includes("'");
        };
        const stripQuotes = (data: string) => data.replace(/"/g, '').replace(/'/g, '');
        const componentNameExists = (componentName: string) => Object.keys(components).includes(stripQuotes(componentName));

        properties.filter(property => property.name !== 'onGridReady').forEach(property => {
            if (componentFilenames.length > 0 && property.name === 'components') {
                property.name = 'frameworkComponents';
            }

            if (property.name === 'rowData' && needsRowDataState) {
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
                        } else if (valueType === 'boolean') {
                            componentProps.push(`${property.name}={${property.value}}`);
                        } else {
                            if (callbackNames.includes(property.name)) {
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
            .replace(/gridInstance\.api\./g, "gridRef.current.api.")
            .replace(/gridInstance\.columnApi\./g, "gridRef.current.columnApi.")
            .replace(/gridApi\./g, "gridRef.current.api.")
            .replace(/columnApi\./g, "gridRef.current.columnApi.")
            .replace(/gridApi;/g, "gridRef.current.api;")
            .replace(/columnApi;/g, "gridRef.current.columnApi;")
            .replace(/gridColumnApi\./g, "gridRef.current.columnApi.")

        const template = getTemplate(bindings, componentProps.map(thisReferenceConverter));
        const eventHandlers = bindings.eventHandlers.map(event => convertFunctionToConstProperty(event.handler)).map(thisReferenceConverter).map(gridInstanceConverter);
        const externalEventHandlers = bindings.externalEventHandlers.map(handler => convertFunctionToConstCallback(handler.body, callbackDependencies)).map(thisReferenceConverter).map(gridInstanceConverter);
        const instanceMethods = bindings.instanceMethods.map(instance => convertFunctionToConstCallback(instance, callbackDependencies)).map(thisReferenceConverter).map(gridInstanceConverter);
        const containerStyle = gridSettings.noStyle ? '' : `style={containerStyle}`;

        const gridReady = additionalInReady.length > 0 ? `
            const onGridReady = useCallback((params) => {
                ${additionalInReady.join('\n')}
            }, []);` : '';


        let generatedOutput = `
'use strict'

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

        // SPL Revisit this
        if ((generatedOutput.match(/gridRef\.current/g) || []).length === 0) {
            generatedOutput = generatedOutput.replace("const gridRef = useRef();", "")
            generatedOutput = generatedOutput.replace("ref={gridRef}", "")
        }

        return generatedOutput;
    };
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToReactFunctional = vanillaToReactFunctional;
}
