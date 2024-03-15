import { ExampleConfig, ImportType, ParsedBindings } from '../types';
import {
    convertDefaultColDef,
    getAllMethods,
    getColumnDefs,
    getTemplate,
    GRID_WIDE_COMPONENTS,
    isComponent,
    isExternalVueFile,
    OVERRIDABLE_AG_COMPONENTS,
} from './grid-vanilla-to-vue-common';
import {
    addEnterprisePackage,
    addLicenseManager,
    addRelativeImports,
    getActiveTheme,
    getIntegratedDarkModeCode,
    isInstanceMethod,
    preferParamsApi,
    replaceGridReadyRowData,
} from './parser-utils';
import { getImport, toAssignment, toConst, toInput, toMember, toOutput } from './vue-utils';
import * as JSON5 from 'json5';
const path = require('path');

function getOnGridReadyCode(bindings: ParsedBindings): string {
    const { onGridReady, data } = bindings;
    const additionalLines = [];

    if (onGridReady) {
        additionalLines.push(onGridReady.trim().replace(/^\{|\}$/g, ''));
    }

    if (data) {
        const { url, callback } = data;

        const setRowDataBlock = replaceGridReadyRowData(callback, 'this.rowData');

        additionalLines.push(`
            const updateData = (data) => ${setRowDataBlock};
            
            fetch(${url})
                .then(resp => resp.json())
                .then(data => updateData(data));`);
    }
    const additional = preferParamsApi(
        additionalLines.length > 0 ? `\n\n        ${additionalLines.join('\n        ')}` : ''
    );
    return `onGridReady(params) {
        ${getIntegratedDarkModeCode(bindings.exampleName)}
        this.gridApi = params.api;
        ${additional}
    }`;
}

function getModuleImports(
    bindings: ParsedBindings,
    exampleConfig: ExampleConfig,
    componentFileNames: string[],
    allStylesheets: string[]
): string[] {
    const { inlineGridStyles } = bindings;

    let imports = ["import Vue from 'vue';", "import { AgGridVue } from '@ag-grid-community/vue';"];

    addLicenseManager(imports, exampleConfig, false);

    imports.push("import '@ag-grid-community/styles/ag-grid.css';");
    // to account for the (rare) example that has more than one class...just default to quartz if it does
    // we strip off any '-dark' from the theme when loading the CSS as dark versions are now embedded in the
    // "source" non dark version
    const theme = inlineGridStyles.theme ? inlineGridStyles.theme.replace('-dark', '') : 'ag-theme-quartz';
    imports.push(`import "@ag-grid-community/styles/${theme}.css";`);

    if (allStylesheets && allStylesheets.length > 0) {
        allStylesheets.forEach((styleSheet) => imports.push(`import './${path.basename(styleSheet)}';`));
    }

    if (componentFileNames) {
        imports.push(...componentFileNames.map((componentFileName) => getImport(componentFileName, 'Vue', '')));
    }
    addRelativeImports(bindings, imports, 'js');

    if (bindings.moduleRegistration) {
        bindings.imports.forEach((importStatement) => {
            if(importStatement.imports.some(m => m.includes('Module'))){
                imports.push(`import { ${importStatement.imports.join(', ')} } from ${importStatement.module};`)
            }
        })
        imports.push(bindings.moduleRegistration);
    }

    return imports;
}

