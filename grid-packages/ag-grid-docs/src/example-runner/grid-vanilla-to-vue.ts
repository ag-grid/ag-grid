import { recognizedDomEvents, getFunctionName } from './grid-vanilla-src-parser';

function removeFunctionKeyword(code): string {
    return code.replace(/^function /, '');
}

function getOnGridReadyCode(bindings: any): string {
    const { onGridReady, resizeToFit, data } = bindings;
    const additionalLines = [];

    if (onGridReady) {
        additionalLines.push(onGridReady.trim().replace(/^\{|\}$/g, ''));
    }

    if (resizeToFit) {
        additionalLines.push('params.api.sizeColumnsToFit();');
    }

    if (data) {
        const { url, callback } = data;

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

function toKebabCase(value: string): string {
    return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

const toInput = property => `:${property.name}="${property.name}"`;
const toConst = property => `:${property.name}="${property.value}"`;
const toOutput = event => `@${toKebabCase(event.name)}="${event.handlerName}"`;
const toMember = property => `${property.name}: null`;

function toAssignment(property: any): string {
    // convert to arrow functions
    const value = property.value.replace(/function\s*\(([^\)]+)\)/, '($1) =>');

    return `this.${property.name} = ${value}`;
};

function getImports(bindings: any, componentFileNames: string[]): string[] {
    const { gridSettings } = bindings;
    const imports = [
        "import Vue from 'vue';",
        "import { AgGridVue } from '@ag-grid-community/vue';",
    ];

    if (gridSettings.enterprise) {
        imports.push("import { AllModules } from '@ag-grid-enterprise/all-modules';");
    } else {
        imports.push("import { AllCommunityModules } from '@ag-grid-community/all-modules';");
    }

    imports.push("import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';");

    // to account for the (rare) example that has more than one class...just default to balham if it does
    const theme = gridSettings.theme || 'ag-theme-balham';
    imports.push(`import '@ag-grid-community/all-modules/dist/styles/${theme}.css';`);

    if (componentFileNames) {
        const toTitleCase = value => {
            let camelCased = value.replace(/-([a-z])/g, g => g[1].toUpperCase());
            return camelCased[0].toUpperCase() + camelCased.slice(1);
        };

        componentFileNames.forEach(filename => {
            let componentName = filename.split('.')[0];
            imports.push(`import ${toTitleCase(componentName)} from './${componentName}.js';`);
        });
    }

    return imports;
}

function isInstanceMethod(instance: any, property: any): boolean {
    return instance.map(getFunctionName).filter(name => name === property.name).length > 0;
}

function getPropertyBindings(bindings: any, componentFileNames: string[]): [string[], string[], string[]] {
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
                if (!isInstanceMethod(bindings.instance, property)) {
                    propertyAttributes.push(toInput(property));
                    propertyVars.push(toMember(property));
                }

                propertyAssignments.push(toAssignment(property));
            }
        });

    propertyAttributes.push(':modules="modules"');
    propertyVars.push(`modules: ${bindings.gridSettings.enterprise ? 'AllModules' : 'AllCommunityModules'}`);

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
    const { gridSettings } = bindings;
    const style = gridSettings.noStyle ? '' : `style="width: ${gridSettings.width}; height: ${gridSettings.height};"`;

    const agGridTag = `<ag-grid-vue
    ${style}
    class="${gridSettings.theme}"
    id="myGrid"
    :gridOptions="gridOptions"
    @grid-ready="onGridReady"
    ${attributes.join('\n    ')}></ag-grid-vue>`;

    let template = agGridTag;

    if (bindings.template) {
        template = bindings.template;

        recognizedDomEvents.forEach(event => {
            template = template.replace(new RegExp(`on${event}=`, 'g'), `v-on:${event}=`);
        });

        template = template.replace("$$GRID$$", agGridTag);

        // re-indent
        template = template.split("\n").filter(line => line.length > 0).join('\n            ');
    }

    return template;
};

function getAllMethods(bindings) {
    const eventHandlers = bindings.eventHandlers
        .filter(event => event.name != 'onGridReady')
        .map(event => event.handler)
        .map(removeFunctionKeyword);

    const externalEventHandlers = bindings.externalEventHandlers.map(event => event.body).map(removeFunctionKeyword);
    const instanceFunctions = bindings.instance.map(removeFunctionKeyword);

    const utilFunctions = bindings.utils.map(body => {
        const funcName = getFunctionName(body);

        if (funcName) {
            return `window.${funcName} = ${body}`;
        }

        // probably a var
        return body;
    });

    return [eventHandlers, externalEventHandlers, instanceFunctions, utilFunctions];
}

export function vanillaToVue(bindings, componentFileNames) {
    const imports = getImports(bindings, componentFileNames);
    const [propertyAssignments, propertyVars, propertyAttributes] = getPropertyBindings(bindings, componentFileNames);
    const onGridReady = getOnGridReadyCode(bindings);
    const eventAttributes = bindings.eventHandlers.filter(event => event.name !== 'onGridReady').map(toOutput);
    const [eventHandlers, externalEventHandlers, instanceFunctions, utilFunctions] = getAllMethods(bindings);
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
            .concat(instanceFunctions)
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
