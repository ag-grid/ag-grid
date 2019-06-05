import parser, {recognizedDomEvents} from './vanilla-src-parser';

function removeFunction(code) {
    return code.replace(/^function /, '');
}

function getFunctionName(code) {
    let matches = /function ([^\(]*)/.exec(code);
    return matches && matches.length === 2 ? matches[1] : null;
}

function onGridReadyTemplate(readyCode: string,
                             resizeToFit: boolean,
                             propertyAttributes: string[],
                             propertyVars: string[],
                             data: { url: string, callback: string }) {
    let resize = '', getData = '';

    if (!readyCode) {
        readyCode = '';
    }

    if (resizeToFit) {
        resize = `params.api.sizeColumnsToFit();`;
    }

    if (data) {
        let setRowDataBlock = data.callback;
        if (data.callback.indexOf('api.setRowData') !== -1) {
            if (propertyAttributes.filter(item => item.indexOf(':rowData') !== -1).length === 0) {
                propertyAttributes.push(':rowData="rowData"');
            }
            if (propertyVars.filter(item => item.indexOf('rowData') !== -1).length === 0) {
                propertyVars.push('rowData: null');
            }

            setRowDataBlock = data.callback.replace("params.api.setRowData(data);", "this.rowData = data;");
        }

        getData = `
            const httpRequest = new XMLHttpRequest();
            const updateData = (data) => ${setRowDataBlock};
    
            httpRequest.open('GET', ${data.url});
            httpRequest.send();
            httpRequest.onreadystatechange = () => {
                if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                    updateData(JSON.parse(httpRequest.responseText));
                }
            };`
    }

    return `onGridReady(params) {
        ${getData}
        ${resize}
        ${readyCode.trim().replace(/^\{|\}$/g, '')}
    }`;
}


function kebabProperty(property: string) {
    return property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

const toInput = property => `:${property.name}="${property.name}"`;
const toConst = property => `:${property.name}="${property.value}"`;

const toOutput = event => `@${kebabProperty(event.name)}="${event.handlerName}"`;

const toMember = property => `${property.name}: null`;

const toAssignment = (property) => {
    let value = property.value;

    // convert to arrow functions
    value = value.replace(/function\s*\(([^\)]+)\)/, '($1) =>');

    return `this.${property.name} = ${value}`;
};

function createComponentImports(bindings, componentFileNames: any, isDev) {
    const imports = [];

    if (bindings.gridSettings.enterprise) {
        imports.push('import "ag-grid-enterprise";');
    }

    const chartsEnabled = bindings.properties.filter(property => property.name === 'enableCharts' && property.value === 'true').length >= 1;
    if(chartsEnabled  && !isDev) {
        imports.push('import "ag-grid-enterprise/chartsModule";');
    }

    if (componentFileNames) {
        let titleCase = (s) => {
            let camelCased = s.replace(/-([a-z])/g, g => g[1].toUpperCase());
            return camelCased.charAt(0).toUpperCase() + camelCased.slice(1);
        };

        componentFileNames.forEach(filename => {
            let fileFragments = filename.split('.');
            imports.push('import ' + titleCase(fileFragments[0]) + ' from "./' + fileFragments[0] + '.js";');
        });
    }

    return imports;
}

function isInstanceMethod(instance: any, property: any) {
    const instanceMethods = instance.map(getFunctionName);
    return instanceMethods.filter(methodName => methodName === property.name).length > 0;
}

function getPropertyBindings(bindings, componentFileNames) {
    const propertyAssignments = [];
    const propertyVars = [];
    const propertyAttributes = [];

    bindings.properties
        .filter(property => property.name !== "onGridReady")
        .forEach(property => {
            if (componentFileNames.length > 0 && property.name === "components") {
                property.name = "frameworkComponents";
            }

            if (property.value === 'true' || property.value === 'false') {
                propertyAttributes.push(toConst(property));
            } else if (property.value === null || property.value === 'null') {
                propertyAttributes.push(toInput(property));
            } else {
                // for when binding a method
                // see javascript-grid-keyboard-navigation for an example
                // tabToNextCell needs to be bound to the react component
                if(!isInstanceMethod(bindings.instance, property)) {
                    propertyAttributes.push(toInput(property));
                    propertyVars.push(toMember(property));
                }
                propertyAssignments.push(toAssignment(property));
            }
        });

    return [propertyAssignments, propertyVars, propertyAttributes];
}

let parseTemplateFromBinding = function (bindings, agGridTag: string) {
    let template = bindings.template;

    recognizedDomEvents.forEach(event => {
        template = template.replace(new RegExp(`on${event}=`, 'g'), `v-on:${event}=`);
    });

    template = template.replace("$$GRID$$", agGridTag);
    template = template.split("\n").filter((line) => line.length > 0).map((line) => `${line}`).join("\n            ");
    return template;
};

function parseAllMethods(bindings) {
    const eventHandlers = bindings.eventHandlers.filter(event => event.name != 'onGridReady')
        .map(event => event.handler)
        .map(removeFunction);
    const externalEventHandlers = bindings.externalEventHandlers.map(event => event.body).map(removeFunction);
    const instanceFunctions = bindings.instance.map(removeFunction);
    const utilFunctions = bindings.utils.map(body => {
        const funcName = getFunctionName(body);
        if (funcName) {
            `window.${funcName} = ${body}`;
        }

        // probably a var
        return body;
    });

    return [eventHandlers, externalEventHandlers, instanceFunctions, utilFunctions];
}

function componentTemplate(bindings, componentFileNames, isDev) {
    const imports = createComponentImports(bindings, componentFileNames, isDev);
    const [propertyAssignments, propertyVars, propertyAttributes] = getPropertyBindings(bindings, componentFileNames);
    const gridReadyTemplate = onGridReadyTemplate(bindings.onGridReady, bindings.resizeToFit, propertyAttributes, propertyVars, bindings.data);
    const eventAttributes = bindings.eventHandlers.filter(event => event.name != 'onGridReady').map(toOutput);
    const [eventHandlers, externalEventHandlers, instanceFunctions, utilFunctions] = parseAllMethods(bindings);

    const style = bindings.gridSettings.noStyle ? '' : `style="width: ${bindings.gridSettings.width}; height: ${bindings.gridSettings.height};"`;

    const agGridTag = `      <ag-grid-vue ${style} class="${bindings.gridSettings.theme}" id="myGrid"
               :gridOptions="gridOptions"
               @grid-ready="onGridReady"
               ${propertyAttributes.concat(eventAttributes).map((line) => `${line}`).join('\n              ')}></ag-grid-vue>`;


    const template = bindings.template ? parseTemplateFromBinding(bindings, agGridTag) : agGridTag;
    return `
import Vue from "vue";
import {AgGridVue} from "ag-grid-vue";

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
        .concat(gridReadyTemplate)
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

export function vanillaToVue(js, html, exampleSettings, componentFileNames, isDev) {
    const bindings = parser(js, html, exampleSettings);
    return componentTemplate(bindings, componentFileNames, isDev);
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToVue = vanillaToVue;
}
