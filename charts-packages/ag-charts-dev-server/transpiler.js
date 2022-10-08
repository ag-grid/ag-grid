import ts from 'typescript';

/** @typedef {import('./types').Transpiler} Transpiler */
/** @typedef {import('./types').TranspilerOptions} TranspilerOptions */

/**
 * @param {TranspilerOptions} options
 * @returns {Transpiler}
 */
export function transpileTSAndWatch(options) {
    const { entries, compilerOptions, debounce, emit } = options;
    const createProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram;
    let timeout = null;
    const system = {
        ...ts.sys,
        writeFile(file, content) {
            emit(file, content);

            clearTimeout(timeout);
            timeout = setTimeout(() => listeners.forEach((cb) => cb()), debounce);
        },
    };
    const host = ts.createWatchCompilerHost(entries, compilerOptions, system, createProgram);
    const watcher = ts.createWatchProgram(host);

    /** @type {Set<() => void>} */
    const listeners = new Set();

    return {
        onChange: (callback) => listeners.add(callback),
        stop: () => watcher.close(),
    };
}
