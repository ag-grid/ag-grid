import * as JSON5 from 'json5';

import type { ExampleConfig, ParsedBindings } from '../types';
import { templatePlaceholder } from './grid-vanilla-src-parser';
import { getFunctionName, removeFunctionKeyword } from './parser-utils';
import { convertTemplate } from './vue-utils';

export const GRID_WIDE_COMPONENTS = [
    'loadingCellRenderer',
    'loadingOverlayComponent',
    'noRowsOverlayComponent',
    'fullWidthCellRenderer',
    'detailCellRenderer',
    'dragAndDropImageComponent',
];

export const GRID_COMPONENTS = [
    'groupRowRenderer',
    'groupRowInnerRenderer',
    'loadingCellRenderer',
    'loadingOverlayComponent',
    'noRowsOverlayComponent',
    'dragAndDropImageComponent',
    'dateComponent',
    'statusPanel',
    'cellRenderer',
    'cellEditor',
    'filter',
    'floatingFilterComponent',
    'headerComponent',
    'headerGroupComponent',
    'cellRenderer',
    'tooltipComponent',
    'statusPanel',
    'toolPanel',
    'menuItem',
];

export const PARAMS_PROPERTIES = ['cellEditorParams', 'filterParams'];

export const OVERRIDABLE_AG_COMPONENTS = [
    'agDragAndDropImage',
    'agDateInput',
    'agColumnHeader',
    'agColumnGroupHeader',
    'agLoadingCellRenderer',
    'agSkeletonCellRenderer',
    'agLoadingOverlay',
    'agNoRowsOverlay',
    'agTextCellEditor',
    'agDetailCellRenderer',
];

export function isExternalVueFile(componentFileNames, component) {
    return (
        componentFileNames.length > 0 &&
        componentFileNames.some((fileName) => fileName.toUpperCase().includes(component.toUpperCase()))
    );
}

export function getTemplate(bindings: ParsedBindings, exampleConfig: ExampleConfig, attributes: string[]): string {
    const { inlineGridStyles } = bindings;
    const style = exampleConfig.noStyle
        ? ''
        : `style="width: ${inlineGridStyles.width}; height: ${inlineGridStyles.height};"`;

    const agGridTag = `<ag-grid-vue
    ${exampleConfig.myGridReference ? 'id="myGrid"' : ''}
    ${style}
    :columnDefs="columnDefs"
    @grid-ready="onGridReady"
    ${attributes.join('\n    ')}></ag-grid-vue>`;

    const template = bindings.template ? bindings.template.replace(templatePlaceholder, agGridTag) : agGridTag;

    return convertTemplate(template);
}

