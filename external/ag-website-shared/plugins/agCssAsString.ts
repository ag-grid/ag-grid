import type { Plugin } from 'vite';

type Options = {
    /**
     * Workspace package names whose `src/**` files should have CSS imports rewritten.
     * e.g. ['ag-charts-community', 'ag-charts-enterprise', 'ag-charts-core']
     *      ['ag-studio']
     */
    packages: string[];
};

/*
 * Vite 7 (pulled in by Astro 6) removed the default string export from plain `.css` imports.
 * Library source files using `import STYLES from '.../styles.css'` as a string (fed into
 * `addStyles()` / `enterpriseRegistry.styles`) relied on that deprecated behaviour.
 * This plugin rewrites those imports to use `?inline` so Vite returns the CSS as a string.
 *
 * Remove a package from `packages` once its source files use `?inline` explicitly or stop
 * importing CSS as a string (e.g. by moving style injection into their own build pipeline).
 *
 * Scope: only default-binding imports (`import X from '...css'`). Side-effect imports
 * (`import '...css'`) are intentionally left alone — they rely on Vite's default
 * stylesheet-injection behaviour (e.g. ag-grid's `main-umd-styles.ts`).
 */
export default function agCssAsString({ packages }: Options): Plugin {
    const escaped = packages.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const SOURCE_PATTERN = new RegExp(`packages/(${escaped.join('|')})/src/`);

    // Match default-binding imports of plain `.css` only. The negative lookahead
    // (?!\?) explicitly excludes imports that already carry a Vite query suffix
    // (`./x.css?raw`, `./x.css?url`, etc.) so those pass through unchanged.
    const PLAIN_CSS_IMPORT = /(from\s+['"][^'"]+\.css)(?!\?)(['"])/g;

    return {
        name: 'ag-css-as-string',
        enforce: 'pre',
        transform(code, id) {
            if (!SOURCE_PATTERN.test(id)) return null;
            if (!PLAIN_CSS_IMPORT.test(code)) return null;

            // Reset lastIndex — RegExp objects with /g remember state across .test/.exec.
            PLAIN_CSS_IMPORT.lastIndex = 0;
            return code.replace(PLAIN_CSS_IMPORT, '$1?inline$2');
        },
    };
}
