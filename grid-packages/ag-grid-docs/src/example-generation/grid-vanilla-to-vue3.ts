import {getFunctionName, ImportType, isInstanceMethod, modulesProcessor, removeFunctionKeyword} from './parser-utils';
import {convertTemplate, getImport, toAssignment, toConst, toInput, toMember, toOutput} from './vue-utils';
import {templatePlaceholder} from "./grid-vanilla-src-parser";
import * as JSON5 from "json5";

const GRID_WIDE_COMPONENTS = ['dateComponent', 'loadingCellRenderer', 'loadingOverlayComponent', 'noRowsOverlayComponent'];

const GRID_COMPONENTS = [
    'detailCellRendererFramework',
    'fullWidthCellRenderer',
    'groupRowRenderer',
    'groupRowInnerRenderer',
    'loadingCellRenderer',
    'loadingOverlayComponent',
    'noRowsOverlayComponent',
    'dateComponent',
    'statusPanel',
    'cellRenderer',
    'pinnedRowCellRenderer',
    'cellEditor',
    'filter',
    'floatingFilterComponent',
    'headerComponent',
    'headerGroupComponent',
    'tooltipComponent'
];

const PARAMS_PROPERTIES = [
    'cellEditorParams', 'filterParams'
]

const OVERRIDABLE_AG_COMPONENTS = ['agDateInput',
    'agColumnHeader',
    'agColumnGroupHeader',
    'agLoadingCellRenderer',
    'agLoadingOverlay',
    'agNoRowsOverlay',
    'agTextCellEditor',
    'agDetailCellRenderer',
];

function getOnGridReadyCode(bindings: any): string {
    const {onGridReady, resizeToFit, data} = bindings;
    const additionalLines = [];

    if (onGridReady) {
        additionalLines.push(onGridReady.trim().replace(/^\{|\}$/g, ''));
    }

    if (resizeToFit) {
        additionalLines.push('params.api.sizeColumnsToFit();');
    }

    if (data) {
        const {url, callback} = data;

        const setRowDataBlock = callback.indexOf('api.setRowData') >= 0 ?
            callback.replace("params.api.setRowData(data);", "this.rowData = data;") :
            callback;

        additionalLines.push(`
            const updateData = (data) => ${setRowDataBlock};
            
            fetch(${url})
                .then(resp => resp.json())
                .then(data => updateData(data));`
        );
    }

    return `onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        ${additionalLines.length > 0 ? `\n\n        ${additionalLines.join('\n        ')}` : ''}
    }`;
}

function getModuleImports(bindings: any, componentFileNames: string[]): string[] {
    const {gridSettings} = bindings;
    const {modules} = gridSettings;

    const imports = [
        "import { createApp } from 'vue';",
        "import { AgGridVue } from '@ag-grid-community/vue3';",
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
        if (gridSettings.enterprise) {
            imports.push("import { AllModules } from '@ag-grid-enterprise/all-modules';");
            bindings.gridSuppliedModules = 'AllModules';
        } else {
            imports.push("import { AllCommunityModules } from '@ag-grid-community/all-modules';");
            bindings.gridSuppliedModules = 'AllCommunityModules';
        }

        imports.push("import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';");

        // to account for the (rare) example that has more than one class...just default to alpine if it does
        const theme = gridSettings.theme || 'ag-theme-alpine';
        imports.push(`import '@ag-grid-community/all-modules/dist/styles/${theme}.css';`);
    }

    if (componentFileNames) {
        imports.push(...componentFileNames.map(componentFileName => getImport(componentFileName, 'Vue', '')));
    }

    return imports;
}

