import {getFunctionName, ImportType, isInstanceMethod, removeFunctionKeyword} from './parser-utils';
import {convertTemplate, toAssignment, toConst, toInput, toMember} from './vue-utils';
import {templatePlaceholder} from "./grid-vanilla-src-parser";
import * as JSON5 from "json5";

export const GRID_WIDE_COMPONENTS = [
    'loadingCellRenderer',
    'loadingOverlayComponent',
    'noRowsOverlayComponent'
];

export const GRID_COMPONENTS = [
    'detailCellRenderer',
    'fullWidthCellRenderer',
    'groupRowRenderer',
    'groupRowInnerRenderer',
    'loadingCellRenderer',
    'loadingOverlayComponent',
    'noRowsOverlayComponent',
    'dateComponent',
    'statusPanel',
    'cellRenderer',
    'pinnedRowCellRenderer',
    'cellEditor',
    'filter',
    'floatingFilterComponent',
    'headerComponent',
    'headerGroupComponent',
    'cellRenderer',
    'tooltipComponent',
    'statusPanel',
    'toolPanel'
];

export const PARAMS_PROPERTIES = [
    'cellEditorParams', 'filterParams'
]

export const OVERRIDABLE_AG_COMPONENTS = [
    'agDateInput',
    'agColumnHeader',
    'agColumnGroupHeader',
    'agLoadingCellRenderer',
    'agLoadingOverlay',
    'agNoRowsOverlay',
    'agTextCellEditor',
    'agDetailCellRenderer',
];

export function getOnGridReadyCode(bindings: any): string {
    const {onGridReady, resizeToFit, data} = bindings;
    const additionalLines = [];

    if (onGridReady) {
        additionalLines.push(onGridReady.trim().replace(/^\{|\}$/g, ''));
    }

    if (resizeToFit) {
        additionalLines.push('params.api.sizeColumnsToFit();');
    }

    if (data) {
        const {url, callback} = data;

        const setRowDataBlock = callback.indexOf('api.setRowData') >= 0 ?
            callback.replace("params.api.setRowData(data);", "this.rowData = data;") :
            callback;

        additionalLines.push(`
            const updateData = (data) => ${setRowDataBlock};
            
            fetch(${url})
                .then(resp => resp.json())
                .then(data => updateData(data));`
        );
    }

    return `onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        ${additionalLines.length > 0 ? `\n\n        ${additionalLines.join('\n        ')}` : ''}
    }`;
}

export function isExternalVueFile(componentFileNames, component) {
    return componentFileNames.length > 0 && componentFileNames.some(fileName => fileName.toUpperCase().includes(component.toUpperCase()));
}

