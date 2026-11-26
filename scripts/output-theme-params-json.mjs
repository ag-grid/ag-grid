#!/usr/bin/env node
/**
 * Used to keep Figma in sync with the code: the generated JSON is the source the
 * Figma theme variables are built from.
 *
 * Generates a JSON reference of every AG Grid theme parameter as applied by `themeQuartz`
 * (the grid's default theme), grouped as the Theme Parameters Reference docs page groups
 * them (https://www.ag-grid.com/javascript-data-grid/theming-api/). Output shape:
 *
 *  - `gridVersion`:  version of ag-grid-community the values were read from
 *  - `generatedAt`:  local time the file was generated, as `hh:mm-dd-mm-yy`
 *  - `theme`:        `themeQuartz` and the parts it is built from
 *  - `colorSchemes`: every Quartz colour scheme (themeQuartz with a `colorScheme*` part),
 *                    plus the `data-ag-theme-mode` that selects it in plain `themeQuartz`
 *  - `groups`:       docs page groups and their metadata, in docs page order
 *  - `parameters`:   every theme parameter, in docs page order with ungrouped ones last
 *
 * Each parameter entry holds its name, the `id` of its group (`null` if it is in none), CSS
 * variable, value type, description, the part that defines it, the `themeQuartz` default value and, per colour scheme, its `value` (the internal
 * parameter value, so derived values keep their reference form, e.g.
 * `{ "ref": "foregroundColor", "mix": 0.02, "onto": "backgroundColor" }`), the `css` the grid
 * emits for it, and the `resolved` value with every reference, `color-mix()` and `calc()`
 * evaluated. Resolved colours are `#rrggbb` or `#rrggbbaa`; CSS-wide keywords such as
 * `inherit` stay as they are, as they depend on where the grid is placed.
 *
 * Sources:
 *  - groups and ordering: documentation/ag-grid-docs/src/content/api-documentation/theming-api/properties.json
 *  - type and description: dist/documentation/reference/theming-api.AUTO.json
 *      (built by `yarn nx generate-doc-references ag-grid-docs`)
 *  - parts and values:     packages/ag-grid-community/dist/package/main.esm.mjs
 *      (built by `yarn nx build:package ag-grid-community`)
 *
 * Reads theme internals (`_getModeParams()`, `_getParamsCss()`, `parts`), which are not public
 * API and may change without notice.
 *
 * Usage: node scripts/output-theme-params-json.mjs --out <directory>
 * Writes `<directory>/<gridVersion>-theme-params.json`, creating the directory if needed.
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const GROUPS_FILE = 'documentation/ag-grid-docs/src/content/api-documentation/theming-api/properties.json';
const DOCS_FILE = 'dist/documentation/reference/theming-api.AUTO.json';
const GRID_BUNDLE = 'packages/ag-grid-community/dist/package/main.esm.mjs';
const GRID_PACKAGE_JSON = 'packages/ag-grid-community/package.json';
// Group page links in properties.json are relative to the framework root of the docs site
const DOCS_ROOT_URL = 'https://www.ag-grid.com/javascript-data-grid/';
// Key of the mode holding the values that apply regardless of light/dark mode
const DEFAULT_MODE = '$default';
const COLOR_SCHEME_PREFIX = 'colorScheme';
// Switches between colour schemes by mode rather than being a colour scheme itself
const COLOR_SCHEME_VARIABLE = 'colorSchemeVariable';
// `definedBy` of parameters whose default comes from ag-stack rather than a grid part
const SHARED_DEFAULTS = 'sharedDefaults';
// Value types (from the docs) whose resolved value is a single colour
const COLOR_TYPES = new Set(['ColorValue']);
// Keywords whose value depends on where the grid sits in the page, so cannot be resolved
const CSS_WIDE_KEYWORDS = new Set(['inherit', 'initial', 'unset', 'revert', 'revert-layer', 'currentcolor']);

const requireFile = (relativePath, buildCommand) => {
    const absolutePath = resolve(repoRoot, relativePath);
    if (!existsSync(absolutePath)) {
        throw new Error(`Missing ${relativePath}. Build it first with: ${buildCommand}`);
    }
    return absolutePath;
};

const readJson = (absolutePath) => JSON.parse(readFileSync(absolutePath, 'utf8'));

const kebabCase = (str) => str.replace(/[A-Z]|\d+/g, (m) => `-${m}`).toLowerCase();

/** Matches ag-stack's `paramToVariableName`. */
const paramToVariableName = (name) => `--ag-${kebabCase(name)}`;

