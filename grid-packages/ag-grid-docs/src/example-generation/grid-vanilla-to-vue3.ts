import { getModuleRegistration, ImportType } from './parser-utils';
import { getImport, toOutput } from './vue-utils';
import { convertDefaultColDef, getAllMethods, getColumnDefs, getOnGridReadyCode, getPropertyBindings, getTemplate } from "./grid-vanilla-to-vue-common";

function getModuleImports(bindings: any, componentFileNames: string[]): string[] {
    const { gridSettings } = bindings;

    let imports = [
        "import { createApp } from 'vue';",
        "import { AgGridVue } from '@ag-grid-community/vue3';",
    ];

    imports.push("import '@ag-grid-community/styles/ag-grid.css';");
    // to account for the (rare) example that has more than one class...just default to alpine if it does
    const theme = gridSettings.theme || 'ag-theme-alpine';
    imports.push(`import "@ag-grid-community/styles/${theme}.css";`);

    if (componentFileNames) {
        imports.push(...componentFileNames.map(componentFileName => getImport(componentFileName, 'Vue', '')));
    }

    imports = [...imports, ...getModuleRegistration(bindings)];

    return imports;
}

function getPackageImports(bindings: any, componentFileNames: string[]): string[] {
    const { gridSettings } = bindings;

    const imports = [
        "import { createApp } from 'vue';",
        "import { AgGridVue } from 'ag-grid-vue3';",
    ];

    if (gridSettings.enterprise) {
        imports.push("import 'ag-grid-enterprise';");
    }

    imports.push("import 'ag-grid-community/dist/styles/ag-grid.css';");

    // to account for the (rare) example that has more than one class...just default to alpine if it does
    const theme = gridSettings.theme || 'ag-theme-alpine';
    imports.push(`import 'ag-grid-community/dist/styles/${theme}.css';`);

    if (componentFileNames) {
        imports.push(...componentFileNames.map(componentFileName => getImport(componentFileName, 'Vue', '')));
    }

    return imports;
}

function getImports(bindings: any, componentFileNames: string[], importType: ImportType): string[] {
    if (importType === 'packages') {
        return getPackageImports(bindings, componentFileNames);
    } else {
        return getModuleImports(bindings, componentFileNames);
    }
}

export function vanillaToVue3(bindings: any, componentFileNames: string[]): (importType: ImportType) => string {
    const vueComponents = bindings.components.map(component => `${component.name}:${component.value}`);

    const onGridReady = getOnGridReadyCode(bindings);
    const eventAttributes = bindings.eventHandlers.filter(event => event.name !== 'onGridReady').map(toOutput);
    const [eventHandlers, externalEventHandlers, instanceMethods, utilFunctions] = getAllMethods(bindings);
    const columnDefs = getColumnDefs(bindings, vueComponents, componentFileNames);
    const defaultColDef = bindings.defaultColDef ? convertDefaultColDef(bindings.defaultColDef, vueComponents, componentFileNames) : null;

    return importType => {
        const imports = getImports(bindings, componentFileNames, importType);
        const [propertyAssignments, propertyVars, propertyAttributes] = getPropertyBindings(bindings, componentFileNames, importType, vueComponents);
        const template = getTemplate(bindings, propertyAttributes.concat(eventAttributes));

        return `
${imports.join('\n')}

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
            columnApi: null,
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
                .map(snippet => `${snippet.trim()},`)
                .join('\n')}
    }
}

${utilFunctions.map(snippet => `${snippet.trim()}`).join('\n\n')}

createApp(VueExample)
    .mount("#app")

`;
    };
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToVue3 = vanillaToVue3;
}