export function getPropertyBindings(bindings: any, componentFileNames: string[], importType: ImportType, vueComponents): [string[], string[], string[], string[]] {
    const propertyAssignments = [];
    const propertyVars = [];
    const propertyAttributes = [];

    bindings.properties
        .filter(property =>
            property.name !== 'onGridReady' &&
            property.name !== 'columnDefs'
        )
        .forEach(property => {
            if (bindings.vuePropertyBindings[property.name]) {
                const parsedObj = JSON5.parse(bindings.vuePropertyBindings[property.name]);
                const panelArrayName = parsedObj['toolPanels'] ? 'toolPanels' : 'statusPanels';
                if (parsedObj[panelArrayName]) {
                    parsedObj[panelArrayName].forEach(panel => {
                        Object.keys(panel).forEach(panelProperty => {
                            if (!panelProperty.startsWith('ag') && isComponent(panelProperty) && typeof panel[panelProperty] === 'string') {
                                const parsedValue = panel[panelProperty].replace('AG_LITERAL_', '')
                                if (isExternalVueFile(componentFileNames, parsedValue)) {
                                    panel[panelProperty] = parsedValue;
                                    if (!vueComponents.includes(parsedValue)) {
                                        vueComponents.push(parsedValue)
                                    }
                                }
                            }
                        })
                    });
                    property.value = JSON.stringify(parsedObj);
                }

                propertyAttributes.push(toInput(property));
                propertyVars.push(toMember(property));
                propertyAssignments.push(toAssignment(property));
            } else if (componentFileNames.length > 0 && (property.name === 'components' || property.name === 'frameworkComponents')) {
                if (bindings.frameworkComponents) {
                    const userAgComponents = OVERRIDABLE_AG_COMPONENTS.filter(agComponentName => bindings.frameworkComponents.some(component => component.name === agComponentName))
                        .map(agComponentName => `${agComponentName}: '${agComponentName}'`);

                    vueComponents.push(...userAgComponents);
                }
            } else if (property.value === 'true' || property.value === 'false') {
                propertyAttributes.push(toConst(property));
            } else if (property.value === null || property.value === 'null') {
                propertyAttributes.push(toInput(property));
            } else if (GRID_WIDE_COMPONENTS.includes(property.name)) {
                const parsedValue = `${property.value.replace('AG_LITERAL_', '')}`;

                propertyAttributes.push(toInput(property));
                propertyVars.push(toMember(property));
                propertyAssignments.push(`this.${property.name} = '${parsedValue}'`);
                if (isExternalVueFile(componentFileNames, parsedValue)) {
                    if (!vueComponents.includes(parsedValue)) {
                        vueComponents.push(parsedValue)
                    }
                }
            } else {
                // for when binding a method
                // see javascript-grid-keyboard-navigation for an example
                // tabToNextCell needs to be bound to the react component
                if (!isInstanceMethod(bindings.instanceMethods, property)) {
                    propertyAttributes.push(toInput(property));

                    if (property.name !== 'defaultColDef') {
                        propertyVars.push(toMember(property));
                    }
                }


                if (property.name !== 'defaultColDef') {
                    propertyAssignments.push(toAssignment(property));
                }
            }
        });

    if (importType === 'modules') {
        propertyAttributes.push(':modules="modules"');
        propertyVars.push(`modules: ${bindings.gridSuppliedModules}`);
    }

    if (bindings.data && bindings.data.callback.indexOf('api.setRowData') >= 0) {
        if (propertyAttributes.filter(item => item.indexOf(':rowData') >= 0).length === 0) {
            propertyAttributes.push(':rowData="rowData"');
        }

        if (propertyVars.filter(item => item.indexOf('rowData') >= 0).length === 0) {
            propertyVars.push('rowData: null');
        }
    }

    return [propertyAssignments, propertyVars, propertyAttributes, vueComponents];
}

export function getTemplate(bindings: any, attributes: string[]): string {
    const {gridSettings} = bindings;
    const style = gridSettings.noStyle ? '' : `style="width: ${gridSettings.width}; height: ${gridSettings.height};"`;

    const agGridTag = `<ag-grid-vue
    ${bindings.gridSettings.myGridReference ? 'id="myGrid"' : ''}
    ${style}
    class="${gridSettings.theme}"
    :columnDefs="columnDefs"
    @grid-ready="onGridReady"
    ${attributes.join('\n    ')}></ag-grid-vue>`;

    const template = bindings.template ? bindings.template.replace(templatePlaceholder, agGridTag) : agGridTag;

    return convertTemplate(template);
}

export function getAllMethods(bindings: any): [string[], string[], string[], string[]] {
    const eventHandlers = bindings.eventHandlers
        .filter(event => event.name != 'onGridReady')
        .map(event => event.handler)
        .map(removeFunctionKeyword);

    const externalEventHandlers = bindings.externalEventHandlers.map(event => event.body).map(removeFunctionKeyword);
    const instanceMethods = bindings.instanceMethods.map(removeFunctionKeyword);

    const utilFunctions = bindings.utils.map(body => {
        const funcName = getFunctionName(body);

        if (funcName) {
            return `window.${funcName} = ${body}`;

        }

        // probably a var
        return body;
    }).sort((a, b) => {
        const aIsAssignedToWindow = a.startsWith('window.');
        const bIsAssignedToWindow = b.startsWith('window.');

        if (aIsAssignedToWindow && bIsAssignedToWindow) {
            return 0;
        }
        if (aIsAssignedToWindow) {
            return -1;
        }
        if (bIsAssignedToWindow) {
            return 1;
        }

        return 0;
    });

    return [eventHandlers, externalEventHandlers, instanceMethods, utilFunctions];
}

export function isComponent(property) {
    return GRID_COMPONENTS.indexOf(property) !== -1;
}

export function isParamsProperty(property) {
    return PARAMS_PROPERTIES.indexOf(property) !== -1;

}