function getPackageImports(bindings: any, componentFileNames: string[]): string[] {
    const {gridSettings} = bindings;

    const imports = [
        "import { createApp } from 'vue';",
        "import { AgGridVue } from 'ag-grid-vue3';",
    ];

    if (gridSettings.enterprise) {
        imports.push("import 'ag-grid-enterprise';");
    }

    imports.push("import 'ag-grid-community/dist/styles/ag-grid.css';");

    // to account for the (rare) example that has more than one class...just default to alpine if it does
    const theme = gridSettings.theme || 'ag-theme-alpine';
    imports.push(`import 'ag-grid-community/dist/styles/${theme}.css';`);

    if (componentFileNames) {
        imports.push(...componentFileNames.map(componentFileName => getImport(componentFileName, 'Vue', '')));
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

function getPropertyBindings(bindings: any, componentFileNames: string[], importType: ImportType): [string[], string[], string[], string[]] {
    const propertyAssignments = [];
    const propertyVars = [];
    const propertyAttributes = [];

    bindings.properties
        .filter(
            property => property.name !== 'onGridReady' &&
                property.name !== 'columnDefs'
        )
        .forEach(property => {
                if (property.name === 'sideBar') {
                    const jsonSidBar = JSON5.parse(property.value);
                    if (jsonSidBar.toolPanels) {
                        jsonSidBar.toolPanels.forEach(panel => {
                            if (typeof panel.toolPanel === 'string' && bindings.components.some(component => component.name === panel.toolPanel)) {
                                panel['toolPanelFramework'] = panel.toolPanel;
                                delete panel['toolPanel']
                            }
                        });
                        property.value = JSON.stringify(jsonSidBar);
                    }

                    propertyAttributes.push(toInput(property));
                    propertyVars.push(toMember(property));
                    propertyAssignments.push(toAssignment(property));
                } else if (property.name === 'statusBar') {
                    const jsonStatusBar = JSON5.parse(property.value);
                    if (jsonStatusBar.statusPanels) {
                        jsonStatusBar.statusPanels.forEach(panel => {
                            if (typeof panel.statusPanel === 'string' && bindings.components.some(component => component.name === panel.statusPanel)) {
                                panel['statusPanelFramework'] = panel.statusPanel;
                                delete panel['statusPanel']
                            }
                        });
                        property.value = JSON.stringify(jsonStatusBar);
                    }

                    propertyAttributes.push(toInput(property));
                    propertyVars.push(toMember(property));
                    propertyAssignments.push(toAssignment(property));
                } else if (componentFileNames.length > 0 && property.name === 'components') {
                    // we use bindings.components for vue examples (and not frameworkComponents), except for agDateInput, agColumnHeader etc, which we still need
                    // frameworkComponents for
                    if (bindings.components) {
                        const userAgComponents = OVERRIDABLE_AG_COMPONENTS.filter(agComponentName => bindings.components.some(component => component.name === agComponentName))
                            .map(agComponentName => `${agComponentName}: '${agComponentName}'`);

                        if (userAgComponents.length > 0) {
                            propertyAttributes.push(':frameworkComponents="frameworkComponents"');
                            propertyAssignments.push(`this.frameworkComponents = { ${userAgComponents.join('\n,')} } `)
                        }
                    }
                } else if (property.value === 'true' || property.value === 'false') {
                    propertyAttributes.push(toConst(property));
                } else if (property.value === null || property.value === 'null') {
                    propertyAttributes.push(toInput(property));
                } else if (GRID_WIDE_COMPONENTS.indexOf(property.name) !== -1) {
                    propertyAttributes.push(`:${property.name}Framework="${property.name}Framework"`);
                    propertyVars.push(`${property.name}Framework: ${property.value}`);
                } else {
                    // for when binding a method
                    // see javascript-grid-keyboard-navigation for an example
                    // tabToNextCell needs to be bound to the react component
                    if (!isInstanceMethod(bindings.instanceMethods, property)) {
                        propertyAttributes.push(toInput(property));

                        if (property.name !== 'defaultColDef') {
                            propertyVars.push(toMember(property));
                        }
                    }

                    if (property.name !== 'defaultColDef') {
                        propertyAssignments.push(toAssignment(property));
                    }
                }
            }
        );

    if (importType === 'modules') {
        propertyAttributes.push(':modules="modules"');
        propertyVars.push(`modules: ${bindings.gridSuppliedModules}`);
    }

    if (bindings.data && bindings.data.callback.indexOf('api.setRowData') >= 0) {
        if (propertyAttributes.filter(item => item.indexOf(':rowData') >= 0).length === 0) {
            propertyAttributes.push(':rowData="rowData"');
        }

        if (propertyVars.filter(item => item.indexOf('rowData') >= 0).length === 0) {
            propertyVars.push('rowData: null');
        }
    }

    const vueComponents = bindings.components.map(component => `${component.name}:${component.value}`);

    return [propertyAssignments, propertyVars, propertyAttributes, vueComponents];
}

function getTemplate(bindings: any, attributes: string[]): string {
    const {gridSettings} = bindings;
    const style = gridSettings.noStyle ? '' : `style="width: ${gridSettings.width}; height: ${gridSettings.height};"`;

    const agGridTag = `<ag-grid-vue
    ${style}
    class="${gridSettings.theme}"
    id="myGrid"
    :columnDefs="columnDefs"
    @grid-ready="onGridReady"
    ${attributes.join('\n    ')}></ag-grid-vue>`;

    const template = bindings.template ? bindings.template.replace(templatePlaceholder, agGridTag) : agGridTag;

    return convertTemplate(template);
}

function getAllMethods(bindings: any): [string[], string[], string[], string[]] {
    const eventHandlers = bindings.eventHandlers
        .filter(event => event.name != 'onGridReady')
        .map(event => event.handler)
        .map(removeFunctionKeyword);

    const externalEventHandlers = bindings.externalEventHandlers.map(event => event.body).map(removeFunctionKeyword);
    const instanceMethods = bindings.instanceMethods.map(removeFunctionKeyword);

    const utilFunctions = bindings.utils.map(body => {
        const funcName = getFunctionName(body);

        if (funcName) {
            return `window.${funcName} = ${body}`;

        }

        // probably a var
        return body;
    }).sort((a, b) => {
        const aIsAssignedToWindow = a.startsWith('window.');
        const bIsAssignedToWindow = b.startsWith('window.');

        if (aIsAssignedToWindow && bIsAssignedToWindow) {
            return 0;
        }
        if (aIsAssignedToWindow) {
            return -1;
        }
        if (bIsAssignedToWindow) {
            return 1;
        }

        return 0;
    });

    return [eventHandlers, externalEventHandlers, instanceMethods, utilFunctions];
}

function isComponent(property) {
    return GRID_COMPONENTS.indexOf(property) !== -1;
}

function isParamsProperty(property) {
    return PARAMS_PROPERTIES.indexOf(property) !== -1;

}

function convertColumnDefs(rawColumnDefs, userComponentNames): string[] {
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
                children = convertColumnDefs(rawColumnDef[columnProperty], userComponentNames);
            } else {
                let value = rawColumnDef[columnProperty];

                if (isParamsProperty(columnProperty) && value.cellRenderer) {
                    Object.defineProperty(value, 'cellRendererFramework', Object.getOwnPropertyDescriptor(value, 'cellRenderer'));
                    delete value['cellRenderer'];
                }

                if (typeof value === "string") {
                    if (value.startsWith('AG_LITERAL_')) {
                        // values starting with AG_LITERAL_ are actually function references
                        // grid-vanilla-src-parser converts the original values to a string that we can convert back to the function reference here
                        // ...all of this is necessary so that we can parse the json string
                        columnProperties.push(`${columnProperty}:${value.replace('AG_LITERAL_', '')}`);
                    } else if (value.startsWith('AG_FUNCTION_')) {
                        // values starting with AG_FUNCTION_ are actually function definitions, which we extract and
                        // turn into lambda functions here
                        columnProperties.push(`${columnProperty}:${parseFunction(value)}`);
                    } else {
                        let propertyName = columnProperty;
                        // if a framework component then add a "Framework" postfix - ie cellRenderer => cellRendererFramework
                        if (isComponent(columnProperty) && userComponentNames.indexOf(value) !== -1) {
                            propertyName = `${columnProperty}Framework`;
                        }
                        // ensure any double quotes inside the string are replaced with single quotes
                        columnProperties.push(`${propertyName}:"${value.replace(/(?<!\\)"/g, '\'')}"`);
                    }
                } else if (typeof value === 'object') {
                    columnProperties.push(`${columnProperty}:${processObject(value)}`);
                } else {
                    columnProperties.push(`${columnProperty}:${value}`);
                }
            }
        });

        if (children.length !== 0) {
            columnProperties.push(`children: [${children.join(',\n')}]`);
        }
        columnDefs.push(`{${columnProperties.join(',\n')}}`);
    });

    return columnDefs;
}

