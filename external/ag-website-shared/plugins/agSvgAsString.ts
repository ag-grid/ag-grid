import type { Plugin } from 'vite';

type Options = {
    /**
     * Workspace package names whose `src/**` files should have SVG imports rewritten.
     * e.g. ['ag-studio']
     */
    packages: string[];
};

/*
 * Library source files use `import SVG from '.../icon.svg'` as a string (assigned to
 * `element.innerHTML`). The library's own build pipeline (esbuild with `loader: 'text'`,
 * see `esbuild.config.cjs`'s svgPlugin) returns the SVG markup as a raw string.
 *
 * Vite's default `.svg` import returns a URL, and Astro further wraps it as an asset
 * metadata object — neither matches what the library source expects, producing
 * `[object Object]` rendered text instead of the icon.
 *
 * This plugin rewrites those imports to use `?raw` so Vite returns the file content
 * as a string.
 *
 * Scope: only default-binding imports (`import X from '...svg'`). Side-effect imports
 * (`import '...svg'`) are intentionally left alone.
 */
export default function agSvgAsString({ packages }: Options): Plugin {
    const escaped = packages.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const SOURCE_PATTERN = new RegExp(`packages/(${escaped.join('|')})/src/`);

    // Match default-binding imports of plain `.svg` only. The negative lookahead
    // (?!\?) explicitly excludes imports that already carry a Vite query suffix
    // (`./x.svg?url`, `./x.svg?react`, etc.) so those pass through unchanged.
    const PLAIN_SVG_IMPORT = /(from\s+['"][^'"]+\.svg)(?!\?)(['"])/g;

    return {
        name: 'ag-svg-as-string',
        enforce: 'pre',
        transform(code, id) {
            if (!SOURCE_PATTERN.test(id)) return null;
            if (!PLAIN_SVG_IMPORT.test(code)) return null;

            // Reset lastIndex — RegExp objects with /g remember state across .test/.exec.
            PLAIN_SVG_IMPORT.lastIndex = 0;
            return code.replace(PLAIN_SVG_IMPORT, '$1?raw$2');
        },
    };
}