/** Groups in docs page order, with their metadata and parameter names. */
const readGroups = () => {
    const groups = readJson(requireFile(GROUPS_FILE, 'n/a - this file is checked in'));
    return Object.entries(groups)
        .filter(([id]) => id !== '_config_')
        .map(([id, { meta = {}, ...parameters }]) => ({
            id,
            name: meta.displayName ?? id,
            description: meta.description ?? null,
            docsPage: meta.page ? { name: meta.page.name, url: new URL(meta.page.url, DOCS_ROOT_URL).href } : null,
            parameterNames: Object.keys(parameters),
        }));
};

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------

const COLOR_TOKEN = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\([^()]*\)|\btransparent\b/gi;

/** Parses a CSS number or percentage, where `percentOf` is the value of 100%. */
const parseComponent = (text, percentOf) =>
    text.endsWith('%') ? (parseFloat(text) / 100) * percentOf : parseFloat(text);

const hslToRgb = (h, s, l) => {
    const f = (n) => {
        const k = (n + h / 30) % 12;
        return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return [f(0) * 255, f(8) * 255, f(4) * 255];
};

/** Parses a colour literal into `[r, g, b, a]` with r, g, b in 0-255 and a in 0-1. */
const parseColor = (text) => {
    const css = text.trim().toLowerCase();
    if (css === 'transparent') {
        return [0, 0, 0, 0];
    }
    if (css.startsWith('#')) {
        const hex = css.slice(1);
        const digits = hex.length <= 4 ? [...hex].map((d) => d + d) : hex.match(/../g);
        if (![3, 4, 6, 8].includes(hex.length) || digits.some((d) => !/^[0-9a-f]{2}$/.test(d))) {
            throw new Error(`Invalid hex colour "${text}"`);
        }
        const [r, g, b, a = 'ff'] = digits.map((d) => parseInt(d, 16));
        return [r, g, b, (typeof a === 'string' ? parseInt(a, 16) : a) / 255];
    }
    const fn = css.match(/^(rgba?|hsla?)\((.*)\)$/);
    if (!fn) {
        throw new Error(`Unsupported colour "${text}"`);
    }
    const [channels, alphaText] = fn[2].split('/');
    const parts = channels.split(/[\s,]+/).filter(Boolean);
    const alphaPart = alphaText?.trim() ?? parts[3];
    const alpha = alphaPart === undefined ? 1 : parseComponent(alphaPart, 1);
    if (fn[1].startsWith('rgb')) {
        return [...parts.slice(0, 3).map((p) => parseComponent(p, 255)), alpha];
    }
    const [h, s, l] = [parseFloat(parts[0]), parseComponent(parts[1], 1), parseComponent(parts[2], 1)];
    return [...hslToRgb(h, s, l), alpha];
};

/** Full-precision colour used while resolving, so nested mixes are not rounded at each step. */
const preciseColor = ([r, g, b, a]) => `rgb(${r} ${g} ${b} / ${a})`;

const toHex = ([r, g, b, a]) => {
    const byte = (n) =>
        Math.round(Math.max(0, Math.min(255, n)))
            .toString(16)
            .padStart(2, '0');
    return `#${byte(r)}${byte(g)}${byte(b)}${a < 1 ? byte(a * 255) : ''}`;
};

/** `color-mix(in srgb, from, to <amount>)`: interpolates premultiplied sRGB, per CSS Color 5. */
const mixColors = (from, to, amount) => {
    const alpha = from[3] * (1 - amount) + to[3] * amount;
    if (alpha === 0) {
        return [0, 0, 0, 0];
    }
    const channel = (i) => (from[i] * from[3] * (1 - amount) + to[i] * to[3] * amount) / alpha;
    return [channel(0), channel(1), channel(2), alpha];
};

// ---------------------------------------------------------------------------
// calc()
// ---------------------------------------------------------------------------

/** Evaluates a `calc()` body whose operands are px lengths or plain numbers. */
const evaluateCalc = (expression) => {
    const tokens = expression.match(/-?\d*\.?\d+(?:px)?|[a-z]+\(|[-+*/(),]/gi);
    if (!tokens || tokens.join('') !== expression.replace(/\s+/g, '')) {
        throw new Error(`Unsupported calc() expression "${expression}"`);
    }
    let pos = 0;
    const next = () => tokens[pos++];
    const expect = (token) => {
        if (next() !== token) {
            throw new Error(`Expected "${token}" in calc() expression "${expression}"`);
        }
    };
    const combine = (left, op, right) => {
        if (op === '+' || op === '-') {
            if (left.px !== right.px) {
                throw new Error(`Mixed units in calc() expression "${expression}"`);
            }
            return { value: op === '+' ? left.value + right.value : left.value - right.value, px: left.px };
        }
        if (right.px && (op === '/' || left.px)) {
            throw new Error(`Unsupported units in calc() expression "${expression}"`);
        }
        return { value: op === '*' ? left.value * right.value : left.value / right.value, px: left.px || right.px };
    };
    const parseOperand = () => {
        const token = next();
        if (token === '(') {
            const value = parseSum();
            expect(')');
            return value;
        }
        if (token === 'max(' || token === 'min(' || token === 'calc(') {
            const args = [parseSum()];
            while (tokens[pos] === ',') {
                next();
                args.push(parseSum());
            }
            expect(')');
            if (token === 'calc(') {
                return args[0];
            }
            if (args.some((arg) => arg.px !== args[0].px)) {
                throw new Error(`Mixed units in calc() expression "${expression}"`);
            }
            const pick = token === 'max(' ? Math.max : Math.min;
            return { value: pick(...args.map((arg) => arg.value)), px: args[0].px };
        }
        if (/^-?\d*\.?\d+(px)?$/i.test(token)) {
            return { value: parseFloat(token), px: token.toLowerCase().endsWith('px') };
        }
        throw new Error(`Unexpected "${token}" in calc() expression "${expression}"`);
    };
    const parseProduct = () => {
        let value = parseOperand();
        while (tokens[pos] === '*' || tokens[pos] === '/') {
            value = combine(value, next(), parseOperand());
        }
        return value;
    };
    const parseSum = () => {
        let value = parseProduct();
        while (tokens[pos] === '+' || tokens[pos] === '-') {
            value = combine(value, next(), parseProduct());
        }
        return value;
    };
    const result = parseSum();
    if (pos !== tokens.length) {
        throw new Error(`Unexpected "${tokens[pos]}" in calc() expression "${expression}"`);
    }
    const value = Number(result.value.toFixed(4));
    return result.px ? `${value}px` : String(value);
};

/** Index just after the parenthesis closing the one opened before `start`. */
const findClosingParen = (css, start) => {
    let depth = 1;
    for (let i = start; i < css.length; i++) {
        depth += css[i] === '(' ? 1 : css[i] === ')' ? -1 : 0;
        if (depth === 0) {
            return i + 1;
        }
    }
    throw new Error(`Unbalanced parentheses in "${css}"`);
};

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

const COLOR_MIX = /color-mix\(in srgb, ([^,()]+(?:\([^()]*\))?), ([^,()]+(?:\([^()]*\))?) ([\d.]+)%\)/;

/** Evaluates the `color-mix()` and `calc()` functions in CSS whose `var()`s are already substituted. */
const evaluateFunctions = (css) => {
    let result = css.replace(COLOR_TOKEN, (color) => preciseColor(parseColor(color)));
    for (let match; (match = result.match(COLOR_MIX));) {
        const [whole, from, to, percent] = match;
        const mixed = mixColors(parseColor(from), parseColor(to), parseFloat(percent) / 100);
        result = result.replace(whole, preciseColor(mixed));
    }
    for (let start; (start = result.indexOf('calc(')) !== -1;) {
        const end = findClosingParen(result, start + 'calc('.length);
        result =
            result.slice(0, start) + evaluateCalc(result.slice(start + 'calc('.length, end - 1)) + result.slice(end);
    }
    return result;
};

/**
 * Parameter name -> the CSS value the theme emits for it, read from the generated
 * `--ag-foo: var(--ag-inherited-foo, <value>);` declarations of the default mode.
 */
const readParamsCss = (theme, paramNames) => {
    const nameByVariable = new Map(paramNames.map((name) => [paramToVariableName(name), name]));
    const defaultModeBlock = theme._getParamsCss().split('\n}\n')[0];
    const css = {};
    for (const [, variable, value] of defaultModeBlock.matchAll(
        /^\t(--ag-[\w-]+): var\(--ag-inherited-[\w-]+, (.*)\);$/gm
    )) {
        const name = nameByVariable.get(variable);
        if (!name) {
            throw new Error(`No theme parameter for CSS variable ${variable}`);
        }
        css[name] = value;
    }
    return css;
};

/** Parameter name -> resolved value, with every `var()`, `color-mix()` and `calc()` evaluated. */
const resolveParams = (paramsCss, typeOf) => {
    const nameByVariable = new Map(Object.keys(paramsCss).map((name) => [paramToVariableName(name), name]));
    const precise = {};
    const resolving = new Set();
    const resolvePrecise = (name) => {
        if (name in precise) {
            return precise[name];
        }
        if (resolving.has(name)) {
            throw new Error(`Circular reference resolving theme parameter "${name}"`);
        }
        resolving.add(name);
        const substituted = paramsCss[name].replace(/var\((--ag-[\w-]+)\)/g, (_, variable) => {
            const ref = nameByVariable.get(variable);
            if (!ref) {
                throw new Error(`Theme parameter "${name}" references unknown CSS variable ${variable}`);
            }
            return resolvePrecise(ref);
        });
        try {
            precise[name] = CSS_WIDE_KEYWORDS.has(substituted.toLowerCase())
                ? substituted
                : evaluateFunctions(substituted);
        } catch (e) {
            throw new Error(`Cannot resolve theme parameter "${name}" (${paramsCss[name]}): ${e.message}`);
        }
        resolving.delete(name);
        return precise[name];
    };
    const resolved = {};
    for (const name of Object.keys(paramsCss)) {
        const value = resolvePrecise(name);
        resolved[name] =
            COLOR_TYPES.has(typeOf(name)) && !CSS_WIDE_KEYWORDS.has(value.toLowerCase())
                ? toHex(parseColor(value))
                : value.replace(COLOR_TOKEN, (color) => toHex(parseColor(color)));
    }
    return resolved;
};

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

const defaultParams = (part) => part.modeParams[DEFAULT_MODE] ?? {};

/**
 * Names a part by the export applications import it as. Parameter-only parts made by
 * `withParams()` have no export, so are named by the defaults they hold.
 */
const partNamer = (grid) => {
    const names = new Map();
    for (const [name, value] of Object.entries(grid)) {
        if (value && typeof value === 'object' && 'feature' in value && 'modeParams' in value) {
            names.set(value, name);
        }
    }
    const coreDefaults = JSON.stringify(grid._coreThemeDefaults);
    const quartzParams = JSON.stringify(grid._themeQuartzParams());
    return (part) => {
        const params = JSON.stringify(defaultParams(part));
        if (names.has(part)) {
            return names.get(part);
        }
        if (params === coreDefaults) {
            return 'coreDefaults';
        }
        return params === quartzParams ? 'themeQuartzParams' : part.feature;
    };
};

/**
 * Every Quartz colour scheme: themeQuartz with each exported colour scheme part applied, and
 * the `data-ag-theme-mode` value (if any) that selects the same params in plain themeQuartz.
 */
const readColorSchemes = (grid) => {
    const variableModes = Object.entries(grid[COLOR_SCHEME_VARIABLE].modeParams);
    const modeOf = (part) => {
        const params = JSON.stringify(defaultParams(part));
        return variableModes.find(
            ([mode, modeParams]) => mode !== DEFAULT_MODE && JSON.stringify(modeParams) === params
        )?.[0];
    };
    const variableDefault = JSON.stringify(grid[COLOR_SCHEME_VARIABLE].modeParams[DEFAULT_MODE]);
    const modeOrder = variableModes.map(([mode]) => mode);
    // Schemes selectable by mode in plain themeQuartz first, in mode order, then the rest
    const rank = (scheme) => (scheme.themeQuartzMode ? modeOrder.indexOf(scheme.themeQuartzMode) : modeOrder.length);
    return Object.keys(grid)
        .filter((name) => name.startsWith(COLOR_SCHEME_PREFIX) && name !== COLOR_SCHEME_VARIABLE)
        .map((name) => {
            const part = grid[name];
            return {
                id: `quartz${kebabCase(name.slice(COLOR_SCHEME_PREFIX.length))}`,
                part: name,
                themeQuartzDefault: JSON.stringify(defaultParams(part)) === variableDefault,
                themeQuartzMode: modeOf(part) ?? null,
                theme: grid.themeQuartz.withPart(part),
            };
        })
        .sort((a, b) => rank(a) - rank(b));
};

const generate = async () => {
    const docs = readJson(requireFile(DOCS_FILE, 'yarn nx generate-doc-references ag-grid-docs'));
    const grid = await import(pathToFileURL(requireFile(GRID_BUNDLE, 'yarn nx build:package ag-grid-community')).href);
    const { version } = readJson(requireFile(GRID_PACKAGE_JSON, 'n/a - this file is checked in'));
    const { themeQuartz } = grid;

    const defaults = themeQuartz._getModeParams()[DEFAULT_MODE];
    for (const name of Object.keys(docs)) {
        if (defaults[name] === undefined) {
            throw new Error(`No default value for theme parameter "${name}"`);
        }
    }

    const partName = partNamer(grid);
    // Parameters no part defines come from the defaults ag-stack shares across AG products
    const definingPart = {};
    for (const part of themeQuartz.parts) {
        for (const name of Object.keys(defaultParams(part))) {
            definingPart[name] ??= partName(part);
        }
    }

    const typeOf = (name) => docs[name]?.type.returnType ?? null;
    const colorSchemes = readColorSchemes(grid).map((scheme) => {
        const values = scheme.theme._getModeParams()[DEFAULT_MODE];
        const css = readParamsCss(scheme.theme, Object.keys(values));
        return { ...scheme, values, css, resolved: resolveParams(css, typeOf) };
    });

    const groups = readGroups();
    const groupOf = new Map(groups.flatMap((group) => group.parameterNames.map((name) => [name, group.id])));
    const allNames = [...new Set([...Object.keys(defaults), ...Object.keys(docs)])];
    const ungroupedNames = allNames.filter((name) => !groupOf.has(name));

    const describeParam = (name) => ({
        name,
        group: groupOf.get(name) ?? null,
        cssVariable: paramToVariableName(name),
        type: typeOf(name),
        description: docs[name]?.meta.comment ?? null,
        definedBy: definingPart[name] ?? SHARED_DEFAULTS,
        defaultValue: defaults[name],
        values: Object.fromEntries(
            colorSchemes.map((scheme) => [
                scheme.id,
                { value: scheme.values[name], css: scheme.css[name], resolved: scheme.resolved[name] },
            ])
        ),
    });

    return {
        gridVersion: version,
        theme: {
            name: 'themeQuartz',
            parts: themeQuartz.parts.map((part) => ({
                name: partName(part),
                feature: part.feature ?? null,
                params: Object.keys(defaultParams(part)),
            })),
        },
        colorSchemes: colorSchemes.map(({ theme, values, css, resolved, ...scheme }) => scheme),
        groups: groups.map(({ parameterNames, ...group }) => group),
        parameters: [...groups.flatMap((group) => group.parameterNames), ...ungroupedNames].map(describeParam),
    };
};

/** Local time as `hh:mm-dd-mm-yy`. */
const formatGeneratedAt = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    return `${time}-${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${pad(date.getFullYear() % 100)}`;
};

const outIndex = process.argv.indexOf('--out');
const outArg = outIndex === -1 ? undefined : process.argv[outIndex + 1];
if (!outArg) {
    console.error('Usage: node scripts/output-theme-params-json.mjs --out <directory>');
    process.exit(1);
}
const outDir = resolve(process.cwd(), outArg);
if (existsSync(outDir) && !statSync(outDir).isDirectory()) {
    console.error(`--out must be a directory, but ${outDir} is a file`);
    process.exit(1);
}

const { gridVersion, ...params } = await generate();
const output = { gridVersion, generatedAt: formatGeneratedAt(new Date()), ...params };
const outPath = resolve(outDir, `${gridVersion}-theme-params.json`);
mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);

const ungroupedCount = output.parameters.filter((param) => param.group === null).length;
console.log(
    `Wrote ${output.parameters.length} theme parameters (${ungroupedCount} ungrouped) in ${output.groups.length} groups, ` +
        `${output.colorSchemes.length} colour schemes to ${outPath}`
);
