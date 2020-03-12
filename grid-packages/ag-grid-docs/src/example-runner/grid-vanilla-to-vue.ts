import {getFunctionName, ImportType, isInstanceMethod, modulesProcessor, removeFunctionKeyword} from './parser-utils';
import {convertTemplate, getImport, toAssignment, toConst, toInput, toMember, toOutput} from './vue-utils';
import {templatePlaceholder} from "./grid-vanilla-src-parser";

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

        additionalLines.push(`const httpRequest = new XMLHttpRequest();
            const updateData = (data) => ${setRowDataBlock};

            httpRequest.open('GET', ${url});
            httpRequest.send();
            httpRequest.onreadystatechange = () => {
                if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                    updateData(JSON.parse(httpRequest.responseText));
                }
            };`);
    }

    return `onGridReady(params) {${additionalLines.length > 0 ? `\n\n        ${additionalLines.join('\n        ')}` : ''}
    }`;
}

function getModuleImports(bindings: any, componentFileNames: string[]): string[] {
    const {gridSettings} = bindings;
    const {modules} = gridSettings;

    const imports = [
        "import Vue from 'vue';",
        "import { AgGridVue } from '@ag-grid-community/vue';",
    ];

    if (modules) {
        const {moduleImports, suppliedModules} = modulesProcessor(modules);

        imports.push(...moduleImports);
        bindings.gridSuppliedModules = `[${suppliedModules.join(', ')}]`;

        imports.push("import '@ag-grid-community/core/dist/styles/ag-grid.css';");

        // to account for the (rare) example that has more than one class...just default to balham if it does
        const theme = gridSettings.theme || 'ag-theme-balham';
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

        // to account for the (rare) example that has more than one class...just default to balham if it does
        const theme = gridSettings.theme || 'ag-theme-balham';
        imports.push(`import '@ag-grid-community/all-modules/dist/styles/${theme}.css';`);
    }

    if (componentFileNames) {
        imports.push(...componentFileNames.map(componentFileName => getImport(componentFileName, 'Vue', '')));
    }

    return imports;
}

function getPackageImports(bindings: any, componentFileNames: string[]): string[] {
    const {gridSettings} = bindings;
    const {modules} = gridSettings;

    const imports = [
        "import Vue from 'vue';",
        "import { AgGridVue } from 'ag-grid-vue';",
    ];

    if (modules) {
        const {moduleImports, suppliedModules} = modulesProcessor(modules);

        imports.push(...moduleImports);
        bindings.gridSuppliedModules = `[${suppliedModules.join(', ')}]`;

        imports.push("import '@ag-grid-community/core/dist/styles/ag-grid.css';");

        // to account for the (rare) example that has more than one class...just default to balham if it does
        const theme = gridSettings.theme || 'ag-theme-balham';
        imports.push(`import "@ag-grid-community/core/dist/styles/${theme}.css";`);
    } else {
        if (gridSettings.enterprise) {
            imports.push("import 'ag-grid-enterprise';");
        }

        imports.push("import 'ag-grid-community/dist/styles/ag-grid.css';");

        // to account for the (rare) example that has more than one class...just default to balham if it does
        const theme = gridSettings.theme || 'ag-theme-balham';
        imports.push(`import 'ag-grid-community/dist/styles/${theme}.css';`);
    }

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

function getPropertyBindings(bindings: any, componentFileNames: string[], importType: ImportType): [string[], string[], string[]] {
    const propertyAssignments = [];
    const propertyVars = [];
    const propertyAttributes = [];

    bindings.properties
        .filter(property => property.name !== 'onGridReady')
        .forEach(property => {
            if (componentFileNames.length > 0 && property.name === 'components') {
                property.name = 'frameworkComponents';
            }

            if (property.value === 'true' || property.value === 'false') {
                propertyAttributes.push(toConst(property));
            } else if (property.value === null || property.value === 'null') {
                propertyAttributes.push(toInput(property));
            } else {
                // for when binding a method
                // see javascript-grid-keyboard-navigation for an example
                // tabToNextCell needs to be bound to the react component
                if (!isInstanceMethod(bindings.instanceMethods, property)) {
                    propertyAttributes.push(toInput(property));
                    propertyVars.push(toMember(property));
                }

                propertyAssignments.push(toAssignment(property));
            }
        });

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

    return [propertyAssignments, propertyVars, propertyAttributes];
}

function getTemplate(bindings: any, attributes: string[]): string {
    const {gridSettings} = bindings;
    const style = gridSettings.noStyle ? '' : `style="width: ${gridSettings.width}; height: ${gridSettings.height};"`;

    const agGridTag = `<ag-grid-vue
    ${style}
    class="${gridSettings.theme}"
    id="myGrid"
    :gridOptions="gridOptions"
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

        if (aIsAssignedToWindow && bIsAssignedToWindow) { return 0; }
        if (aIsAssignedToWindow) { return -1; }
        if (bIsAssignedToWindow) { return 1; }

        return 0;
    });

    return [eventHandlers, externalEventHandlers, instanceMethods, utilFunctions];
}

export function vanillaToVue(bindings: any, componentFileNames: string[], importType: ImportType): string {
    const imports = getImports(bindings, componentFileNames, importType);
    const [propertyAssignments, propertyVars, propertyAttributes] = getPropertyBindings(bindings, componentFileNames, importType);
    const onGridReady = getOnGridReadyCode(bindings);
    const eventAttributes = bindings.eventHandlers.filter(event => event.name !== 'onGridReady').map(toOutput);
    const [eventHandlers, externalEventHandlers, instanceMethods, utilFunctions] = getAllMethods(bindings);
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
        'ag-grid-vue': AgGridVue
    },
    data: function() {
        return {
            gridOptions: null,
            gridApi: null,
            columnApi: null,
            ${propertyVars.join(',\n')}
        }
    },
    beforeMount() {
        this.gridOptions = {};
        ${propertyAssignments.join(';\n')}
    },
    mounted() {
        this.gridApi = this.gridOptions.api;
        this.gridColumnApi = this.gridOptions.columnApi;
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

new Vue({
    el: '#app',
    components: {
        'my-component': VueExample
    }
});
`;
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToVue = vanillaToVue;
}
