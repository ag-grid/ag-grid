import { convertTemplate, getImport, toMemberWithValue, toConst, toInput, toOutput } from './angular-utils';
import { templatePlaceholder } from "./grid-vanilla-src-parser";
import { addBindingImports, getPropertyInterfaces, ImportType, isInstanceMethod, removeFunctionKeyword } from './parser-utils';

function getOnGridReadyCode(readyCode: string, resizeToFit: boolean, data: { url: string, callback: string; }, hasApi: boolean, hasColApi: boolean): string {
    const additionalLines = [];

    if (readyCode) {
        additionalLines.push(readyCode.trim().replace(/^\{|\}$/g, ''));
    }

    if (resizeToFit) {
        additionalLines.push('params.api.sizeColumnsToFit();');
    }

    if (data) {
        const { url, callback } = data;

        if (callback.indexOf('api!.setRowData') !== -1) {
            const setRowDataBlock = callback.replace('params.api!.setRowData(data)', 'this.rowData = data');
            additionalLines.push(`this.http.get<any[]>(${url}).subscribe(data => ${setRowDataBlock});`);
        } else {
            additionalLines.push(`this.http.get<any[]>(${url}).subscribe(data => ${callback});`);
        }
    }

    return `
    onGridReady(params: GridReadyEvent) {
        ${hasApi ? 'this.gridApi = params.api;' : ''}${hasColApi ? 'this.gridColumnApi = params.columnApi;' : ''}${additionalLines.length > 0 ? `\n\n        ${additionalLines.join('\n        ')}` : ''}
    }`;
}

function getModuleImports(bindings: any, componentFileNames: string[]): string[] {
    const { gridSettings, imports: bindingImports, properties } = bindings;

    const imports = ["import { Component } from '@angular/core';"];

    if (bindings.data) {
        imports.push("import { HttpClient } from '@angular/common/http';");
    }

    imports.push("import '@ag-grid-community/styles/ag-grid.css';");

    // to account for the (rare) example that has more than one class...just default to balham if it does
    const theme = gridSettings.theme || 'ag-theme-alpine';
    imports.push(`import "@ag-grid-community/styles/${theme}.css";`);

    let propertyInterfaces = getPropertyInterfaces(properties);
    const bImports = [...(bindingImports || [])];
    bImports.push({
        module: `'@ag-grid-community/core'`,
        isNamespaced: false,
        imports: [...propertyInterfaces, 'GridReadyEvent', 'ColumnApi', 'GridApi']
    })

    if (bImports.length > 0) {
        addBindingImports(bImports, imports, false, true);
    }

    if (componentFileNames) {
        imports.push(...componentFileNames.map(getImport));
    }

    imports.push('// Required feature modules are registered in app.module.ts')

    return imports;
}

function getPackageImports(bindings: any, componentFileNames: string[]): string[] {
    const { gridSettings, imports: bindingImports, properties } = bindings;
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

    let propertyInterfaces = getPropertyInterfaces(properties);
    const bImports = [...(bindingImports || [])];
    bImports.push({
        module: `'ag-grid-community'`,
        isNamespaced: false,
        imports: [...propertyInterfaces, 'GridReadyEvent', 'ColumnApi', 'GridApi']
    })

    if (bImports.length > 0) {
        addBindingImports(bImports, imports, true, true);
    }

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
    ${style}
    ${gridSettings.myGridReference ? 'id="myGrid"' : ''}
    class="${gridSettings.theme}"
    ${attributes.join('\n    ')}
    ></ag-grid-angular>`;

    const template = bindings.template ? bindings.template.replace(templatePlaceholder, agGridTag) : agGridTag;

    return convertTemplate(template);
}

export function vanillaToAngular(bindings: any, componentFileNames: string[]): (importType: ImportType) => string {
    const { data, properties, typeDeclares, interfaces } = bindings;
    const diParams = [];

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

        properties.filter(property => property.name !== 'onGridReady').forEach(property => {
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
                }

                propertyAssignments.push(toMemberWithValue(property));
            }
        });

        if (!propertyAttributes.find(item => item.indexOf('[rowData]') >= 0)) {
            propertyAttributes.push('[rowData]="rowData"');
        }

        if (!propertyAssignments.find(item => item.indexOf('rowData') >= 0)) {
            propertyAssignments.push('public rowData!: any[];');
        }

        const template = getTemplate(bindings, propertyAttributes.concat(eventAttributes));

        const componentForCheckBody = eventHandlers
            .concat(externalEventHandlers)
            .concat(instanceMethods)
            .map(snippet => snippet.trim())
            .join('\n\n');

        const hasGridApi = componentForCheckBody.includes('gridApi');
        const hasGridColumnApi = componentForCheckBody.includes('gridColumnApi');

        const additional = [getOnGridReadyCode(bindings.onGridReady, bindings.resizeToFit, data, hasGridApi, hasGridColumnApi)];
        const componentBody = eventHandlers
            .concat(externalEventHandlers)
            .concat(additional)
            .concat(instanceMethods)
            .map(snippet => snippet.trim())
            .join('\n\n')
            // We do not need the non-null assertion in component code as already applied to the declaration for the apis.
            .replace(/gridApi!\./g, 'gridApi.')
            .replace(/gridColumnApi!\./g, 'gridColumnApi.');

        return `
${imports.join('\n')}${typeDeclares?.length > 0 ? '\n' + typeDeclares.join('\n') : ''}${interfaces?.length > 0 ? '\n' + interfaces.join('\n') : ''}

@Component({
    selector: 'my-app',
    template: \`${template}\`
})

export class AppComponent {
${hasGridApi ? '    private gridApi!: GridApi;\n' : ''}${hasGridColumnApi ? '    private gridColumnApi!: ColumnApi;\n' : ''}
    ${propertyVars.join('\n')}
    ${propertyAssignments.join(';\n')}

${diParams.length > 0 ?
                `    constructor(${diParams.join(', ')}) {
}

`: ''}
    ${componentBody}
}

${bindings.classes.join('\n')}

${bindings.utils.join('\n')}
`;
    };
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToAngular = vanillaToAngular;
}
