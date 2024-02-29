import { ExampleConfig } from "../types";
import { convertDefaultColDef, getAllMethods, getColumnDefs, getPropertyBindings, getTemplate } from "./grid-vanilla-to-vue-common";
import { addEnterprisePackage, getActiveTheme, getIntegratedDarkModeCode, ImportType, preferParamsApi, replaceGridReadyRowData } from './parser-utils';
import { getImport, toOutput } from './vue-utils';
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

function getModuleImports(bindings: any, exampleConfig: ExampleConfig, componentFileNames: string[], allStylesheets: string[]): string[] {
    const { inlineGridStyles } = bindings;

    let imports = ["import Vue from 'vue';", "import { AgGridVue } from '@ag-grid-community/vue';"];

    if (exampleConfig.licenseKey) {
        imports.push("import { LicenseManager } from '@ag-grid-enterprise/core';");
    }

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

    return imports;
}

function getPackageImports(bindings: any, exampleConfig: ExampleConfig, componentFileNames: string[], allStylesheets: string[]): string[] {
    const { inlineGridStyles } = bindings;

    const imports = ["import Vue from 'vue';", "import { AgGridVue } from 'ag-grid-vue';"];

    addEnterprisePackage(imports, bindings);
    if (exampleConfig.licenseKey) {
        imports.push("import { LicenseManager } from 'ag-grid-enterprise';");
    }

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

    return imports;
}

function getImports(bindings: any, exampleConfig: ExampleConfig, componentFileNames: string[], importType: ImportType, allStylesheets: string[]): string[] {
    if (importType === 'packages') {
        return getPackageImports(bindings, exampleConfig, componentFileNames, allStylesheets);
    } else {
        return getModuleImports(bindings, exampleConfig, componentFileNames, allStylesheets);
    }
}

export function vanillaToVue(bindings: any, exampleConfig: ExampleConfig, componentFileNames: string[], allStylesheets: string[]): (importType: ImportType) => string {
    const vueComponents = bindings.components.map(component => `${component.name}:${component.value}`);

    const onGridReady = getOnGridReadyCode(bindings);
    const eventAttributes = bindings.eventHandlers.filter((event) => event.name !== 'onGridReady').map(toOutput);
    const [eventHandlers, externalEventHandlers, instanceMethods, utilFunctions] = getAllMethods(bindings);
    const columnDefs = getColumnDefs(bindings, vueComponents, componentFileNames);
    const defaultColDef = bindings.defaultColDef
        ? convertDefaultColDef(bindings.defaultColDef, vueComponents, componentFileNames)
        : null;

    return importType => {
        const imports = getImports(bindings, exampleConfig, componentFileNames, importType, allStylesheets);
        const [propertyAssignments, propertyVars, propertyAttributes] = getPropertyBindings(bindings, componentFileNames, importType, vueComponents);
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
