import { convertFunctionToConstProperty, ImportType, isInstanceMethod, modulesProcessor } from './parser-utils';
import { convertFunctionalTemplate, getImport } from './react-utils';
import { templatePlaceholder } from "./grid-vanilla-src-parser";
import * as JSON5 from "json5";

function getModuleImports(bindings: any, componentFilenames: string[]): string[] {
    const { gridSettings } = bindings;
    const { modules } = gridSettings;

    const imports = [
        "import React, { useState } from 'react';",
        "import { render } from 'react-dom';",
        "import { AgGridReact, AgGridColumn } from '@ag-grid-community/react';"
    ];

    if (modules) {
        let exampleModules = modules;

        if (modules === true) {
            exampleModules = ['clientside'];
        }

        const { moduleImports, suppliedModules } = modulesProcessor(exampleModules);

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
    const { gridSettings } = bindings;

    const imports = [
        "import React, { useState } from 'react';",
        "import { render } from 'react-dom';",
        "import { AgGridReact, AgGridColumn } from 'ag-grid-react';"
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
    const { gridSettings } = bindings;
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

    const template = bindings.template ? bindings.template.replace(templatePlaceholder, agGridTag.replace('$', '$$$$')) : agGridTag;

    return convertFunctionalTemplate(template);
}

function convertColumnDefs(rawColumnDefs): string[] {
    const columnDefs = [];
    const parseFunction = value => value.replace('AG_FUNCTION_', '').replace(/^function\s*\((.*?)\)/, '($1) => ');

    const processObject = obj => {
        const output = JSON.stringify(obj);

        return output
            .replace(/"AG_LITERAL_(.*?)"/g, '$1')
            .replace(/"AG_FUNCTION_(.*?)"/g, match => parseFunction(JSON.parse(match)));
    };

    rawColumnDefs.forEach(rawColumnDef => {
        const columnProperties = [];
        let children = [];

        Object.keys(rawColumnDef).forEach(columnProperty => {
            if (columnProperty === 'children') {
                children = convertColumnDefs(rawColumnDef[columnProperty]);
            } else {
                let value = rawColumnDef[columnProperty];

                if (typeof value === "string") {
                    if (value.startsWith('AG_LITERAL_')) {
                        // values starting with AG_LITERAL_ are actually function references
                        // grid-vanilla-src-parser converts the original values to a string that we can convert back to the function reference here
                        // ...all of this is necessary so that we can parse the json string
                        columnProperties.push(`${columnProperty}={${value.replace('AG_LITERAL_', '')}}`);
                    } else if (value.startsWith('AG_FUNCTION_')) {
                        // values starting with AG_FUNCTION_ are actually function definitions, which we extract and
                        // turn into lambda functions here
                        columnProperties.push(`${columnProperty}={${parseFunction(value)}}`);
                    } else {
                        // ensure any double quotes inside the string are replaced with single quotes
                        columnProperties.push(`${columnProperty}="${value.replace(/(?<!\\)"/g, '\'')}"`);
                    }
                } else if (typeof value === 'object') {
                    columnProperties.push(`${columnProperty}={${processObject(value)}}`);
                } else {
                    columnProperties.push(`${columnProperty}={${value}}`);
                }
            }
        });

        if (children.length === 0) {
            columnDefs.push(`<AgGridColumn ${columnProperties.join(' ')} />`);
        } else {
            columnDefs.push(`<AgGridColumn ${columnProperties.join(' ')}>${children.join('\n')}</AgGridColumn>`);
        }
    });

    return columnDefs;
}

export function vanillaToReactFunctional(bindings: any, componentFilenames: string[]): (importType: ImportType) => string {
    const { properties, data, gridSettings, onGridReady, resizeToFit } = bindings;

    return importType => {
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

        const columnDefs = bindings.parsedColDefs ? convertColumnDefs(JSON5.parse(bindings.parsedColDefs)) : [];

        properties.filter(property => property.name !== 'onGridReady').forEach(property => {
            if (componentFilenames.length > 0 && property.name === 'components') {
                property.name = 'frameworkComponents';
            }

            if (property.value === 'true' || property.value === 'false') {
                componentAttributes.push(`${property.name}={${property.value}}`);
            } else if (property.value === null || property.value === 'null') {
                componentAttributes.push(`${property.name}={${property.name}}`);
            } else {
                // for when binding a method
                // see javascript-grid-keyboard-navigation for an example
                // tabToNextCell needs to be bound to the react component
                if (isInstanceMethod(bindings.instanceMethods, property)) {
                    instanceBindings.push(`${property.name}=${property.value}`);
                } else if (property.name !== 'columnDefs' || columnDefs.length === 0) {
                    componentAttributes.push(`${property.name}={${property.value}}`);
                }
            }
        });

        const componentEventAttributes = bindings.eventHandlers.map(event => `${event.handlerName}={${event.handlerName}}`);

        componentAttributes.push('onGridReady={onGridReady}');
        componentAttributes.push.apply(componentAttributes, componentEventAttributes);

        const additionalInReady = [];

        if (data) {
            let setRowDataBlock = data.callback;

            if (data.callback.indexOf('api.setRowData') >= 0) {
                if (stateProperties.filter(item => item.indexOf('rowData') >= 0).length === 0) {
                    stateProperties.push('const [rowData, setRowData] = useState(null);');
                }

                if (componentAttributes.filter(item => item.indexOf('rowData') >= 0).length === 0) {
                    componentAttributes.push('rowData={rowData}');
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

        // convert this.xxx to just xxx
        // no real need for  "this" in hooks
        const thisReferenceConverter = content => content.replace(/this\./g, "");

        const gridInstanceConverter = content => content.replace(/gridInstance\.api/g, "gridApi").replace(/gridInstance\.columnApi/g, "gridColumnApi");

        const template = getTemplate(bindings, componentAttributes.map(thisReferenceConverter), columnDefs);
        const eventHandlers = bindings.eventHandlers.map(event => convertFunctionToConstProperty(event.handler)).map(thisReferenceConverter).map(gridInstanceConverter);
        const externalEventHandlers = bindings.externalEventHandlers.map(handler => convertFunctionToConstProperty(handler.body)).map(thisReferenceConverter).map(gridInstanceConverter);
        const instanceMethods = bindings.instanceMethods.map(convertFunctionToConstProperty).map(thisReferenceConverter).map(gridInstanceConverter);
        const style = gridSettings.noStyle ? '' : `style={{ width: '100%', height: '100%' }}`;


        return `
'use strict'

${imports.join('\n')}

const GridExample = () => {
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    ${stateProperties.join(',\n    ')}

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);

        ${additionalInReady.join('\n')}
    }

${[].concat(eventHandlers, externalEventHandlers, instanceMethods).join('\n\n   ')}

    return  (
            <div ${style}>
                ${template}
            </div>
        );

}

${bindings.utils.map(gridInstanceConverter).join('\n')}

render(<GridExample></GridExample>, document.querySelector('#root'))
`;
    };
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToReactFunctional = vanillaToReactFunctional;
}