function getPackageImports(
    bindings: ParsedBindings,
    exampleConfig: ExampleConfig,
    componentFileNames: string[],
    allStylesheets: string[]
): string[] {
    const { inlineGridStyles } = bindings;

    const imports = ["import Vue from 'vue';", "import { AgGridVue } from 'ag-grid-vue';"];

    addEnterprisePackage(imports, bindings);
    addLicenseManager(imports, exampleConfig, true);

    imports.push("import 'ag-grid-community/styles/ag-grid.css';");

    // to account for the (rare) example that has more than one class...just default to quartz if it does
    // we strip off any '-dark' from the theme when loading the CSS as dark versions are now embedded in the
    // "source" non dark version
    const theme = inlineGridStyles.theme ? inlineGridStyles.theme.replace('-dark', '') : 'ag-theme-quartz';
    imports.push(`import 'ag-grid-community/styles/${theme}.css';`);

    if (allStylesheets && allStylesheets.length > 0) {
        allStylesheets.forEach((styleSheet) => imports.push(`import './${path.basename(styleSheet)}';`));
    }

    if (componentFileNames) {
        imports.push(...componentFileNames.map((componentFileName) => getImport(componentFileName, 'Vue', '')));
    }
    addRelativeImports(bindings, imports, 'js');

    return imports;
}

function getImports(
    bindings: ParsedBindings,
    exampleConfig: ExampleConfig,
    componentFileNames: string[],
    importType: ImportType,
    allStylesheets: string[]
): string[] {
    if (importType === 'packages') {
        return getPackageImports(bindings, exampleConfig, componentFileNames, allStylesheets);
    } else {
        return getModuleImports(bindings, exampleConfig, componentFileNames, allStylesheets);
    }
}

