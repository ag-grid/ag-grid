import { promises as fs } from 'fs';
import path from 'path';
import ts from 'typescript';
import { transpileTSAndWatch } from './transpiler.js';
import { createDevServer } from './dev-server.js';
import { createLivereloadServer } from './livereload-server.js';
import { getFiles, log, openURLInBrowser } from './utils.js';

/** @typedef {import('./types').Transpiler} Transpiler */

const PORT = 2020;
const DEBOUNCE = 250;
const ROOT_DIR = '../..';
const SRC_ENTRY = '../ag-charts-community/src/main.ts';
const DOC_PAGES_DIR = '../../grid-packages/ag-grid-docs/documentation/doc-pages';

async function getDocExamples() {
    const htmlIndices = await getFiles(`${DOC_PAGES_DIR}/charts-*/examples/*/index.html`);
    const examples = htmlIndices.map((html) => {
        const dir = path.dirname(html);
        const ts = `${dir}/main.ts`;
        const chartId = dir.substring(dir.lastIndexOf('/') + 1);
        // @ts-ignore
        const categoryId = dir.split('/').at(-3);
        const id = `${categoryId}/${chartId}`;
        return { id, dir, ts, html };
    });
    for (const example of examples) {
        example.html = await fs.readFile(example.html, 'utf8');
    }
    return examples;
}

async function run() {
    const devServer = createDevServer(PORT);
    const livereloadServer = createLivereloadServer(devServer.httpServer);

    const examples = await getDocExamples();
    const indexTemplate = await fs.readFile('templates/index.html', 'utf8');
    const exampleTemplate = await fs.readFile('templates/example.html', 'utf8');

    // Generate index.html
    const indexHTML = indexTemplate.replace('$EXAMPLES_LIST', [
        '<ol>',
        ...examples.map((example) => {
            return `<li><a href="/${example.id}">${example.id}</a></li>`;
        }),
        '</ol>',
    ].join('\n'));
    devServer.addStaticFile('index.html', indexHTML);

    // Generate examples HTML files
    examples.forEach((example) => {
        const js = path.relative(ROOT_DIR, example.ts.replace(/\.ts$/, '.js'));
        const html = exampleTemplate
            .replace('$EXAMPLE_CONTENT', example.html)
            .replace('$EXAMPLE_TITLE', example.id)
            .replace('$EXAMPLE_SCRIPT', `/${js}`);
        devServer.addStaticFile(`${example.id}/index.html`, html);
    });

    // Transpile TS files for charts and examples
    const transpiler = transpileTSAndWatch({
        entries: [
            SRC_ENTRY,
            ...examples.map((example) => example.ts),
        ],
        compilerOptions: {
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
            paths: {
                'ag-grid-community': [
                    SRC_ENTRY,
                ],
            },
            target: ts.ScriptTarget.ES2015,
        },
        debounce: DEBOUNCE,
        emit: ($file, $content) => {
            const file = path.relative(ROOT_DIR, $file);
            const agChartsFile = path.relative(ROOT_DIR, SRC_ENTRY).replace(/\.ts$/, '.js');

            // Browsers cannot resolve imports without file extensions
            // (or configuring mime type will be required otherwise)
            // so here we add .js extensions to ES imports and exports
            // that start with "."
            let content = $content
                .replace(/^(import ['"]\..*?)(['"];?)$/gm, '$1.js$2')
                .replace(/( from ['"]\..*?)(['"];?)$/gm, '$1.js$2')
                .replace(/(['"])ag-charts-community(['"])/g, `$1/${agChartsFile}$2`);

            devServer.addStaticFile(
                file,
                content,
            );
        },
    });

    let isStopped = false;

    function stop() {
        if (isStopped) return;

        livereloadServer.close();
        devServer.close();
        transpiler.stop();
        isStopped = true;
    }

    process.on('exit', stop);
    process.on('SIGINT', stop);

    await devServer.start();
    transpiler.onChange(() => livereloadServer.sendMessage({ type: 'reload-full' }));

    log.ok('watching...');
    openURLInBrowser(`http://localhost:${PORT}/`);
}

run();