function convertDefaultColDef(defaultColDef): string {
    return GRID_COMPONENTS.reduce((acc, componentName) => {
        if (componentName === 'filter') {
            if (defaultColDef.indexOf('filter: true') === -1 && defaultColDef.indexOf('filter: \'ag\'') === -1) {
                return acc.replace(/componentName\b/g, `${componentName}Framework`);
            }
        }

        return acc;
    }, defaultColDef)
}

const getColumnDefs = (bindings: any, utilFunctions: any[]) => {
    const columnDefs = bindings.parsedColDefs ? convertColumnDefs(JSON5.parse(bindings.parsedColDefs), bindings.components.map(component => component.name)) : null;
    if (!columnDefs) {
        const columnDefProperty = bindings.properties.filter(property => property.name === 'columnDefs');
        if (columnDefProperty && columnDefProperty.length === 1) {
            if (columnDefProperty && columnDefProperty.length === 1 && columnDefProperty[0].value) {
                return columnDefProperty[0].value;
            }
        }

        return [];
    }

    return `[${columnDefs}]`;
}

export function vanillaToVue3(bindings: any, componentFileNames: string[]): (importType: ImportType) => string {
    const onGridReady = getOnGridReadyCode(bindings);
    const eventAttributes = bindings.eventHandlers.filter(event => event.name !== 'onGridReady').map(toOutput);
    const [eventHandlers, externalEventHandlers, instanceMethods, utilFunctions] = getAllMethods(bindings);
    const columnDefs = getColumnDefs(bindings, utilFunctions);
    const defaultColDef = bindings.defaultColDef ? convertDefaultColDef(bindings.defaultColDef) : null;

    return importType => {
        const imports = getImports(bindings, componentFileNames, importType);
        const [propertyAssignments, propertyVars, propertyAttributes, vueComponents] = getPropertyBindings(bindings, componentFileNames, importType);
        const template = getTemplate(bindings, propertyAttributes.concat(eventAttributes));

        return `
${imports.join('\n')}

const VueExample = {
    template: \`
        <div style="height: 100%">
            ${template}
        </div>
    \`,
    components: {
        'ag-grid-vue': AgGridVue,
        ${vueComponents.join(',\n')}
    },
    data: function() {
        return {
            columnDefs: ${columnDefs},
            gridApi: null,
            columnApi: null,
            ${defaultColDef ? `defaultColDef: ${defaultColDef},` : ''}
            ${propertyVars.join(',\n')}
        }
    },
    created() {
        ${propertyAssignments.join(';\n')}
    },
    methods: {
        ${eventHandlers
            .concat(externalEventHandlers)
            .concat(onGridReady)
            .concat(instanceMethods)
            .map(snippet => `${snippet.trim()},`)
            .join('\n')}
    }
}

${utilFunctions.map(snippet => `${snippet.trim()}`).join('\n\n')}

createApp(VueExample)
    .mount("#app")

`;
    };
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToVue3 = vanillaToVue3;
}
