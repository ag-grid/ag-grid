const fs = require('fs').promises;
const path = require('path');
const ts = require('typescript');
const { transpileTSAndWatch } = require('./transpiler.js');
const { createDevServer } = require('./dev-server.js');
const { createLivereloadServer } = require('./livereload-server.js');
const { getFiles, log, openURLInBrowser } = require('./utils.js');

/** @typedef {import('./types').Transpiler} Transpiler */

const PORT = 2020;
const DEBOUNCE = 250;
const ROOT_DIR = '../..';
const SRC_ENTRY = '../ag-charts-community/src/main.ts';
const DOC_PAGES_DIR = '../../grid-packages/ag-grid-docs/documentation/doc-pages';
const LOCAL_EXAMPLES_DIR = 'tools/dev-server/my-examples';
const TEMPLATES_DIR = `tools/dev-server/templates`;

/** @typedef {{ id: string; category: string; dir: string; ts: string; html: string }} ChartExample */

async function getDocExamples() {
    /** @type {(indexFilePattern: string, getId: (dir: string) => { id: string; category: string }) => Promise<ChartExample[]>} */
    const loadExamples = async (indexFilePattern, getId) => {
        const htmlIndices = await getFiles(indexFilePattern);
        const examples = htmlIndices.map((html) => {
            const dir = path.dirname(html);
            const ts = `${dir}/main.ts`;
            const { id, category } = getId(dir);
            return { id, category, dir, ts, html };
        });
        for (const example of examples) {
            example.html = await fs.readFile(example.html, 'utf8');
        }
        return examples;
    };
    const docExamples = await loadExamples(`${DOC_PAGES_DIR}/charts-*/examples/*/index.html`, (dir) => {
        const id = dir.substring(dir.lastIndexOf('/') + 1);
        // @ts-ignore
        const category = dir.split('/').at(-3);
        return { id, category };
    });
    const localExamples = await loadExamples(`${LOCAL_EXAMPLES_DIR}/*/index.html`, (dir) => {
        const id = dir.substring(dir.lastIndexOf('/') + 1);
        return { id, category: 'my-examples' };
    });
    return [...docExamples, ...localExamples];
}

function idToName(/** @type {string} */ id) {
    return id
        .split('-')
        .map((p) => `${p.charAt(0).toUpperCase()}${p.substring(1)}`)
        .join(' ');
}

async function run() {
    if (Number(process.versions.node.split('.')[0]) < 16) {
        console.error('Node.js version 16+ required.');
        return;
    }

    const devServer = createDevServer(PORT);
    const livereloadServer = createLivereloadServer(devServer.httpServer);

    const examples = await getDocExamples();
    const categories = Array.from(new Set(examples.map((example) => example.category)));
    const indexTemplate = await fs.readFile(`${TEMPLATES_DIR}/index.html`, 'utf8');
    const exampleTemplate = await fs.readFile(`${TEMPLATES_DIR}/example.html`, 'utf8');

    /**
     * Generates index.html file with links.
     * @param {string} pathName
     * @param {Array<{ name: string; href: string }>} listItems
     */
    const generateIndexFile = (pathName, listItems) => {
        const indexHTML = indexTemplate.replace(
            '$EXAMPLES_LIST',
            [
                '<ol>',
                ...listItems.map((item) => {
                    return `<li><a href="${item.href}">${item.name}</a></li>`;
                }),
                '</ol>',
            ].join('\n')
        );
        devServer.addStaticFile(pathName, indexHTML);
    };
    generateIndexFile(
        'index.html',
        categories.map((c) => ({ name: idToName(c), href: c }))
    );
    categories.forEach((category) => {
        const categoryExamples = examples.filter((example) => example.category === category);
        generateIndexFile(
            `${category}/index.html`,
            categoryExamples.map((example) => {
                const id = example.id;
                return { name: idToName(id), href: `${category}/${id}` };
            })
        );
    });

    // Generate examples HTML files
    examples.forEach((example) => {
        const js = path.relative(ROOT_DIR, example.ts.replace(/\.ts$/, '.js'));
        const html = exampleTemplate
            .replace('$EXAMPLE_CONTENT', example.html)
            .replace('$EXAMPLE_TITLE', `${idToName(example.id)} - ${idToName(example.category)}`)
            .replace('$EXAMPLE_SCRIPT', `/${js}`);
        devServer.addStaticFile(`${example.category}/${example.id}/index.html`, html);
    });

    // Transpile TS files for charts and examples
    const transpiler = transpileTSAndWatch({
        entries: [SRC_ENTRY, ...examples.map((example) => example.ts)],
        compilerOptions: {
            downlevelIteration: true,
            experimentalDecorators: true,
            emitDecoratorMetadata: false,
            module: ts.ModuleKind.ES2015,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            inlineSourceMap: true,
            lib: ['lib.es2017.d.ts', 'lib.dom.d.ts'],
            baseUrl: ROOT_DIR,
            paths: {
                'ag-grid-community': [SRC_ENTRY, path.join('../..', SRC_ENTRY)],
            },
            target: ts.ScriptTarget.ES2015,
        },
        debounce: DEBOUNCE,
        emit: ($file, $content) => {
            const file = path.relative(ROOT_DIR, $file);
            const agChartsFile = path.relative(ROOT_DIR, SRC_ENTRY).replace(/\.ts$/, '.js');

            let content = $content;
            if (file.endsWith('.js')) {
                // Fix ES imports and exports for browsers:
                // - Add ".js" extensions.
                // - Replace "ag-charts-community" with a file path.
                content = $content
                    .replace(/^(import ['"]\..*?)(['"];?)$/gm, '$1.js$2')
                    .replace(/( from ['"]\..*?)(['"];?)$/gm, '$1.js$2')
                    .replace(/( from ['"])ag-charts-community(['"])/g, `$1/${agChartsFile}$2`);
            }

            devServer.addStaticFile(file, content);
        },
    });

    let isStopped = false;

    function stop() {
        if (isStopped) return;

        log.warn('Dev Server stop requested');
        livereloadServer.close();
        devServer.close();
        transpiler.stop();
        isStopped = true;

        setTimeout(() => {
            log.warn('Dev Server took too long to exit');
            process.exit();
        }, 1000);
    }

    process.on('exit', stop);
    process.on('SIGINT', stop);

    await devServer.start();
    transpiler.onChange(() => livereloadServer.sendMessage('LiveReload:full'));

    log.ok('watching...');
    openURLInBrowser(`http://localhost:${PORT}/`);
}

run();
