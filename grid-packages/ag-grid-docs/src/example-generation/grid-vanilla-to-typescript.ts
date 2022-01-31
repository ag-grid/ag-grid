import { addBindingImports, ImportType } from './parser-utils';
const fs = require('fs-extra');

export function vanillaToTypescript(bindings: any, mainFilePath: string): (importType: ImportType) => string {
    const { gridSettings, externalEventHandlers, imports } = bindings;

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

    let formattedImports = '';
    let importStrings = [];

    if (gridSettings.enterprise) {
        importStrings.push("import 'ag-grid-enterprise';");
    }

    importStrings.push("import 'ag-grid-community/dist/styles/ag-grid.css';");

    // to account for the (rare) example that has more than one class...just default to alpine if it does
    const theme = gridSettings.theme || 'ag-theme-alpine';
    importStrings.push(`import "ag-grid-community/dist/styles/${theme}.css";`);

    if (imports.length > 0) {
        // For now we dont support Modules in our Typescript examples so always convert to packages
        addBindingImports(imports, importStrings, true, false);
        formattedImports = `${importStrings.join('\n')}\n`;

        // Remove the original import statements
        unWrapped = unWrapped.replace(/import ((.|\n)*?)from.*\n/g, '');
    }

    return importType => `${formattedImports}${unWrapped} ${toAttach || ''}`
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToTypescript = vanillaToTypescript;
}
