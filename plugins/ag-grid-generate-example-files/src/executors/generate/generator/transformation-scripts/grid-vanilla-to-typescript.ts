import type { ParsedBindings } from '../types';
import {
    addBindingImports,
    addGenericInterfaceImport,
    findLocaleImport,
    getIntegratedDarkModeCode,
    getPropertyInterfaces,
    wrapTearDownExample,
} from './parser-utils';
import { toTitleCase } from './string-utils';

export function getImport(filename: string) {
    const componentName = filename.split('.')[0];
    return `import { ${toTitleCase(componentName)} } from './${componentName}';`;
}

function getImports(bindings: ParsedBindings, currFile: string): string[] {
    const { imports: bindingImports, properties } = bindings;
    const imports = [];

    const localeImport = findLocaleImport(bindingImports);
    if (localeImport) {
        imports.push(`import { ${localeImport.imports[0]} } from '@ag-grid-community/locale';`);
    }

    const bImports = [...(bindingImports || [])];
    const propertyInterfaces = getPropertyInterfaces(properties, currFile);
    if (propertyInterfaces.length > 0) {
        bImports.push({
            module: `'ag-grid-community'`,
            isNamespaced: false,
            imports: [...propertyInterfaces],
        });
    }

    if (bImports.length > 0) {
        addBindingImports(bImports, imports, false);
    }

    addGenericInterfaceImport(imports, bindings.tData, bindings);

    return imports;
}

function getTearDownCode(exampleCode: string): string {
    const apisPresent = ['gridApi', 'topApi', 'bottomApi', 'leftApi', 'rightApi'].filter((api) =>
        exampleCode.includes(api)
    );
    if (apisPresent.length === 0) {
        return '';
    }

    return wrapTearDownExample(
        `(<any>window).tearDownExample = () => [${apisPresent.join()}].forEach(api => api?.destroy());`
    );
}

export function vanillaToTypescript(bindings: ParsedBindings, mainFilePath: string, tsFile: string): () => string {
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
            getTearDownCode(tsFile),
            '}',
        ].join('\n');
    }
    let unWrapped = tsFile
        // unwrap the setup code from the DOM loaded event as the DOM is loaded before the typescript file is transpiled.
        // Regex
        // (.*DOMContentLoaded.*)\n Match the line with DOMContentLoaded
        // (.|\n)*? Match the shortest number of lines until the next part matches (body of the event handler)
        // (\n}\)) Match a }) on a new line with no indentation
        .replace(/(.*DOMContentLoaded.*)\n((.|\n)*?)(\n}\))/g, '$2')
        // comment only makes sense with the DOMContentLoaded event
        .replace('// setup the grid after the page has finished loading', '');

    if (unWrapped.includes('DOMContentLoaded')) {
        console.error('DomContentLoaded replace failed for', mainFilePath);
        throw Error('DomContentLoaded replace failed for ' + mainFilePath);
    }

    return () => {
        const importStrings = getImports(bindings, unWrapped);
        const formattedImports = `${importStrings.join('\n')}\n`;

        // Remove the original import statements
        unWrapped = unWrapped.replace(/import ((.|\n)*?)from.*\n/g, '');

        let result = `${formattedImports}${unWrapped} ${toAttach || ''} ${getIntegratedDarkModeCode(bindings.exampleName, true, 'gridApi') ?? ''}`;

        // Add test tearDown method
        if (!result.includes('tearDownExample')) {
            result += wrapTearDownExample(`if (typeof window !== 'undefined') {${getTearDownCode(result)} }`);
        }

        return result;
    };
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToTypescript = vanillaToTypescript;
}
