import parser, {recognizedDomEvents} from './vanilla-src-parser';

function removeFunction(code) {
    return code.replace(/^function /, '');
}

function getFunctionName(code) {
    let matches = /function ([^\(]*)/.exec(code);
    return matches && matches.length === 2 ? matches[1] : null;
}

function onGridReadyTemplate(readyCode: string, resizeToFit: boolean, data: { url: string, callback: string }) {
    let resize = '', getData = '';

    if (!readyCode) {
        readyCode = '';
    }

    if (resizeToFit) {
        resize = `params.api.sizeColumnsToFit();`;
    }

    if (data) {
        if (data.callback.indexOf('api.setRowData') !== -1) {
            const setRowDataBlock = data.callback.replace("params.api.setRowData(data);", "this.rowData = data");
            getData = `this.http.get(${data.url}).subscribe( data => ${setRowDataBlock} );`;
        } else {
            getData = `this.http.get(${data.url}).subscribe( data => ${data.callback});`
        }
    }

    return `
    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

        ${getData}
        ${resize}
        ${readyCode.trim().replace(/^\{|\}$/g, '')}
    }`;
}

const toInput = property => `[${property.name}]="${property.name}"`;
const toConst = property => `[${property.name}]="${property.value}"`;

const toOutput = event => `(${event.name})="${event.handlerName}($event)"`;

const toMember = property => `private ${property.name};`;

const toAssignment = property => `this.${property.name} = ${property.value}`;

function isInstanceMethod(instance: any, property: any) {
    const instanceMethods = instance.map(getFunctionName);
    return instanceMethods.filter(methodName => methodName === property.name).length > 0;
}

function appComponentTemplate(bindings, componentFileNames, isDev) {
    const diParams = [];
    const imports = [];
    const additional = [];

    if (bindings.data) {
        imports.push('import { HttpClient } from "@angular/common/http";');
        diParams.push('private http: HttpClient');
    }

    if (bindings.gridSettings.enterprise) {
        imports.push('import "ag-grid-enterprise";');
    }

    const chartsEnabled = bindings.properties.filter(property => property.name === 'enableCharts' && property.value === 'true').length >= 1;
    if(chartsEnabled && !isDev) {
        imports.push('import "ag-grid-enterprise/chartsModule";');
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

    bindings.properties.filter(property => property.name != 'onGridReady').forEach(property => {
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
            // tabToNextCell needs to be bound to the angular component
            if(!isInstanceMethod(bindings.instance, property)) {
                propertyAttributes.push(toInput(property));
                propertyVars.push(toMember(property));
            }
            propertyAssignments.push(toAssignment(property));
        }
    });
    if (propertyAttributes.filter(item => item.indexOf('[rowData]') !== -1).length === 0) {
        propertyAttributes.push('[rowData]="rowData"');
    }
    if (propertyVars.filter(item => item.indexOf('rowData') !== -1).length === 0) {
        propertyVars.push('private rowData: []');
    }

    const instance = bindings.instance.map(removeFunction);
    const eventAttributes = bindings.eventHandlers.filter(event => event.name != 'onGridReady').map(toOutput);
    const eventHandlers = bindings.eventHandlers.map(event => event.handler).map(removeFunction);

    eventAttributes.push('(gridReady)="onGridReady($event)"');

    additional.push(onGridReadyTemplate(bindings.onGridReady, bindings.resizeToFit, bindings.data));

    const style = bindings.gridSettings.noStyle ? '' : `style="width: ${bindings.gridSettings.width}; height: ${bindings.gridSettings.height};"`;

    const agGridTag = `<ag-grid-angular
    #agGrid
    ${style}
    id="myGrid"
    class="${bindings.gridSettings.theme}"
    ${propertyAttributes.concat(eventAttributes).join('\n    ')}
    ></ag-grid-angular>`;

    let template;
    if (bindings.template) {
        template = bindings.template;

        recognizedDomEvents.forEach(event => {
            template = template.replace(new RegExp(`on${event}=`, 'g'), `(${event})=`);
        });

        template = template.replace('$$GRID$$', agGridTag);
    } else {
        template = agGridTag;
    }

    const externalEventHandlers = bindings.externalEventHandlers.map(handler => removeFunction(handler.body));

    return `
import { Component, ViewChild } from '@angular/core';
${imports.join('\n')}


@Component({
    selector: 'my-app',
    template: \`${template}\`
})

export class AppComponent {
    private gridApi;
    private gridColumnApi;

    ${propertyVars.join('\n')}

    constructor(${diParams.join(', ')}) {
        ${propertyAssignments.join(';\n')}
    }

    ${eventHandlers
        .concat(externalEventHandlers)
        .concat(additional)
        .concat(instance)
        .map(snippet => snippet.trim())
        .join('\n\n')}
}

${bindings.utils.join('\n')}
`;
}

export function vanillaToAngular(js, html, exampleSettings, componentFileNames, isDev) {
    const bindings = parser(js, html, exampleSettings);
    return appComponentTemplate(bindings, componentFileNames, isDev);
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToAngular = vanillaToAngular;
}
