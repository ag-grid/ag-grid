import path from 'path';
import ts from 'typescript';

/** @typedef {import('./types').Transpiler} Transpiler */
/** @typedef {import('./types').TranspilerOptions} TranspilerOptions */

/** @type {ts.CompilerOptions} */
const compilerOptions = {
    downlevelIteration: true,
    experimentalDecorators: true,
    emitDecoratorMetadata: false,
    module: ts.ModuleKind.ES2015,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    inlineSourceMap: true,
    lib: [
        'lib.es2017.d.ts',
        'lib.dom.d.ts',
    ],
    target: ts.ScriptTarget.ES2015,
    types: [],
};

/**
 * @param {string} code
 * @returns {string}
 */
function fixESImportsForBrowser(code) {
    // Browsers cannot resolve imports without file extensions
    // (or configuring mime type the other way will be required)
    // so here we add .js extensions to ES imports
    return code
        .replace(/^(import ['"].*?)(['"];?)$/gm, '$1.js$2')
        .replace(/( from ['"].*?)(['"];?)$/gm, '$1.js$2');
}

/**
 * @param {TranspilerOptions} options
 * @returns {Transpiler}
 */
export function transpileTSAndWatch({ entry, srcDir, destDir, debounce, emit }) {
    const createProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram;
    let timeout = null;
    const system = {
        ...ts.sys,
        writeFile(file, content) {
            const destFile = path.join(destDir, path.relative(srcDir, file));
            const jsCode = fixESImportsForBrowser(content);
            emit(destFile, jsCode);

            clearTimeout(timeout);
            timeout = setTimeout(() => listeners.forEach((cb) => cb()), debounce);
        },
    };
    const host = ts.createWatchCompilerHost([entry], compilerOptions, system, createProgram);
    const watcher = ts.createWatchProgram(host);

    /** @type {Set<() => void>} */
    const listeners = new Set();

    return {
        onChange: (callback) => listeners.add(callback),
        stop: () => watcher.close(),
    };
}
