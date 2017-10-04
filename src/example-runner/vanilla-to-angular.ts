import parser from './vanilla-src-parser';

function stripOnPrefix(eventName) {
    return eventName.replace(/on([A-Z])/, function(...matches) {
        return matches[1].toLowerCase();
    });
}

function convertFunctionToMethod(func, methodName) {
    return methodName + func.replace('function ', '');
}

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

    const propertyAttributes = bindings.properties.map(property => {
        return `[${property.name}]="${property.name}"`;
    });

    const propertyVars = bindings.properties.map(property => `${property.name};`);

    const propertyAssignments = bindings.properties.map(property => `this.${property.name} = ${property.value}`);

    const eventAttributes = bindings.eventHandlers.filter(event => event.name != 'onGridReady').map(event => {
        return `(${stripOnPrefix(event.name)})="${event.name}($event)"`;
    });

    const eventHandlers = bindings.eventHandlers.map(event => {
        return convertFunctionToMethod(event.handler, event.name);
    });

    if (bindings.data) {
        additional.push(`
    ngOnInit() {
        const gridOptions = this.agGrid;
        this.http.get(${bindings.data.url}).subscribe( data => ${bindings.data.callback});
    }
        `);
    }

    const agGridTag = `<ag-grid-angular
    #agGrid
    style="width: ${bindings.gridSettings.width}; height: ${bindings.gridSettings.height};"
    class="${bindings.gridSettings.theme}"
    ${propertyAttributes.concat(eventAttributes).join('\n    ')}
    ></ag-grid-angular>`;

    const template = bindings.template ? bindings.template.replace(/onclick=/g, '(click)=').replace('$$GRID$$', agGridTag) : agGridTag;
    const externalEventHandlers = bindings.externalEventHandlers.map(handler => handler.body.replace(/^function /, ''));

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
/*
    ngAfterViewInit() {
        // necessary for the layout to kick in
        setTimeout( () => this.onGridReady(this.agGrid), 400);
    }
*/
}
`;
}

export function vanillaToAngular(src, gridSettings) {
    const bindings = parser(src, gridSettings, {gridOptionsLocalVar: 'const gridOptions = this.agGrid'});
    return appComponentTemplate(bindings);
}

(<any>window).vanillaToAngular = vanillaToAngular;
