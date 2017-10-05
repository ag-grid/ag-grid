import parser from './vanilla-src-parser';

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

function ngAfterViewInitTemplate(readyCode) {
    return `onGridReady(params) ${readyCode}

    ngAfterViewInit() {
        setTimeout( () => this.onGridReady(this.agGrid), 400);
    }`;
}

const toInput = property => `[${property.name}]="${property.name}"`;

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

    const propertyAttributes = bindings.properties.map(toInput);

    const propertyVars = bindings.properties.map(toMember);

    const propertyAssignments = bindings.properties.map(toAssignment);

    const eventAttributes = bindings.eventHandlers.filter(event => event.name != 'onGridReady').map(toOutput);

    const eventHandlers = bindings.eventHandlers.map(event => event.handler).map(removeFunction);

    if (bindings.data) {
        additional.push(ngOnInitTemplate(bindings.data.url, bindings.data.callback));
    }

    if (bindings.onGridReady) {
        additional.push(ngAfterViewInitTemplate(bindings.onGridReady));
    }

    const agGridTag = `<ag-grid-angular
    #agGrid
    style="width: ${bindings.gridSettings.width}; height: ${bindings.gridSettings.height};"
    class="${bindings.gridSettings.theme}"
    ${propertyAttributes.concat(eventAttributes).join('\n    ')}
    ></ag-grid-angular>`;

    const template = bindings.template
        ? bindings.template
              .replace(/onclick=/g, '(click)=')
              .replace(/onchange=/g, '(change)=')
              .replace('$$GRID$$', agGridTag)
        : agGridTag;

    const externalEventHandlers = bindings.externalEventHandlers.map(handler => removeFunction(handler.body));

    return `
import { Component, ViewChild } from '@angular/core';
${imports.join('\n')}

${bindings.utils.join('\n')}

@Component({
    selector: 'my-app',
    template: \`${template}\`
})
export class AppComponent {
    @ViewChild('agGrid') agGrid;

    ${propertyVars.join('\n    ')}

    constructor(${diParams.join(', ')}) {
        ${propertyAssignments.join(';\n    ')}
    }

    ${eventHandlers
        .concat(externalEventHandlers)
        .concat(additional)
        .map(snippet => snippet.trim())
        .join('\n\n')}
}
`;
}

export function vanillaToAngular(src, gridSettings) {
    const bindings = parser(src, gridSettings, {gridOptionsLocalVar: 'const gridOptions = this.agGrid'});
    return appComponentTemplate(bindings);
}

(<any>window).vanillaToAngular = vanillaToAngular;
