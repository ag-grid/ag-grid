import parser, {recognizedDomEvents} from './vanilla-src-parser';

function removeFunction(code) {
    return code.replace(/^function /, '');
}

function convertFunctionToMethod(code, methodName) {
    return methodName + removeFunction(code);
}

function ngOnInitTemplate(url, callback) {
    return `
    ngOnInit() {
        const gridOptions = this.agGrid;
        this.http.get(${url}).subscribe( data => ${callback});
    }`;
}

function onGridReadyTemplate(readyCode: string, resizeToFit: boolean) {
    let resize = '';

    if (!readyCode) {
        readyCode = '';
    }

    if (resizeToFit) {
        resize = `this.agGrid.api.sizeColumnsToFit();`;
    }

    return `
    onGridReady(params) {
        const gridOptions = params;
        ${resize}
        ${readyCode.trim().replace(/^\{|\}$/g, '')}
    }`;
}

const toInput = property => `[${property.name}]="${property.name}"`;
const toConst = property => `[${property.name}]="${property.value}"`;

const toOutput = event => `(${event.name})="${event.handlerName}($event)"`;

const toMember = property => `private ${property.name};`;

const toAssignment = property => `this.${property.name} = ${property.value}`;

function appComponentTemplate(bindings) {
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

    const propertyAttributes =[];
    const propertyVars =[];
    const propertyAssignments =[];

    bindings.properties.forEach( property => {
        if (property.value === 'null') {
            return;
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

    if (bindings.data) {
        additional.push(ngOnInitTemplate(bindings.data.url, bindings.data.callback));
    }

    if (bindings.onGridReady || bindings.resizeToFit) {
        eventAttributes.push('(gridReady)="onGridReady($event)"');
        //additional.push('onGridReady(params){ console.log(params) }');
        additional.push(onGridReadyTemplate(bindings.onGridReady, bindings.resizeToFit));
    }

    const agGridTag = `<ag-grid-angular
    #agGrid
    style="width: ${bindings.gridSettings.width}; height: ${bindings.gridSettings.height};"
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
    @ViewChild('agGrid') agGrid;

    ${propertyVars.join('\n')}

    constructor(${diParams.join(', ')}) {
        ${propertyAssignments.join(';\n')}
    }

    ${eventHandlers
        .concat(externalEventHandlers)
        .concat(additional)
        .map(snippet => snippet.trim())
        .join('\n\n')}
}

${bindings.utils.join('\n')}
`;
}

export function vanillaToAngular(src, gridSettings) {
    const bindings = parser(src, gridSettings);
    return appComponentTemplate(bindings);
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToAngular = vanillaToAngular;
}
