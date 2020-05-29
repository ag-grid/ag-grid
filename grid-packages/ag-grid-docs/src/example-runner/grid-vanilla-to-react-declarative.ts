import {convertFunctionToProperty, ImportType, isInstanceMethod, modulesProcessor} from './parser-utils';
import {convertTemplate, getImport} from './react-utils';
import {templatePlaceholder} from "./grid-vanilla-src-parser";

function getModuleImports(bindings: any, componentFilenames: string[]): string[] {
    const {gridSettings} = bindings;
    const {modules} = gridSettings;

    const imports = [
        "import React, { Component } from 'react';",
        "import { render } from 'react-dom';",
        "import { AgGridReact, AgGridColumn } from '@ag-grid-community/react';"
    ];

    if (modules) {
        let exampleModules = modules;
        if (modules === true) {
            exampleModules = ['clientside'];
        }
        const {moduleImports, suppliedModules} = modulesProcessor(exampleModules);

        imports.push(...moduleImports);
        bindings.gridSuppliedModules = `[${suppliedModules.join(', ')}]`;

        imports.push("import '@ag-grid-community/core/dist/styles/ag-grid.css';");

        // to account for the (rare) example that has more than one class...just default to alpine if it does
        const theme = gridSettings.theme || 'ag-theme-alpine';
        imports.push(`import "@ag-grid-community/core/dist/styles/${theme}.css";`);
    } else {
        if (bindings.gridSettings.enterprise) {
            imports.push("import { AllModules } from '@ag-grid-enterprise/all-modules';");
            bindings.gridSuppliedModules = 'AllModules';
        } else {
            imports.push("import { AllCommunityModules } from '@ag-grid-community/all-modules';");
            bindings.gridSuppliedModules = 'AllCommunityModules';
        }

        imports.push("import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';");

        // to account for the (rare) example that has more than one class...just default to alpine if it does
        const theme = bindings.gridSettings.theme || 'ag-theme-alpine';
        imports.push(`import '@ag-grid-community/all-modules/dist/styles/${theme}.css';`);
    }

    if (componentFilenames) {
        imports.push(...componentFilenames.map(getImport));
    }

    return imports;
}

function getPackageImports(bindings: any, componentFilenames: string[]): string[] {
    const {gridSettings} = bindings;

    const imports = [
        "import React, { Component } from 'react';",
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

function getTemplate(bindings: any, componentAttributes: string[], columnDefs: string[]): string {
    const {gridSettings} = bindings;
    const agGridTag = `<div
                id="myGrid"
                style={{
                    height: '${gridSettings.height}',
                    width: '${gridSettings.width}'}}
                    className="${gridSettings.theme}">
            <AgGridReact
                ${componentAttributes.join('\n')}
            >
                ${columnDefs.join("")}
            </AgGridReact>
            </div>`;

    const template = bindings.template ? bindings.template.replace(templatePlaceholder, agGridTag) : agGridTag;

    return convertTemplate(template);
}

function convertColumnDefs(rawColumnDefs) {
    const columnDefs = [];

    rawColumnDefs.forEach(rawColumnDef => {
        const columnProperties = [];
        Object.keys(rawColumnDef).forEach(columnProperty => {
            let value = rawColumnDef[columnProperty];
            if (typeof value === "string") {
                columnProperties.push(
                    `${columnProperty}="${value}"`
                )
            } else {
                columnProperties.push(
                    `${columnProperty}={${value}}`
                )
            }
        })

        columnDefs.push(`<AgGridColumn ${columnProperties.join(' ')}></AgGridColumn>`)
    })

    return columnDefs;
}

export function vanillaToReactDeclarative(bindings: any, componentFilenames: string[], importType: ImportType): string {
    const {properties, data, gridSettings, onGridReady, resizeToFit} = bindings;
    const imports = getImports(bindings, componentFilenames, importType);

    // for when binding a method
    // see javascript-grid-keyboard-navigation for an example
    // tabToNextCell needs to be bound to the react component
    // rarely used (one example only - can be improved and this be removed)
    const instanceBindings = [];

    // this.state values
    const stateProperties = [];

    // ie 'modules={this.state.modules}',
    const componentAttributes = [];

    if (importType === 'modules') {
        componentAttributes.push(`modules={${bindings.gridSuppliedModules}}`);
    }

    let rawColumnDefs = [];
    properties.filter(property => property.name !== 'onGridReady').forEach(property => {
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
            if (isInstanceMethod(bindings.instanceMethods, property)) {
                instanceBindings.push(`this.${property.name}=${property.value}`);
            } else {
                if (property.name === 'columnDefs') {
                    rawColumnDefs = JSON.parse(property.value);
                } else {
                    componentAttributes.push(`${property.name}={${property.value}}`);
                }
            }
        }
    });

    const columnDefs = convertColumnDefs(rawColumnDefs);

    const componentEventAttributes = bindings.eventHandlers.map(event => `${event.handlerName}={this.${event.handlerName}.bind(this)}`);

    componentAttributes.push('onGridReady={this.onGridReady}');
    componentAttributes.push.apply(componentAttributes, componentEventAttributes);

    const additionalInReady = [];

    if (data) {
        let setRowDataBlock = data.callback;

        if (data.callback.indexOf('api.setRowData') >= 0) {
            if (stateProperties.filter(item => item.indexOf('rowData') >= 0).length === 0) {
                stateProperties.push('rowData: []');
            }

            if (componentAttributes.filter(item => item.indexOf('rowData') >= 0).length === 0) {
                componentAttributes.push('rowData={this.state.rowData}');
            }

            setRowDataBlock = data.callback.replace('params.api.setRowData(data);', 'this.setState({ rowData: data });');
        }

        additionalInReady.push(`
            const httpRequest = new XMLHttpRequest();
            const updateData = (data) => ${setRowDataBlock};

            httpRequest.open('GET', ${data.url});
            httpRequest.send();
            httpRequest.onreadystatechange = () => {
                if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                    updateData(JSON.parse(httpRequest.responseText));
                }
            };`);
    }

    if (onGridReady) {
        const hackedHandler = onGridReady.replace(/^\{|\}$/g, '');
        additionalInReady.push(hackedHandler);
    }

    if (resizeToFit) {
        additionalInReady.push('params.api.sizeColumnsToFit();');
    }

    const template = getTemplate(bindings, componentAttributes, columnDefs);
    const eventHandlers = bindings.eventHandlers.map(event => convertFunctionToProperty(event.handler));
    const externalEventHandlers = bindings.externalEventHandlers.map(handler => convertFunctionToProperty(handler.body));
    const instanceMethods = bindings.instanceMethods.map(convertFunctionToProperty);
    const style = gridSettings.noStyle ? '' : `style={{ width: '100%', height: '100%' }}`;

    return `
'use strict'

${imports.join('\n')}

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ${stateProperties.join(',\n    ')}
        };

        ${instanceBindings.join(';\n    ')}
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        ${additionalInReady.join('\n')}
    }

${[].concat(eventHandlers, externalEventHandlers, instanceMethods).join('\n\n   ')}

    render() {
        return (
            <div ${style}>
                ${template}
            </div>
        );
    }
}

${bindings.utils.join('\n')}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
`;
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToReactDeclarative = vanillaToReactDeclarative;
}
