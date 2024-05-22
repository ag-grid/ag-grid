import type { ExampleConfig, ImportType, ParsedBindings } from '../types';
import {
    addBindingImports,
    addGenericInterfaceImport,
    getIntegratedDarkModeCode,
    removeModuleRegistration,
} from './parser-utils';
import { toTitleCase } from './string-utils';

export function getImport(filename: string) {
    const componentName = filename.split('.')[0];
    return `import { ${toTitleCase(componentName)} } from './${componentName}';`;
}

function getPropertyInterfaces(properties) {
    let propTypesUsed = [];
    properties.forEach((prop) => {
        if (prop.typings?.typesToInclude?.length > 0) {
            propTypesUsed = [...propTypesUsed, ...prop.typings.typesToInclude];
        }
    });
    return [...new Set(propTypesUsed)];
}

function getModuleImports(bindings: ParsedBindings): string[] {
    const { inlineGridStyles, imports: bindingImports, properties } = bindings;

    const imports = [];
    imports.push("import '@ag-grid-community/styles/ag-grid.css';");
    // to account for the (rare) example that has more than one class...just default to quartz if it does
    // we strip off any '-dark' from the theme when loading the CSS as dark versions are now embedded in the
    // "source" non dark version
    const theme = inlineGridStyles.theme ? inlineGridStyles.theme.replace('-dark', '') : 'ag-theme-quartz';
    imports.push(`import "@ag-grid-community/styles/${theme}.css";`);

    const propertyInterfaces = getPropertyInterfaces(properties);
    const bImports = [...(bindingImports || [])];
    bImports.push({
        module: `'@ag-grid-community/core'`,
        isNamespaced: false,
        imports: [...propertyInterfaces],
    });

    if (bImports.length > 0) {
        addBindingImports(bImports, imports, false, false);
    }

    addGenericInterfaceImport(imports, bindings.tData, bindings);

    return imports;
}

function getPackageImports(bindings: ParsedBindings): string[] {
    const { inlineGridStyles, imports: bindingImports, properties } = bindings;
    const imports = [];

    imports.push("import 'ag-grid-community/styles/ag-grid.css';");

    // to account for the (rare) example that has more than one class...just default to quartz if it does
    // we strip off any '-dark' from the theme when loading the CSS as dark versions are now embedded in the
    // "source" non dark version
    const theme = inlineGridStyles.theme ? inlineGridStyles.theme.replace('-dark', '') : 'ag-theme-quartz';
    imports.push(`import "ag-grid-community/styles/${theme}.css";`);

    const propertyInterfaces = getPropertyInterfaces(properties);
    const bImports = [...(bindingImports || [])];
    bImports.push({
        module: `'ag-grid-community'`,
        isNamespaced: false,
        imports: [...propertyInterfaces],
    });

    if (bImports.length > 0) {
        addBindingImports(bImports, imports, true, false);
    }

    addGenericInterfaceImport(imports, bindings.tData, bindings);

    return imports;
}

function getImports(bindings: ParsedBindings, importType: ImportType): string[] {
    if (importType === 'packages') {
        return getPackageImports(bindings);
    } else {
        return getModuleImports(bindings);
    }
}

export function vanillaToTypescript(
    bindings: ParsedBindings,
    exampleConfig: ExampleConfig,
    mainFilePath: string,
    tsFile: string
): (importType: ImportType) => string {
    const { externalEventHandlers } = bindings;

    // attach external handlers to window
    let toAttach = '';
    if (externalEventHandlers?.length > 0) {
        const externalBindings = externalEventHandlers.map((e) => ` (<any>window).${e.name} = ${e.name};`);
        toAttach = [
            '\n',
            "if (typeof window !== 'undefined') {",
            '// Attach external event handlers to window so they can be called from index.html',
            ...externalBindings,
            '}',
        ].join('\n');
    }
    let unWrapped = tsFile
        // unwrap the setup code from the DOM loaded event as the DOM is loaded before the typescript file is transpiled.
        // Regex
        // (.*DOMContentLoaded.*)\n Match the line with DOMContentLoaded
        // (.|\n)*? Match the shortest number of lines until the next part matches (body of the event handler)
        // (\n}\)) Match a }) on a new line with no indentation
        .replace(/(.*DOMContentLoaded.*)\n((.|\n)*?)(\n}\))/g, '$2');

    if (unWrapped.includes('DOMContentLoaded')) {
        console.error('DomContentLoaded replace failed for', mainFilePath);
        throw Error('DomContentLoaded replace failed for ' + mainFilePath);
    }

    return (importType) => {
        const importStrings = getImports(bindings, importType);
        const formattedImports = `${importStrings.join('\n')}\n`;

        // Remove the original import statements
        unWrapped = unWrapped.replace(/import ((.|\n)*?)from.*\n/g, '');

        if (importType === 'packages') {
            unWrapped = removeModuleRegistration(unWrapped);
        }

        return `${formattedImports}${unWrapped} ${toAttach || ''} ${getIntegratedDarkModeCode(bindings.exampleName, true, 'gridApi')}`;
    };
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToTypescript = vanillaToTypescript;
}
