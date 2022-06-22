import { ImportType, isInstanceMethod, convertFunctionToProperty, getModuleRegistration } from './parser-utils';
import { convertTemplate, getImport } from './react-utils';
import { templatePlaceholder } from "./grid-vanilla-src-parser";

function getModuleImports(bindings: any, componentFilenames: string[]): string[] {
    const { gridSettings } = bindings;

    let imports = [
        "import React, { Component } from 'react';",
        "import { render } from 'react-dom';",
        "import { AgGridReact } from '@ag-grid-community/react';"
    ];

    imports.push("import '@ag-grid-community/styles/ag-grid.css';");
    // to account for the (rare) example that has more than one class...just default to alpine if it does
    const theme = gridSettings.theme || 'ag-theme-alpine';
    imports.push(`import "@ag-grid-community/styles/${theme}.css";`);

    if (componentFilenames) {
        imports.push(...componentFilenames.map(getImport));
    }

    imports = [...imports, ...getModuleRegistration(bindings)];

    return imports;
}

function getPackageImports(bindings: any, componentFilenames: string[]): string[] {
    const { gridSettings } = bindings;

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
    return (importType === 'packages' ? getPackageImports : getModuleImports)(bindings, componentFileNames);
}

function getTemplate(bindings: any, componentAttributes: string[]): string {
    const { gridSettings } = bindings;
    const agGridTag = `<div
                ${gridSettings.myGridReference ? 'id="myGrid"' : ''}
                style={{
                    height: '${gridSettings.height}',
                    width: '${gridSettings.width}'}}
                    className="${gridSettings.theme}">
            <AgGridReact
                ${componentAttributes.join('\n')}
            />
            </div>`;

    const template = bindings.template ? bindings.template.replace(templatePlaceholder, agGridTag) : agGridTag;

    return convertTemplate(template);
}

export function vanillaToReact(bindings: any, componentFilenames: string[]): (importType: ImportType) => string {
    const { properties, data, gridSettings, onGridReady, resizeToFit } = bindings;
    const eventHandlers = bindings.eventHandlers.map(event => convertFunctionToProperty(event.handler));
    const externalEventHandlers = bindings.externalEventHandlers.map(handler => convertFunctionToProperty(handler.body));
    const instanceMethods = bindings.instanceMethods.map(convertFunctionToProperty);
    const componentEventAttributes = bindings.eventHandlers.map(event => `${event.handlerName}={this.${event.handlerName}.bind(this)}`);
    const style = gridSettings.noStyle ? '' : `style={{ width: '100%', height: '100%' }}`;
    const additionalInReady = [];

    if (data) {
        let setRowDataBlock = data.callback;

        if (data.callback.indexOf('api.setRowData') >= 0) {
            setRowDataBlock = data.callback.replace('params.api.setRowData(data);', 'this.setState({ rowData: data });');
        }

        additionalInReady.push(`
        const updateData = (data) => ${setRowDataBlock};
        
        fetch(${data.url})
            .then(resp => resp.json())
            .then(data => updateData(data));`);

    }

    if (onGridReady) {
        const hackedHandler = onGridReady.replace(/^\{|\}$/g, '');
        additionalInReady.push(hackedHandler);
    }

    if (resizeToFit) {
        additionalInReady.push('params.api.sizeColumnsToFit();');
    }

    return importType => {
        const imports = getImports(bindings, componentFilenames, importType);
        const instanceBindings = [];
        const stateProperties = [];
        const componentAttributes = [];

        properties.filter(property => property.name !== 'onGridReady').forEach(property => {
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

        componentAttributes.push('onGridReady={this.onGridReady}');
        componentAttributes.push.apply(componentAttributes, componentEventAttributes);

        if (data && data.callback.indexOf('api.setRowData') >= 0) {
            if (stateProperties.filter(item => item.indexOf('rowData') >= 0).length === 0) {
                stateProperties.push('rowData: null');
            }

            if (componentAttributes.filter(item => item.indexOf('rowData') >= 0).length === 0) {
                componentAttributes.push('rowData={this.state.rowData}');
            }
        }

        const template = getTemplate(bindings, componentAttributes);

        return `
'use strict';

${imports.join('\n')}${bindings.classes.length > 0 ? `\n\n${bindings.classes.join('\n')}` : ''}

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
    };
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToReact = vanillaToReact;
}
