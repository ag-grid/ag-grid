import parser, {recognizedDomEvents} from './vanilla-src-parser';

function removeFunction(code) {
    return code.replace(/^function /, '');
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
        if(data.callback.indexOf('api.setRowData') !== -1) {
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

function appComponentTemplate(bindings, componentFileNames) {
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
            propertyAssignments.push(toAssignment(property));
        }
    });

    const eventAttributes = bindings.eventHandlers.filter(event => event.name != 'onGridReady').map(toOutput);

    const eventHandlers = bindings.eventHandlers.map(event => event.handler).map(removeFunction);

    eventAttributes.push('(gridReady)="onGridReady($event)"');

    additional.push(onGridReadyTemplate(bindings.onGridReady, bindings.resizeToFit, bindings.data));

    const style = bindings.gridSettings.noStyle ? '' : `style="width: ${bindings.gridSettings.width}; height: ${bindings.gridSettings.height};"`;

    const agGridTag = `<ag-grid-angular
    #agGrid
    ${style}
    id="myGrid"
    [rowData]="rowData"
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
    private rowData: any[];

    ${propertyVars.join('\n')}

    constructor(${diParams.join(', ')}) {
        ${propertyAssignments.join(';\n')}
    }

    ${eventHandlers
        .concat(externalEventHandlers)
        .concat(additional)
        .concat(bindings.instance)
        .map(snippet => snippet.trim())
        .join('\n\n')}
}

${bindings.utils.join('\n')}
`;
}

export function vanillaToAngular(src, gridSettings, componentFileNames) {
    const bindings = parser(src, gridSettings);
    return appComponentTemplate(bindings, componentFileNames);
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToAngular = vanillaToAngular;
}
