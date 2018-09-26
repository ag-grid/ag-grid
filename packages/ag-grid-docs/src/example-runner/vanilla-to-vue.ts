import parser, {recognizedDomEvents} from './vanilla-src-parser';

function removeFunction(code) {
    return code.replace(/^function /, '');
}

function getFunctionName(code) {
    let matches = /function ([^\(]*)/.exec(code);
    return matches && matches.length === 2 ?  matches[1] : null;
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
        if(data.callback.indexOf('api.setRowData') !== -1) {
            propertyAttributes.push(':rowData="rowData"');
            propertyVars.push('rowData: []');

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

const toInput = property => `:${property.name}="${property.name}"`;
const toConst = property => `:${property.name}="${property.value}"`;

const toOutput = event => `:${event.name}="${event.handlerName}"`;

const toMember = property => `${property.name}: null`;

const toAssignment = (property, methodNames: string[]) => {
    let value = property.value;

    for (let methodName of methodNames) {
        value = value.replace(new RegExp(`\\b${methodName}\\b`, 'g'), `this.${methodName}`);
    }

    // convert to arrow functions
    value = value.replace(/function\s*\(([^\)]+)\)/, '($1) =>');

    return `this.${property.name} = ${value}`;
};

function componentTemplate(bindings, componentFileNames) {
    const imports = [];
    const additional = [];

    if (bindings.gridSettings.enterprise) {
        imports.push('import "ag-grid-enterprise";');
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

    const propertyAssignments = [];
    const propertyVars = [];
    const propertyAttributes = [];

    const utilMethodNames = bindings.utils.map(getFunctionName);
    bindings.properties
        .filter(property => property.name !== "onGridReady")
        .forEach(property => {
            if (property.value === 'null') {
                return;
            }

            if (componentFileNames.length > 0 && property.name === "components") {
                property.name = "frameworkComponents";
            }

            if (property.value === 'true' || property.value === 'false') {
                propertyAttributes.push(toConst(property));
            } else {
                propertyAttributes.push(toInput(property));
                propertyVars.push(toMember(property));
                propertyAssignments.push(toAssignment(property, utilMethodNames));
            }
        });

    const eventAttributes = bindings.eventHandlers.filter(event => event.name != 'onGridReady').map(toOutput);
    const eventHandlers = bindings.eventHandlers.map(event => event.handler).map(removeFunction);
    const utilsMethods = bindings.utils.map(removeFunction);

    additional.push(onGridReadyTemplate(bindings.onGridReady, bindings.resizeToFit, propertyAttributes, propertyVars, bindings.data));

    const style = bindings.gridSettings.noStyle ? '' : `style="width: ${bindings.gridSettings.width}; height: ${bindings.gridSettings.height};"`;

    const agGridTag = `      <ag-grid-vue ${style} class="${bindings.gridSettings.theme}"
              :gridOptions="gridOptions"
              :gridReady="onGridReady" 
              ${propertyAttributes.concat(eventAttributes).map((line) => `${line}`).join('\n              ')}></ag-grid-vue>`;

    let template;
    if (bindings.template) {
        template = bindings.template;

        recognizedDomEvents.forEach(event => {
            template = template.replace(new RegExp(`on${event}=`, 'g'), `v-on:${event}=`);
        });

        template = template.replace("$$GRID$$", agGridTag);
        template = template.split("\n").filter((line) => line.length > 0).map((line) => `${line}`).join("\n            ");
    } else {
        template = agGridTag;
    }

    const externalEventHandlers = bindings.externalEventHandlers.map(handler => removeFunction(handler.body));

    return `
import Vue from "vue";
import {AgGridVue} from "ag-grid-vue";

// import "../node_modules/ag-grid-community/dist/styles/ag-grid.css";
// import "../node_modules/ag-grid-community/dist/styles/${bindings.gridSettings.theme}";

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
        this.gridColumnApi = this.gridOptions.api.columnApi;
    },
    methods: {
        ${eventHandlers
        .concat(externalEventHandlers)
        .concat(additional)
        .concat(utilsMethods)
        .concat(bindings.instance)
        .map(snippet => `${snippet.trim()},`)
        .join('\n')}
    }    
}

new Vue({
    el: '#app',
    components: {
        'my-component': VueExample
    }
});
`;
}

export function vanillaToVue(src, gridSettings, componentFileNames) {
    const bindings = parser(src, gridSettings);
    return componentTemplate(bindings, componentFileNames);
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToVue = vanillaToVue;
}
