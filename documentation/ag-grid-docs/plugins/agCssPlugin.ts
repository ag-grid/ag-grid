import fs from 'fs/promises';
import { createRequire } from 'module';
import path from 'path';
import type { Plugin } from 'vite';

const require = createRequire(import.meta.url);
const postcss = require('postcss');
const cssAutoPrefix = require('autoprefixer');
const cssNano = require('cssnano');
const cssImport = require('postcss-import');
const cssRtl = require('postcss-rtlcss');
const cssUrl = require('postcss-url');

const packagesDir = path.resolve(import.meta.dirname, '../../../packages');

/**
 * Virtual module prefix. The '\0' prefix is a Vite/Rollup convention for
 * virtual modules. The '.js' suffix is essential: Vite's built-in CSS plugin
 * matches module IDs ending with '.css' regardless of the '\0' prefix, so
 * ending the virtual ID with '.js' prevents the CSS pipeline from processing
 * the module and stripping the default export.
 */
const VIRTUAL_PREFIX = '\0ag-css-text:';
const VIRTUAL_SUFFIX = '.js';

/**
 * Vite plugin that transforms .css imports from the grid packages into JS
 * modules that default-export a processed CSS string. Uses resolveId + load
 * (instead of transform) so that Vite's built-in CSS pipeline is bypassed
 * entirely — otherwise Vite wraps the output in style-injection code and
 * the default export is lost.
 */
export default function createAgCssPlugin(): Plugin {
    return {
        name: 'ag-css-text',
        enforce: 'pre',

        resolveId(source, importer) {
            if (!source.endsWith('.css') || !importer) return null;

            // Resolve the import to an absolute path
            const cleanImporter = importer.split('?')[0];
            let resolved: string;
            if (source.startsWith('.')) {
                resolved = path.resolve(path.dirname(cleanImporter), source);
            } else if (path.isAbsolute(source)) {
                resolved = source;
            } else {
                return null;
            }

            if (resolved.startsWith(packagesDir)) {
                return VIRTUAL_PREFIX + resolved + VIRTUAL_SUFFIX;
            }
            return null;
        },

        async load(id) {
            if (!id.startsWith(VIRTUAL_PREFIX) || !id.endsWith(VIRTUAL_SUFFIX)) return null;

            const filePath = id.slice(VIRTUAL_PREFIX.length, -VIRTUAL_SUFFIX.length);
            const code = await fs.readFile(filePath, 'utf8');

            const result = await postcss([
                cssImport(),
                cssUrl({ url: 'inline' }),
                cssAutoPrefix(),
                cssRtl({
                    ltrPrefix: `:where(.ag-ltr)`,
                    rtlPrefix: `:where(.ag-rtl)`,
                    bothPrefix: `:where(.ag-ltr, .ag-rtl)`,
                }),
                cssNano({
                    preset: [
                        'default',
                        {
                            discardComments: true,
                            normalizeWhitespace: true,
                            minifySelectors: true,
                        },
                    ],
                }),
            ]).process(code, { from: filePath, to: filePath });

            return {
                code: `export default ${JSON.stringify(result.css)};`,
                map: null,
            };
        },
    };
}