export function getPropertyBindings(
    bindings: ParsedBindings,
    componentFileNames: string[],
    importType: ImportType,
    vueComponents
): [string[], string[], string[], string[]] {
    const propertyAssignments = [];
    const propertyVars = [];
    const propertyAttributes = [];

    bindings.properties
        .filter((property) => property.name !== 'onGridReady' && property.name !== 'columnDefs')
        .forEach((property) => {
            if (bindings.vuePropertyBindings[property.name]) {
                const parsedObj = JSON5.parse(bindings.vuePropertyBindings[property.name]);
                const panelArrayName = parsedObj['toolPanels'] ? 'toolPanels' : 'statusPanels';
                if (parsedObj[panelArrayName]) {
                    parsedObj[panelArrayName].forEach((panel) => {
                        Object.keys(panel).forEach((panelProperty) => {
                            if (
                                !panelProperty.startsWith('ag') &&
                                isComponent(panelProperty) &&
                                typeof panel[panelProperty] === 'string'
                            ) {
                                const parsedValue = panel[panelProperty].replace('AG_LITERAL_', '');
                                if (isExternalVueFile(componentFileNames, parsedValue)) {
                                    panel[panelProperty] = parsedValue;
                                    if (!vueComponents.includes(parsedValue)) {
                                        vueComponents.push(parsedValue);
                                    }
                                }
                            }
                        });
                    });
                    property.value = JSON.stringify(parsedObj);
                }

                propertyAttributes.push(toInput(property));
                propertyVars.push(toMember(property));
                propertyAssignments.push(toAssignment(property));
            } else if (componentFileNames.length > 0 && property.name === 'components') {
                if (bindings.components) {
                    const userAgComponents = OVERRIDABLE_AG_COMPONENTS.filter((agComponentName) =>
                        bindings.components.some((component) => component.name === agComponentName && !vueComponents.some(existingComp => existingComp.includes(agComponentName)))
                    ).map((agComponentName) => `${agComponentName}: '${agComponentName}'`);

                    vueComponents.push(...userAgComponents);
                }
            } else if (property.value === 'true' || property.value === 'false') {
                propertyAttributes.push(toConst(property));
            } else if (property.value === null || property.value === 'null') {
                propertyAttributes.push(toInput(property));
            } else if (property.name === 'groupRowRendererParams') {
                const perLine = property.value.split('\n');
                const result = [];
                perLine.forEach((line) => {
                    if (line.includes('innerRenderer')) {
                        const component = line.match(/.*:\s*(.*),/)
                            ? line.match(/.*:\s*(.*),/)[1]
                            : line.match(/.*:\s*(.*)$/)[1];
                        line = line.replace(component, `'${component}'`);
                        result.push(line);

                        if (!vueComponents.includes(component)) {
                            vueComponents.push(component);
                        }
                    } else {
                        result.push(line);
                    }
                });
                const newValue = result.join('\n');

                propertyAttributes.push(toInput(property));
                propertyVars.push(toMember(property));
                propertyAssignments.push(`this.${property.name} = ${newValue}`);
            } else if (GRID_WIDE_COMPONENTS.includes(property.name)) {
                const parsedValue = `${property.value.replace('AG_LITERAL_', '')}`;

                propertyAttributes.push(toInput(property));
                propertyVars.push(toMember(property));
                propertyAssignments.push(`this.${property.name} = '${parsedValue}'`);
                if (isExternalVueFile(componentFileNames, parsedValue)) {
                    if (!vueComponents.includes(parsedValue)) {
                        vueComponents.push(parsedValue);
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

    if (bindings.data && bindings.data.callback.indexOf("gridApi.setGridOption('rowData',") >= 0) {
        if (propertyAttributes.filter((item) => item.indexOf(':rowData') >= 0).length === 0) {
            propertyAttributes.push(':rowData="rowData"');
        }

        if (propertyVars.filter((item) => item.indexOf('rowData') >= 0).length === 0) {
            propertyVars.push('rowData: null');
        }
    }

    return [propertyAssignments, propertyVars, propertyAttributes, vueComponents];
}

export function vanillaToVue(
    bindings: ParsedBindings,
    exampleConfig: ExampleConfig,
    componentFileNames: string[],
    allStylesheets: string[]
): (importType: ImportType) => string {
    const vueComponents = bindings.components.map((component) => `${component.name}:${component.value}`);

    const onGridReady = getOnGridReadyCode(bindings);
    const eventAttributes = bindings.eventHandlers.filter((event) => event.name !== 'onGridReady').map(toOutput);
    const [eventHandlers, externalEventHandlers, instanceMethods, utilFunctions] = getAllMethods(bindings);
    const columnDefs = getColumnDefs(bindings, vueComponents, componentFileNames);
    const defaultColDef = bindings.defaultColDef
        ? convertDefaultColDef(bindings.defaultColDef, vueComponents, componentFileNames)
        : null;

    return (importType) => {
        const imports = getImports(bindings, exampleConfig, componentFileNames, importType, allStylesheets);
        const [propertyAssignments, propertyVars, propertyAttributes] = getPropertyBindings(
            bindings,
            componentFileNames,
            importType,
            vueComponents
        );
        const template = getTemplate(bindings, exampleConfig, propertyAttributes.concat(eventAttributes));

        return `
${imports.join('\n')}

${exampleConfig.licenseKey ? "// enter your license key here to suppress console message and watermark\nLicenseManager.setLicenseKey('');\n" : ''}

${bindings.classes.join('\n')}

const VueExample = {
    template: \`
        <div style="height: 100%">
            ${template}
        </div>
    \`,
    components: {
        'ag-grid-vue': AgGridVue,
        ${vueComponents.join(',\n')}
    },
    data: function() {
        return {
            columnDefs: ${columnDefs},
            gridApi: null,
            themeClass: ${getActiveTheme(bindings.inlineGridStyles.theme, false)},
            ${defaultColDef ? `defaultColDef: ${defaultColDef},` : ''}
            ${propertyVars.join(',\n')}
        }
    },
    created() {
        ${propertyAssignments.join(';\n')}        
    },
    methods: {
        ${eventHandlers
            .concat(externalEventHandlers)
            .concat(onGridReady)
            .concat(instanceMethods)
            .map((snippet) => `${snippet.trim()},`)
            .join('\n')
            .replace(/(?<!this.)gridApi(\??)(!?)/g, 'this.gridApi')}
    }
}

${utilFunctions.map((snippet) => `${snippet.trim()}`).join('\n\n')}

new Vue({
    el: '#app',
    components: {
        'my-component': VueExample
    }
});
`;
    };
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToVue = vanillaToVue;
}