export function getAllMethods(bindings: ParsedBindings): [string[], string[], string[], string[]] {
    const eventHandlers = bindings.eventHandlers
        .filter((event) => event.name != 'onGridReady')
        .map((event) => event.handler)
        .map(removeFunctionKeyword);

    const externalEventHandlers = bindings.externalEventHandlers.map((event) => event.body).map(removeFunctionKeyword);
    const instanceMethods = bindings.instanceMethods.map(removeFunctionKeyword);

    const utilFunctions = bindings.utils
        .map((body) => {
            const funcName = getFunctionName(body);

            if (funcName) {
                return `window.${funcName} = ${body}`;
            }

            // probably a var
            return body;
        })
        .sort((a, b) => {
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

export function addToVueComponents(componentFileNames, vueComponents, property, componentName) {
    if (isComponent(property) && isExternalVueFile(componentFileNames, componentName)) {
        if (!vueComponents.includes(componentName)) {
            vueComponents.push(componentName);
        }
    }
}

export function convertColumnDefs(rawColumnDefs, userComponentNames, vueComponents, componentFileNames): string[] {
    const columnDefs = [];
    const parseFunction = (value) => value.replace('AG_FUNCTION_', '').replace(/^function\s*\((.*?)\)/, '($1) => ');

    const processObject = (obj) => {
        const output = JSON.stringify(obj);

        return output
            .replace(/"AG_LITERAL_(.*?)"/g, '$1')
            .replace(/"AG_FUNCTION_(.*?)"/g, (match) => parseFunction(JSON.parse(match)));
    };

    rawColumnDefs.forEach((rawColumnDef) => {
        const columnProperties = [];
        let children = [];

        Object.keys(rawColumnDef).forEach((columnProperty) => {
            if (columnProperty === 'children') {
                children = convertColumnDefs(
                    rawColumnDef[columnProperty],
                    userComponentNames,
                    vueComponents,
                    componentFileNames
                );
            } else {
                const value = rawColumnDef[columnProperty];
                if (isParamsProperty(columnProperty)) {
                    if (value.cellRenderer) {
                        const component = `${value.cellRenderer.replace('AG_LITERAL_', '')}`;
                        if (isExternalVueFile(componentFileNames, component)) {
                            value.cellRenderer = component;
                            addToVueComponents(componentFileNames, vueComponents, 'cellRenderer', value.cellRenderer);
                        }
                    }
                    if (value.loadingCellRenderer) {
                        const component = `${value.loadingCellRenderer.replace('AG_LITERAL_', '')}`;
                        if (isExternalVueFile(componentFileNames, component)) {
                            value.loadingCellRenderer = component;
                            addToVueComponents(
                                componentFileNames,
                                vueComponents,
                                'loadingCellRenderer',
                                value.loadingCellRenderer
                            );
                        }
                    }
                    if (value.filters) {
                        value.filters.forEach((filter) => {
                            if (filter.floatingFilterComponent) {
                                const component = `${filter.floatingFilterComponent.replace('AG_LITERAL_', '')}`;
                                if (isExternalVueFile(componentFileNames, component)) {
                                    filter.floatingFilterComponent = component;
                                    addToVueComponents(
                                        componentFileNames,
                                        vueComponents,
                                        'floatingFilterComponent',
                                        filter.floatingFilterComponent
                                    );
                                }
                            }
                            if (filter.filter) {
                                const component = `${filter.filter.replace('AG_LITERAL_', '')}`;
                                if (isExternalVueFile(componentFileNames, component)) {
                                    filter.filter = component;
                                    addToVueComponents(componentFileNames, vueComponents, 'filter', filter.filter);
                                }
                            }
                        });
                    }
                }

                if (typeof value === 'string') {
                    if (value.startsWith('AG_LITERAL_')) {
                        // values starting with AG_LITERAL_ are actually function references
                        // grid-vanilla-src-parser converts the original values to a string that we can convert back to the function reference here
                        // ...all of this is necessary so that we can parse the json string
                        const parsedValue = `${value.replace('AG_LITERAL_', '')}`;
                        if (isComponent(columnProperty) && isExternalVueFile(componentFileNames, parsedValue)) {
                            columnProperties.push(`${columnProperty}:'${parsedValue}'`);
                            if (!vueComponents.includes(parsedValue)) {
                                vueComponents.push(parsedValue);
                            }
                        } else {
                            columnProperties.push(`${columnProperty}:${parsedValue}`);
                        }
                    } else if (value.startsWith('AG_FUNCTION_')) {
                        let parsedValue = parseFunction(value);

                        if (columnProperty === 'cellRendererSelector') {
                            const component = parsedValue.match(/.*component:\s*(.*),/)
                                ? parsedValue.match(/.*:\s*(.*),/)[1]
                                : parsedValue.match(/.*:\s*(.*)$/)[1];
                            if (component) {
                                parsedValue = parsedValue.replace(component, `'${component}'`);
                                if (
                                    isExternalVueFile(componentFileNames, component) &&
                                    !vueComponents.includes(component)
                                ) {
                                    vueComponents.push(component);
                                }
                            }
                        }

                        if (columnProperty === 'loadingCellRendererSelector') {
                            const component = parsedValue.match(/.*component:\s*(.*),/)
                                ? parsedValue.match(/.*:\s*(.*),/)[1]
                                : parsedValue.match(/.*:\s*(.*)$/)[1];
                            if (component) {
                                parsedValue = parsedValue.replace(component, `'${component}'`);
                                if (
                                    isExternalVueFile(componentFileNames, component) &&
                                    !vueComponents.includes(component)
                                ) {
                                    vueComponents.push(component);
                                }
                            }
                        }

                        // values starting with AG_FUNCTION_ are actually function definitions, which we extract and
                        // turn into lambda functions here
                        columnProperties.push(`${columnProperty}:${parsedValue}`);
                    } else {
                        // }
                        // ensure any double quotes inside the string are replaced with single quotes
                        columnProperties.push(`${columnProperty}:"${value.replace(/(?<!\\)"/g, "'")}"`);
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

export function convertDefaultColDef(defaultColDef, vueComponents, componentFileNames): string {
    const result = [];
    const perLine = defaultColDef.split('\n');
    perLine.forEach((line) => {
        if (
            line.includes('tooltipComponent') ||
            (line.includes('cellRenderer') && !line.includes("'ag")) ||
            (line.includes('loadingCellRenderer') && !line.includes("'ag")) ||
            (line.includes('headerComponent') && !line.includes('headerComponentParams')) ||
            (line.includes('filter') &&
                line.includes(':') &&
                !line.includes("'ag") &&
                !line.trim().startsWith('//') &&
                !line.includes('true') &&
                !line.includes('filterMenuTab'))
        ) {
            const component = line.match(/.*:\s*(.*),/) ? line.match(/.*:\s*(.*),/)[1] : line.match(/.*:\s*(.*)$/)[1];
            if (isExternalVueFile(componentFileNames, component)) {
                line = line.replace(component, `'${component}'`);

                if (!vueComponents.includes(component)) {
                    vueComponents.push(component);
                }
            }
            result.push(line);
        } else {
            result.push(line);
        }
    });

    return result.join('\n');
}

export const getColumnDefs = (bindings: ParsedBindings, vueComponents: any[], componentFileNames) => {
    const columnDefs = bindings.parsedColDefs
        ? convertColumnDefs(
              JSON5.parse(bindings.parsedColDefs),
              bindings.components.map((component) => component.name),
              vueComponents,
              componentFileNames
          )
        : null;
    if (!columnDefs) {
        const columnDefProperty = bindings.properties.filter((property) => property.name === 'columnDefs');
        if (columnDefProperty && columnDefProperty.length === 1 && columnDefProperty[0].value) {
            return columnDefProperty[0].value;
        }

        return [];
    }

    return `[${columnDefs}]`;
};
