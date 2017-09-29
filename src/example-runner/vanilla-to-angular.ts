import {generate} from 'escodegen';
import * as esprima from 'esprima';

function stripOnPrefix(eventName) {
    return eventName.replace(/on([A-Z])/, function(...matches) {
        return matches[1].toLowerCase();
    });
}

function convertFunctionToMethod(func, methodName) {
    return methodName + func.replace('function ', '');
}

function appComponentTemplate(bindings) {
    const eventAttributes = bindings.eventHandlers
        .filter(event => event.name != 'onGridReady')
        .map(event => {
            return `(${stripOnPrefix(event.name)})="${event.name}($event)"`;
        })
        .join(' ');

    const eventHandlers = bindings.eventHandlers
        .map(event => {
            return convertFunctionToMethod(event.handler, event.name);
        })
        .join('\n\n');

    return `
import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'my-app',
  template: '<ag-grid-angular #agGrid style="width: 900px; height: 115px;" class="ag-fresh" ${eventAttributes} [rowData]="rowData" [columnDefs]="columnDefs"></ag-grid-angular>'
})
export class AppComponent {
    @ViewChild('agGrid') agGrid;
    columnDefs;
    rowData;

    constructor() {
        this.columnDefs = ${bindings.columnDefs};
        this.rowData = ${bindings.rowData};
    }

    ${eventHandlers}

    ngAfterViewInit() {
        // necessary for the layout to kick in
        setTimeout( () => this.onGridReady(this.agGrid), 400);
    }
}
`;
}

const EVENTS = ['onGridReady'];

function getPropertyValue(objectExpression, key) {
    let found;

    for (let prop of objectExpression.init.properties) {
        if (prop.key.name == key) {
            found = prop;
        }
    }

    return found && found.value;
}

function vanillaToAngular(src, callback) {
    const tree = esprima.parseScript(src);

    function findVar(varName) {
        let found;

        for (let node of tree.body) {
            if (node.type === 'VariableDeclaration' && (<any>node.declarations[0].id).name === varName) {
                found = node;
            }
        }

        return found && found.declarations[0];
    }

    const gridOptions = findVar('gridOptions');
    const eventHandlers = [];

    if (gridOptions) {
        EVENTS.forEach(eventName => {
            const eventHandler = getPropertyValue(gridOptions, eventName);
            if (eventHandler) {
                eventHandlers.push({
                    name: eventName,
                    handler: generate(eventHandler)
                });
            }
        });
    }

    const bindings = {
        eventHandlers: eventHandlers,
        columnDefs: generate(findVar('columnDefs').init),
        rowData: generate(findVar('rowData').init)
    };

    callback(appComponentTemplate(bindings));
}

(<any>window).vanillaToAngular = vanillaToAngular;