export function convertColumnDefs(rawColumnDefs, userComponentNames, vueComponents, componentFileNames): string[] {
    const columnDefs = [];
    const parseFunction = value => value.replace('AG_FUNCTION_', '').replace(/^function\s*\((.*?)\)/, '($1) => ');

    const processObject = obj => {
        const output = JSON.stringify(obj);

        return output
            .replace(/"AG_LITERAL_(.*?)"/g, '$1')
            .replace(/"AG_FUNCTION_(.*?)"/g, match => parseFunction(JSON.parse(match)));
    };

    rawColumnDefs.forEach(rawColumnDef => {
        const columnProperties = [];
        let children = [];

        Object.keys(rawColumnDef).forEach(columnProperty => {
            if (columnProperty === 'children') {
                children = convertColumnDefs(rawColumnDef[columnProperty], userComponentNames, vueComponents, componentFileNames);
            } else {
                let value = rawColumnDef[columnProperty];

                if (isParamsProperty(columnProperty) && value.cellRenderer) {
                    value.cellRenderer = `${value.cellRenderer.replace('AG_LITERAL_', '')}`;
                }

                if (typeof value === "string") {
                    if (value.startsWith('AG_LITERAL_')) {
                        // values starting with AG_LITERAL_ are actually function references
                        // grid-vanilla-src-parser converts the original values to a string that we can convert back to the function reference here
                        // ...all of this is necessary so that we can parse the json string
                        const parsedValue = `${value.replace('AG_LITERAL_', '')}`;
                        if (isComponent(columnProperty) && isExternalVueFile(componentFileNames, parsedValue)) {
                            columnProperties.push(`${columnProperty}:'${parsedValue}'`);
                            if (!vueComponents.includes(parsedValue)) {
                                vueComponents.push(parsedValue)
                            }
                        } else {
                            columnProperties.push(`${columnProperty}:${parsedValue}`);
                        }

                    } else if (value.startsWith('AG_FUNCTION_')) {
                        // values starting with AG_FUNCTION_ are actually function definitions, which we extract and
                        // turn into lambda functions here
                        columnProperties.push(`${columnProperty}:${parseFunction(value)}`);
                    } else {
                        // }
                        // ensure any double quotes inside the string are replaced with single quotes
                        columnProperties.push(`${columnProperty}:"${value.replace(/(?<!\\)"/g, '\'')}"`);
                    }
                } else if (typeof value === 'object') {
                    columnProperties.push(`${columnProperty}:${processObject(value)}`);
                } else {
                    columnProperties.push(`${columnProperty}:${value}`);
                }
            }
        });

        if (children.length !== 0) {
            columnProperties.push(`children: [${children.join(',\n')}]`);
        }
        columnDefs.push(`{${columnProperties.join(',\n')}}`);
    });

    return columnDefs;
}

export function convertDefaultColDef(defaultColDef, vueComponents): string {
    const result = [];
    const perLine = defaultColDef.split('\n');
    perLine.forEach(line => {
        if (line.includes('tooltipComponent') ||
            (line.includes('filter') && !line.includes("'ag") && !line.trim().startsWith("//") && !line.includes("true")) && !line.includes('filterMenuTab')) {

            const component = line.match(/.*:\s*(.*),/) ? line.match(/.*:\s*(.*),/)[1] : line.match(/.*:\s*(.*)$/)[1]
            line = line.replace(component, `'${component}'`)
            result.push(line);

            if (!vueComponents.includes(component)) {
                vueComponents.push(component)
            }
        } else {
            result.push(line);
        }
    })

    return result.join('\n');
}

export const getColumnDefs = (bindings: any, vueComponents: any[], componentFileNames) => {
    const columnDefs = bindings.parsedColDefs ? convertColumnDefs(JSON5.parse(bindings.parsedColDefs), bindings.components.map(component => component.name), vueComponents, componentFileNames) : null;
    if (!columnDefs) {
        const columnDefProperty = bindings.properties.filter(property => property.name === 'columnDefs');
        if (columnDefProperty && columnDefProperty.length === 1 && columnDefProperty[0].value) {
            return columnDefProperty[0].value;
        }

        return [];
    }

    return `[${columnDefs}]`;
}

