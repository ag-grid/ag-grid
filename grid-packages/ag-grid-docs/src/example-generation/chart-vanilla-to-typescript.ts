import { ImportType, addBindingImports } from './parser-utils';
const fs = require('fs-extra');

export function vanillaToTypescript(bindings: any, mainFilePath: string): (importType: ImportType) => string {
    const { externalEventHandlers, imports } = bindings;

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

    return () => {
        let tsFile = fs.readFileSync(mainFilePath, 'utf8')
            .replace(/(.*DOMContentLoaded.*)\n((.|\n)*)(}\))/g, "$2");

        // Need to replace module imports with their matching package import
        let formattedImports = '';
        if (imports.length > 0) {
            let importStrings = [];
            addBindingImports(imports, importStrings, true, true);
            formattedImports = `${importStrings.join('\n')}\n`

            // Remove the original import statements
            tsFile = tsFile.replace(/import ((.|\n)*?)from.*\n/g, '');
        }

        return `${formattedImports}${tsFile} ${toAttach || ''}`;
    };
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToTypescript = vanillaToTypescript;
}
