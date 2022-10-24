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

    /** @type {() => void} */
    let onWriteEnd = null;

    /** @type {ts.System} */
    const system = {
        ...ts.sys,

        // Substitute for writing into disc
        writeFile(file, content) {
            emit(file, content);
            onWriteEnd && onWriteEnd();
        },

        // Prevent clearing the console after rebuilds
        clearScreen: () => false,
    };
    const host = ts.createWatchCompilerHost(entries, compilerOptions, system, createProgram);
    const watcher = ts.createWatchProgram(host);

    /** @type {Set<() => void>} */
    const listeners = new Set();
    let timeout = null;
    onWriteEnd = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            listeners.forEach((cb) => cb());
        }, debounce);
    };

    return {
        onChange: (callback) => listeners.add(callback),
        stop: () => watcher.close(),
    };
}

module.exports = {
    transpileTSAndWatch,
};
