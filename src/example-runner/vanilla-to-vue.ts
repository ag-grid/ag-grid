import parser, {recognizedDomEvents} from './vanilla-src-parser';

function removeFunction(code) {
    return code.replace(/^function /, '');
}

function getFunctionName(code) {
    return /function ([^\(]*)/.exec(code)[1];
}

function getMountedTemplate(readyCode: string, resizeToFit: boolean, data: { url: string, callback: string }) {
    let resize = '', getData = '';

    if (!readyCode) {
        readyCode = '';
    }

    if (resizeToFit) {
        resize = `this.gridApi.sizeColumnsToFit();`;
    }

    if (data) {
        getData = `
            const httpRequest = new XMLHttpRequest();
            const updateData = (data) => ${data.callback};
    
            httpRequest.open('GET', ${data.url});
            httpRequest.send();
            httpRequest.onreadystatechange = () => {
                if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                    updateData(JSON.parse(httpRequest.responseText));
                }
            };`
    }

    return `mounted() {
        this.gridApi = this.gridOptions.api;
        this.gridColumnApi = this.gridOptions.api.columnApi;

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

function appComponentTemplate(bindings, componentFileNames) {
    const diParams = [];
    const imports = [];
    const additional = [];

    // if (bindings.data) {
    //     imports.push('import { HttpClient } from "@angular/common/http";');
    //     diParams.push('private http: HttpClient');
    // }

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
            imports.push('import { ' + titleCase(fileFragments[0]) + ' } from "./' + fileFragments[0] + '.component";');
        });
    }

    const propertyAttributes = [];
    const propertyVars = [];
    const propertyAssignments = [];

    const utilMethodNames = bindings.utils.map(getFunctionName);
    bindings.properties.forEach(property => {
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

    // eventAttributes.push('(gridReady)="onGridReady($event)"');
    const mountedTemplate = getMountedTemplate(bindings.onGridReady, bindings.resizeToFit, bindings.data);

    const style = bindings.gridSettings.noStyle ? '' : `style="width: ${bindings.gridSettings.width}; height: ${bindings.gridSettings.height};"`;

    const agGridTag = `      <ag-grid-vue ${style} class="${bindings.gridSettings.theme}"
              :gridOptions="gridOptions" 
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

// import "../node_modules/ag-grid/dist/styles/ag-grid.css";
// import "../node_modules/ag-grid/dist/styles/${bindings.gridSettings.theme}";

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
    ${mountedTemplate},
    methods: {
        ${eventHandlers
        .concat(externalEventHandlers)
        .concat(additional)
        .map(snippet => `${snippet.trim()},`)
        .join(',\n')}
        ${utilsMethods.join(',\n')}            
    },
        
    ${bindings.instance.join('\n')}
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
    return appComponentTemplate(bindings, componentFileNames);
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToVue = vanillaToVue;
}
