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

    return importType => {
        const tsFile = fs.readFileSync(mainFilePath, 'utf8')
            // unwrap the setup code from the DOM loaded event as the DOM is loaded before the typescript file is transpiled.
            // The Regex
            //  - (.*DOMContentLoaded.*)\n match the full line containing the event name
            //  - ((.|\n)*?) Match all the text over multiple lines. ? makes it take as few lines as possible before the next match
            //  - (}\)) Match the closing brackets of the event listener
            .replace(/(.*DOMContentLoaded.*)\n((.|\n)*?)(}\))/g, "$2")
            // update the import paths to remove the _typescript as the file name will be changed as part of the
            // example generation
            .replace(/_typescript/g, "");


        return `${tsFile} ${toAttach || ''}`;
    };
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToTypescript = vanillaToTypescript;
}
