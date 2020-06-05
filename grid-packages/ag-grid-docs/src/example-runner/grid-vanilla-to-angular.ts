import { ImportType, isInstanceMethod, removeFunctionKeyword, modulesProcessor } from './parser-utils';
import { convertTemplate, getImport, toAssignment, toConst, toInput, toMember, toOutput } from './angular-utils';
import { templatePlaceholder } from "./grid-vanilla-src-parser";

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


function getModuleImports(bindings: any, componentFileNames: string[]): string[] {
    const { gridSettings } = bindings;
    const { modules } = gridSettings;

    const imports = ["import { Component } from '@angular/core';"];

    if (bindings.data) {
        imports.push("import { HttpClient } from '@angular/common/http';");
    }

    if (modules) {
        let exampleModules = modules;
        if (modules === true) {
            exampleModules = ['clientside'];
        }
        const { moduleImports, suppliedModules } = modulesProcessor(exampleModules);

        imports.push(...moduleImports);
        bindings.gridSuppliedModules = `[${suppliedModules.join(', ')}]`;

        imports.push("import '@ag-grid-community/core/dist/styles/ag-grid.css';");

        // to account for the (rare) example that has more than one class...just default to balham if it does
        const theme = gridSettings.theme || 'ag-theme-alpine';
        imports.push(`import "@ag-grid-community/core/dist/styles/${theme}.css";`);
    } else {
        if (gridSettings.enterprise) {
            bindings.gridSuppliedModules = 'AllModules';
            imports.push("import { AllModules } from '@ag-grid-enterprise/all-modules';");
        } else {
            bindings.gridSuppliedModules = 'AllCommunityModules';
            imports.push("import { AllCommunityModules } from '@ag-grid-community/all-modules';");
        }

        imports.push("import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';");

        // to account for the (rare) example that has more than one class...just default to alpine if it does
        const theme = gridSettings.theme || 'ag-theme-alpine';
        imports.push(`import "@ag-grid-community/all-modules/dist/styles/${theme}.css";`);
    }

    if (componentFileNames) {
        imports.push(...componentFileNames.map(getImport));
    }

    return imports;
}

function getPackageImports(bindings: any, componentFileNames: string[]): string[] {
    const { gridSettings } = bindings;
    const imports = ["import { Component } from '@angular/core';"];

    if (bindings.data) {
        imports.push("import { HttpClient } from '@angular/common/http';");
    }

    if (gridSettings.enterprise) {
        imports.push("import 'ag-grid-enterprise';");
    }

    imports.push("import 'ag-grid-community/dist/styles/ag-grid.css';");

    // to account for the (rare) example that has more than one class...just default to alpine if it does
    const theme = gridSettings.theme || 'ag-theme-alpine';
    imports.push(`import "ag-grid-community/dist/styles/${theme}.css";`);

    if (componentFileNames) {
        imports.push(...componentFileNames.map(getImport));
    }

    return imports;
}

function getImports(bindings: any, componentFileNames: string[], importType: ImportType): string[] {
    if (importType === "packages") {
        return getPackageImports(bindings, componentFileNames);
    } else {
        return getModuleImports(bindings, componentFileNames);
    }
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

    const template = bindings.template ? bindings.template.replace(templatePlaceholder, agGridTag) : agGridTag;

    return convertTemplate(template);
}

export function vanillaToAngular(bindings: any, componentFileNames: string[]): (importType: ImportType) => string {
    const { data, properties } = bindings;
    const diParams = [];
    const additional = [getOnGridReadyCode(bindings.onGridReady, bindings.resizeToFit, data)];

    if (data) {
        diParams.push('private http: HttpClient');
    }

    const instanceMethods = bindings.instanceMethods.map(removeFunctionKeyword);
    const eventAttributes = bindings.eventHandlers
        .filter(event => event.name !== 'onGridReady')
        .map(toOutput)
        .concat('(gridReady)="onGridReady($event)"');

    const eventHandlers = bindings.eventHandlers.map(event => event.handler).map(removeFunctionKeyword);
    const externalEventHandlers = bindings.externalEventHandlers.map(handler => removeFunctionKeyword(handler.body));

    return importType => {
        const imports = getImports(bindings, componentFileNames, importType);
        const propertyAttributes = [];
        const propertyVars = [];
        const propertyAssignments = [];

        if (importType === 'modules') {
            propertyAttributes.push('[modules]="modules"');
            propertyVars.push(`public modules: Module[] = ${bindings.gridSuppliedModules};`);
        }

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
                if (!isInstanceMethod(bindings.instanceMethods, property)) {
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

        const template = getTemplate(bindings, propertyAttributes.concat(eventAttributes));

        return `
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
                .concat(instanceMethods)
                .map(snippet => snippet.trim())
                .join('\n\n')}
}

${bindings.utils.join('\n')}
`;
    };
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToAngular = vanillaToAngular;
}
