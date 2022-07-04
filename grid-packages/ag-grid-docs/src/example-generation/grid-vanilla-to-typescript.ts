import {addBindingImports, addGenericInterfaceImport, getModuleRegistration, ImportType} from './parser-utils';

const path = require('path');
const fs = require('fs-extra');

export function toTitleCase(value) {
    return value[0].toUpperCase() + value.slice(1);
}

export function getImport(filename: string) {
    const componentName = filename.split('.')[0];
    return `import { ${toTitleCase(componentName)} } from './${componentName}';`;
}

function getPropertyInterfaces(properties) {
    let propTypesUsed = [];
    properties.forEach(prop => {
        if (prop.typings?.typesToInclude?.length > 0) {
            propTypesUsed = [...propTypesUsed, ...prop.typings.typesToInclude]
        }
    });
    return [...new Set(propTypesUsed)];
}

function getModuleImports(bindings: any, allStylesheets: string[]): string[] {
    const {gridSettings, imports: bindingImports, properties} = bindings;

    let imports = [];
    imports.push("import '@ag-grid-community/styles/ag-grid.css';");
    // to account for the (rare) example that has more than one class...just default to alpine if it does
    // we strip off any '-dark' from the theme when loading the CSS as dark versions are now embedded in the
    // "source" non dark version
    const theme = gridSettings.theme ? gridSettings.theme.replace('-dark', '') : 'ag-theme-alpine';
    imports.push(`import "@ag-grid-community/styles/${theme}.css";`);

    let propertyInterfaces = getPropertyInterfaces(properties);
    const bImports = [...(bindingImports || [])];
    bImports.push({
        module: `'@ag-grid-community/core'`,
        isNamespaced: false,
        imports: [...propertyInterfaces]
    })

    if (bImports.length > 0) {
        addBindingImports(bImports, imports, false, false);
    }

    addGenericInterfaceImport(imports, bindings.tData, bindings);

    imports = [...imports, ...getModuleRegistration(bindings)]

    return imports;
}

function getPackageImports(bindings: any, allStylesheets: string[]): string[] {
    const {gridSettings, imports: bindingImports, properties} = bindings;
    const imports = [];

    if (gridSettings.enterprise) {
        imports.push("import 'ag-grid-enterprise';");
    }

    imports.push("import 'ag-grid-community/styles/ag-grid.css';");

    // to account for the (rare) example that has more than one class...just default to alpine if it does
    // we strip off any '-dark' from the theme when loading the CSS as dark versions are now embedded in the
    // "source" non dark version
    const theme = gridSettings.theme ? gridSettings.theme.replace('-dark', '') : 'ag-theme-alpine';
    imports.push(`import "ag-grid-community/styles/${theme}.css";`);

    let propertyInterfaces = getPropertyInterfaces(properties);
    const bImports = [...(bindingImports || [])];
    bImports.push({
        module: `'ag-grid-community'`,
        isNamespaced: false,
        imports: [...propertyInterfaces]
    })

    if (bImports.length > 0) {
        addBindingImports(bImports, imports, true, false);
    }

    addGenericInterfaceImport(imports, bindings.tData, bindings);

    return imports;
}

function getImports(bindings: any, importType: ImportType, allStylesheets: string[]): string[] {
    if (importType === "packages") {
        return getPackageImports(bindings, allStylesheets);
    } else {
        return getModuleImports(bindings, allStylesheets);
    }
}

export function vanillaToTypescript(bindings: any, mainFilePath: string, allStylesheets: string[]): (importType: ImportType) => string {
    const {gridSettings, externalEventHandlers, imports} = bindings;

    // attach external handlers to window
    let toAttach = '';
    if (externalEventHandlers?.length > 0) {
        let externalBindings = externalEventHandlers.map(e => ` (<any>window).${e.name} = ${e.name};`)
        toAttach = [
            "\n",
            "if (typeof window !== 'undefined') {",
            "// Attach external event handlers to window so they can be called from index.html",
            ...externalBindings,
            "}"
        ].join('\n');
    }

    const tsFile = fs.readFileSync(mainFilePath, 'utf8')
    let unWrapped = tsFile
        // unwrap the setup code from the DOM loaded event as the DOM is loaded before the typescript file is transpiled.
        // Regex
        // (.*DOMContentLoaded.*)\n Match the line with DOMContentLoaded
        // (.|\n)*? Match the shortest number of lines until the next part matches (body of the event handler)
        // (\n}\)) Match a }) on a new line with no indentation
        .replace(/(.*DOMContentLoaded.*)\n((.|\n)*?)(\n}\))/g, '$2');

    if (unWrapped.includes('DOMContentLoaded')) {
        console.error('DomContentLoaded replace failed for', mainFilePath);
        throw Error('DomContentLoaded replace failed for ' + mainFilePath)
    }

    return importType => {
        const importStrings = getImports(bindings, importType, allStylesheets);
        const formattedImports = `${importStrings.join('\n')}\n`;

        // Remove the original import statements
        unWrapped = unWrapped.replace(/import ((.|\n)*?)from.*\n/g, '');

        return `${formattedImports}${unWrapped} ${toAttach || ''}`
    }
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToTypescript = vanillaToTypescript;
}
