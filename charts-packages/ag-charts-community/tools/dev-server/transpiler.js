const ts = require('typescript');

/** @typedef {import('./types').Transpiler} Transpiler */
/** @typedef {import('./types').TranspilerOptions} TranspilerOptions */

/**
 * @param {TranspilerOptions} options
 * @returns {Transpiler}
 */
function transpileTSAndWatch(options) {
    const { entries, compilerOptions, debounce, emit } = options;
    const createProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram;
    let timeout = null;
    /** @type {ts.System} */
    const system = {
        ...ts.sys,

        // Substitute for writing into disc
        writeFile(file, content) {
            emit(file, content);

            clearTimeout(timeout);
            timeout = setTimeout(() => listeners.forEach((cb) => cb()), debounce);
        },

        // Prevent clearing the console after rebuilds
        clearScreen: () => false,
    };
    const host = ts.createWatchCompilerHost(entries, compilerOptions, system, createProgram);
    const watcher = ts.createWatchProgram(host);

    // Emit sources
    watcher
        .getProgram()
        .getSourceFiles()
        .filter((src) => !src.fileName.includes('/node_modules/'))
        .filter((src) => !src.fileName.endsWith('.d.ts'))
        .forEach((src) => emit(src.fileName, src.text));

    /** @type {Set<() => void>} */
    const listeners = new Set();

    return {
        onChange: (callback) => listeners.add(callback),
        stop: () => watcher.close(),
    };
}

module.exports = {
    transpileTSAndWatch,
};
