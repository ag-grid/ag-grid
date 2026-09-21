#!/usr/bin/env node
/**
 * Used to keep Figma in sync with the code: the generated JSON is the source the
 * Figma theme variables are built from.
 *
 * Generates a JSON reference of every AG Grid theme parameter, grouped exactly as
 * the Theme Parameters Reference docs page groups them
 * (https://www.ag-grid.com/javascript-data-grid/theming-api/).
 *
 * Each entry holds the parameter name, its value type, its description and the
 * default value applied by `themeQuartz` (the grid's default theme). Defaults are
 * the internal parameter values, so derived defaults keep their reference form,
 * e.g. `{ "ref": "foregroundColor", "mix": 0.02, "onto": "backgroundColor" }`.
 *
 * Sources:
 *  - groups and ordering: documentation/ag-grid-docs/src/content/api-documentation/theming-api/properties.json
 *  - type and description: dist/documentation/reference/theming-api.AUTO.json
 *      (built by `yarn nx generate-doc-references ag-grid-docs`)
 *  - default values:      packages/ag-grid-community/dist/package/main.esm.mjs
 *      (built by `yarn nx build:package ag-grid-community`)
 *
 * Usage: node scripts/output-theme-params-json.mjs --out <path>
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const GROUPS_FILE = 'documentation/ag-grid-docs/src/content/api-documentation/theming-api/properties.json';
const DOCS_FILE = 'dist/documentation/reference/theming-api.AUTO.json';
const GRID_BUNDLE = 'packages/ag-grid-community/dist/package/main.esm.mjs';
// Key of the mode holding the values that apply regardless of light/dark mode
const DEFAULT_MODE = '$default';

const requireFile = (relativePath, buildCommand) => {
    const absolutePath = resolve(repoRoot, relativePath);
    if (!existsSync(absolutePath)) {
        throw new Error(`Missing ${relativePath}. Build it first with: ${buildCommand}`);
    }
    return absolutePath;
};

const readJson = (absolutePath) => JSON.parse(readFileSync(absolutePath, 'utf8'));

/** Group name -> parameter names, in docs page order. */
const readGroups = () => {
    const groups = readJson(requireFile(GROUPS_FILE, 'n/a - this file is checked in'));
    return Object.entries(groups)
        .filter(([groupName]) => groupName !== '_config_')
        .map(([groupName, group]) => [
            group.meta?.displayName ?? groupName,
            Object.keys(group).filter((key) => key !== 'meta'),
        ]);
};

/**
 * Parameter name -> default value, as the unresolved value held by the default mode of
 * `themeQuartz`. These are the values passed to `withParams()`, so defaults derived from
 * other parameters stay in reference form rather than being flattened to CSS.
 */
const readDefaults = async () => {
    const bundle = requireFile(GRID_BUNDLE, 'yarn nx build:package ag-grid-community');
    const { themeQuartz } = await import(pathToFileURL(bundle).href);
    return themeQuartz._getModeParams()[DEFAULT_MODE];
};

const generate = async () => {
    const docs = readJson(requireFile(DOCS_FILE, 'yarn nx generate-doc-references ag-grid-docs'));
    const defaults = await readDefaults();

    const output = {};
    for (const [groupName, parameterNames] of readGroups()) {
        output[groupName] = parameterNames.map((name) => {
            const doc = docs[name];
            if (!doc) {
                throw new Error(`No generated documentation for theme parameter "${name}"`);
            }
            const defaultValue = defaults[name];
            if (defaultValue === undefined) {
                throw new Error(`No default value for theme parameter "${name}"`);
            }
            return {
                name,
                type: doc.type.returnType,
                description: doc.meta.comment,
                defaultValue,
            };
        });
    }
    return output;
};

const outIndex = process.argv.indexOf('--out');
const outArg = outIndex === -1 ? undefined : process.argv[outIndex + 1];
if (!outArg) {
    console.error('Usage: node scripts/output-theme-params-json.mjs --out <path>');
    process.exit(1);
}
const outPath = resolve(process.cwd(), outArg);

const parameters = await generate();
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(parameters, null, 2)}\n`);

const count = Object.values(parameters).reduce((total, group) => total + group.length, 0);
console.log(`Wrote ${count} theme parameters in ${Object.keys(parameters).length} groups to ${outPath}`);
