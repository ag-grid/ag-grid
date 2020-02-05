import { recognizedDomEvents, getFunctionName } from './vanilla-src-parser';

function removeFunctionKeyword(code): string {
    return code.replace(/^function /, '');
}

function getOnGridReadyCode(readyCode: string, resizeToFit: boolean, data: { url: string, callback: string; }): string {
    const additionalLines = [];

    if (readyCode) {
        additionalLines.push(readyCode.trim().replace(/^\{|\}$/g, ''));
    }

    if (resizeToFit) {
        additionalLines.push('params.api.sizeColumnsToFit();');
    }

    if (data) {
        const { url, callback } = data;

        if (callback.indexOf('api.setRowData') !== -1) {
            const setRowDataBlock = callback.replace('params.api.setRowData(data);', 'this.rowData = data');
            additionalLines.push(`this.http.get(${url}).subscribe(data => ${setRowDataBlock});`);
        } else {
            additionalLines.push(`this.http.get(${url}).subscribe(data => ${callback});`);
        }
    }

    return `
    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;${additionalLines.length > 0 ? `\n\n        ${additionalLines.join('\n        ')}` : ''}
    }`;
}

const toInput = (property: any) => `[${property.name}]="${property.name}"`;
const toConst = (property: any) => `[${property.name}]="${property.value}"`;
const toOutput = (event: any) => `(${event.name})="${event.handlerName}($event)"`;
const toMember = (property: any) => `private ${property.name};`;
const toAssignment = (property: any) => `this.${property.name} = ${property.value}`;

function isInstanceMethod(instance: any, property: any) {
    return instance.map(getFunctionName).filter(name => name === property.name).length > 0;
}

function getImports(bindings: any, componentFileNames: string[]): string[] {
    const { gridSettings } = bindings;
    const imports = ["import { Component, ViewChild } from '@angular/core';"];

    if (bindings.data) {
        imports.push("import { HttpClient } from '@angular/common/http';");
    }

    if (gridSettings.enterprise) {
        imports.push("import { AllModules } from '@ag-grid-enterprise/all-modules';");
    } else {
        imports.push("import { AllCommunityModules } from '@ag-grid-community/all-modules';");
    }

    imports.push("import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';");

    // to account for the (rare) example that has more than one class...just default to balham if it does
    const theme = gridSettings.theme || 'ag-theme-balham';
    imports.push(`import "@ag-grid-community/all-modules/dist/styles/${theme}.css";`);

    if (componentFileNames) {
        const toTitleCase = value => {
            let camelCased = value.replace(/-([a-z])/g, g => g[1].toUpperCase());
            return camelCased[0].toUpperCase() + camelCased.slice(1);
        };

        componentFileNames.forEach(filename => {
            let componentName = filename.split('.')[0];
            imports.push(`import { ${toTitleCase(componentName)} } from './${componentName}.component';`);
        });
    }

    return imports;
}

function getTemplate(bindings: any, attributes: string[]): string {
    const { gridSettings } = bindings;
    const style = gridSettings.noStyle ? '' : `style="width: ${gridSettings.width}; height: ${gridSettings.height};"`;

    const agGridTag = `<ag-grid-angular
    #agGrid
    ${style}
    id="myGrid"
    class="${gridSettings.theme}"
    ${attributes.join('\n    ')}
    ></ag-grid-angular>`;

    let template = agGridTag;

    if (bindings.template) {
        template = bindings.template;

        recognizedDomEvents.forEach(event => {
            template = template.replace(new RegExp(`on${event}=`, 'g'), `(${event})=`);
        });

        template = template.replace(/\(event\)/g, '($event)').replace('$$GRID$$', agGridTag);
    }

    return template;
}

export function vanillaToAngular(bindings: any, componentFileNames: string[]): string {
    const { data, properties } = bindings;
    const imports = getImports(bindings, componentFileNames);
    const diParams = [];
    const additional = [];

    if (data) {
        diParams.push('private http: HttpClient');
    }

    const propertyAttributes = ['[modules]="modules"'];
    const propertyVars = [];
    const propertyAssignments = [];

    properties.filter(property => property.name !== 'onGridReady').forEach(property => {
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
            // tabToNextCell needs to be bound to the angular component
            if (!isInstanceMethod(bindings.instance, property)) {
                propertyAttributes.push(toInput(property));
                propertyVars.push(toMember(property));
            }

            propertyAssignments.push(toAssignment(property));
        }
    });

    if (propertyAttributes.filter(item => item.indexOf('[rowData]') >= 0).length === 0) {
        propertyAttributes.push('[rowData]="rowData"');
    }

    if (propertyVars.filter(item => item.indexOf('rowData') >= 0).length === 0) {
        propertyVars.push('private rowData: []');
    }

    const instance = bindings.instance.map(removeFunctionKeyword);
    const eventAttributes = bindings.eventHandlers.filter(event => event.name !== 'onGridReady').map(toOutput);
    const eventHandlers = bindings.eventHandlers.map(event => event.handler).map(removeFunctionKeyword);

    eventAttributes.push('(gridReady)="onGridReady($event)"');
    additional.push(getOnGridReadyCode(bindings.onGridReady, bindings.resizeToFit, data));

    const template = getTemplate(bindings, propertyAttributes.concat(eventAttributes));
    const externalEventHandlers = bindings.externalEventHandlers.map(handler => removeFunctionKeyword(handler.body));

    return `
${imports.join('\n')}

@Component({
    selector: 'my-app',
    template: \`${template}\`
})

export class AppComponent {
    private gridApi;
    private gridColumnApi;
    public modules: Module[] = ${bindings.gridSettings.enterprise ? 'AllModules' : 'AllCommunityModules'};

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

if (typeof window !== 'undefined') {
    (<any>window).vanillaToAngular = vanillaToAngular;
}
