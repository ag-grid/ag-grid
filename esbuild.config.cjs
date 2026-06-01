const esbuild = require('esbuild');
const { umdWrapper } = require('esbuild-plugin-umd-wrapper');
const fs = require('fs/promises');
const path = require('path');
const postcss = require('postcss');
const postcssPlugins = require('./postcss-plugins.cjs');

/** @type {import('esbuild').Plugin} */
const cssPlugin = {
    name: 'css-plugin',
    setup(build) {
        build.onLoad({ filter: /\.css$/ }, async (args) => {
            const rawCSS = await fs.readFile(args.path, 'utf8');
            const isLegacyCSS = !args.path.includes('/src/');

            // Legacy theme CSS is already processed through Sass, only source
            // CSS (Theming API) needs PostCSS.
            const outputCSS = isLegacyCSS
                ? rawCSS
                : (await postcss(postcssPlugins).process(rawCSS, { from: args.path, to: args.path })).css;

            // UMD builds: non-source CSS (legacy themes) gets injected as <style> tags
            const isUmd = /:(umd|umd:watch)$/.test(process.env.NX_TASK_TARGET_TARGET ?? '');
            if (isUmd && isLegacyCSS) {
                return {
                    contents: `(function(){if(typeof document!=="undefined"){var s=document.createElement("style");s.setAttribute("data-ag-scope","legacy");s.textContent=${JSON.stringify(outputCSS)};document.head.appendChild(s);}})();`,
                    loader: 'js',
                };
            }
            return { contents: outputCSS, loader: 'text' };
        });
    },
};

const exportedNames = {
    react: 'React',
    'react-dom': 'ReactDOM',
    'ag-stack': 'agStack',
    'ag-grid-community': 'agGrid',
    'ag-grid-enterprise': 'agGrid',
    'ag-grid-react': 'AgGridReact',
};

/** @type {import('esbuild').Plugin} */
const postBuildMinificationPlugin = {
    name: 'minification-plugin',
    setup(build) {
        build.initialOptions.metafile = true;

        /** @type {Map<string, AbortController>} */
        const writeState = new Map();

        /** @param {string} outputFile */
        const minifyFile = async (outputFile) => {
            try {
                if (outputFile.endsWith('.map')) return;

                writeState.get(outputFile)?.abort();
                const abortController = new AbortController();
                writeState.set(outputFile, abortController);

                const { signal } = abortController;

                const contents = await fs.readFile(path.resolve(outputFile), 'utf-8');

                if (signal.aborted) return;
                const minified = await esbuild.transform(contents, {
                    minify: true,
                    sourcemap: true,
                });

                if (signal.aborted) return;
                const { name, ext } = path.parse(outputFile);
                const minifiedFile = path.resolve(path.dirname(outputFile), `${name}.min${ext}`);
                await Promise.all([
                    fs.writeFile(minifiedFile, minified.code, { signal }),
                    fs.writeFile(`${minifiedFile}.map`, minified.map, { signal }),
                ]);
            } catch (e) {
                if (e.name !== 'AbortError') throw e;
            }
        };

        build.onEnd(async (result) => {
            await Promise.all(Object.keys(result.metafile.outputs).map(minifyFile));
        });
    },
};

/** @type {import('esbuild').Plugin} */
const umdWrapperAdaptorPlugin = {
    name: 'umd-wrapper-adaptor',
    setup(build) {
        const { initialOptions } = build;

        // Creates UMD banner + footer config.
        const exportedName = exportedNames[process.env.NX_TASK_TARGET_PROJECT];
        const umdWrapperInstance = umdWrapper({ libraryName: exportedName });
        umdWrapperInstance.setup(build);

        // Correct global variable name references.
        const { banner } = build.initialOptions;
        for (const external of initialOptions.external ?? []) {
            const globalName = exportedNames[external];
            if (globalName) {
                banner.js = banner.js.replaceAll(`g["${external}"]`, `g["${globalName}"]`);
            }
        }

        // Add `require()` function which uses resolved module references.
        const externalsMap =
            initialOptions.external?.map((e, i) => {
                return `if (name === '${e}') return __d${String.fromCharCode(97 + i)};`;
            }) ?? [];

        build.initialOptions.banner.js += `
if (typeof require === 'undefined') {
    function require(name) {
        ${externalsMap.join('\n        ')}
        throw new Error('Unknown module: ' + name);
    }
}
        `;
    },
};

const plugins = [cssPlugin];
let outExtension = {};
if (/:(umd|umd:watch)$/.test(process.env.NX_TASK_TARGET_TARGET ?? '')) {
    plugins.push(umdWrapperAdaptorPlugin);
    outExtension = {
        '.cjs': '.js',
    };
} else {
    outExtension = {
        '.cjs': '.cjs.js',
        '.js': '.esm.mjs',
    };
}

if (process.env.NX_TASK_TARGET_CONFIGURATION !== 'watch') {
    plugins.push(postBuildMinificationPlugin);
}

/** @type {import('esbuild').BuildOptions} */
const options = {
    outExtension,
    plugins,
};

module.exports = options;
