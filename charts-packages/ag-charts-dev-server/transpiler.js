// @ts-check
import path from 'path';
import ts from 'typescript';

/** @typedef {import('./types').TSOutput} TSOutput */

/** @type {ts.CompilerOptions} */
const compilerOptions = {
    module: ts.ModuleKind.ES2020,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    sourceMap: true,
    target: ts.ScriptTarget.ES2020,
};

/**
 * @param {string} code
 * @returns {string}
 */
function fixESImportsForBrowser(code) {
    return code
        .replace(/^(import ['"].*?)(['"];?)$/gm, '$1.js$2')
        .replace(/( from ['"].*?)(['"];?)$/gm, '$1.js$2');
}

/**
 * @param {string[]} files
 * @param {{ cwd: string }} options
 * @returns {Promise<TSOutput[]>}
 */
export async function transpileFiles(files, options) {
    /** @type {TSOutput[]} */
    const outputs = [];
    const program = ts.createProgram(
        files.filter(f => f.includes('/main.ts')),
        {
            ...compilerOptions,
            sourceRoot: options.cwd,
        },
    );
    const sources = program.getSourceFiles().filter((src) => {
        return !src.fileName.endsWith('.d.ts');
    });

    for (const src of sources) {
        /** @type {TSOutput} */
        const output = {
            tsFile: src.fileName,
            tsContent: src.text,
            jsFile: '',
            jsContent: '',
            sourcemapFile: '',
            sourcemapContent: '',
        };
        const emitted = program.emit(src, (file, content) => {
            const relative = path.relative(options.cwd, file);
            if (file.endsWith('.map')) {
                output.sourcemapFile = relative;
                output.sourcemapContent = content;
            } else {
                output.jsFile = relative;
                output.jsContent = fixESImportsForBrowser(content);
            }
        });
        emitted.diagnostics.forEach((d) => console.log(d));
        outputs.push(output);
    }
    return outputs;
}
