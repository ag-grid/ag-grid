/**
 * Turns a stylesheet into the text we embed in a build.
 *
 * Shared because two builds need it and neither can reuse the other's plumbing:
 * bundled builds reach CSS through esbuild's `onLoad`, while an unbundled build
 * resolves nothing, so `onLoad` never fires and the files have to be compiled
 * directly (see esbuild-plugin-multi-file-esm.cjs). Keeping the rule in one place
 * stops the two drifting apart, since a difference would surface as a styling bug
 * in one output format only.
 */
const fs = require('fs/promises');
const path = require('path');

const postcssPlugins = require('./postcss-plugins.cjs');

const postcss = require('postcss');

/**
 * Legacy theme CSS has already been through Sass; only source CSS (Theming API)
 * needs PostCSS. Separators are normalised so this holds on Windows too, where
 * both esbuild and `path.join` hand us backslashes.
 *
 * @param {string} cssFile
 * @returns {boolean}
 */
function isLegacyCss(cssFile) {
    return !cssFile.split(path.sep).join('/').includes('/src/');
}

/**
 * @param {string} cssFile
 * @returns {Promise<{ css: string, isLegacy: boolean }>}
 */
async function compileCssToText(cssFile) {
    const rawCSS = await fs.readFile(cssFile, 'utf8');
    const isLegacy = isLegacyCss(cssFile);
    const css = isLegacy ? rawCSS : (await postcss(postcssPlugins).process(rawCSS, { from: cssFile, to: cssFile })).css;
    return { css, isLegacy };
}

module.exports = { compileCssToText };
