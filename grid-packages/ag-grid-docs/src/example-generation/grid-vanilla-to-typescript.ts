import { ImportType } from './parser-utils';
const fs = require('fs-extra');

export function vanillaToTypescript(bindings: any, mainFilePath: string): (importType: ImportType) => string {
    const { externalEventHandlers } = bindings;

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
    const { original, body } = bindings.onDomContentLoaded;

    // unwrap the setup code from the DOM loaded event as the DOM is loaded before the typescript file is transpiled.
    let unWrapped = tsFile
        .replace(original, body)
        // update the import paths to remove the _typescript as the file name will be changed as part of the
        // example generation
        .replace(/_typescript/g, "");

    return importType => {
        return `${unWrapped} ${toAttach || ''}`;
    };
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToTypescript = vanillaToTypescript;
}
