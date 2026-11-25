// Generates the CSS files in `ag-grid-community/css` used with `staticCssTheme`, from the same
// CSS, params and parts that the Theming API injects at runtime. Reads themes and parts from the
// built package, so `build:package` must have run first.
import type { StaticCssThemeDefaults, StaticCssThemePart, Theme } from 'ag-stack';
import {
    PartImpl,
    _STATIC_CSS_INHERIT_CLASS,
    _STATIC_CSS_THEME_CLASS,
    _STATIC_CSS_THEME_DEFAULT_PARTS,
    _asThemeImpl,
    _staticCssGridFile,
    _staticCssIconSetFile,
    _staticCssPartName,
    _themePartClass,
    _themePartFeatures,
    paramToVariableName,
    paramValueToCss,
} from 'ag-stack';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import postcss from 'postcss';
import prettier from 'prettier';
import stylelint from 'stylelint';

import * as grid from 'ag-grid-community';

type Feature = (typeof _themePartFeatures)[number];

const require = createRequire(import.meta.url);
const packageRoot = path.resolve(import.meta.dirname, '..');
const packagesRoot = path.resolve(packageRoot, '..');
const outputDir = path.join(packageRoot, 'css');

const postcssPlugins = require(path.resolve(packagesRoot, '../postcss-plugins.cjs'));
const stylelintPlugin = path.resolve(packagesRoot, '../plugins/stylelint-plugin-ag/index.mjs');

// a copy of defaultModeName in ag-stack's partImpl.ts, which ag-stack doesn't export; keep them in sync
const DEFAULT_MODE = '$default';
const ICON_SET: Feature = 'iconSet';
const BUILT_IN_ICON_SET = 'quartzRegular';
// every file the linked CSS references is in this one directory, so that applications serving the CSS copy only it
const FILES_DIR = 'ag-grid-files';

const THEMES: Record<StaticCssThemeDefaults, Theme> = {
    quartz: grid.themeQuartz,
    alpine: grid.themeAlpine,
    balham: grid.themeBalham,
    material: grid.themeMaterial,
};
const themeNames = Object.keys(THEMES) as StaticCssThemeDefaults[];
const themeClass = (name: StaticCssThemeDefaults) => `ag-theme-${name}`;

const SOURCE_DIRS = ['ag-stack/src', 'ag-grid-community/src', 'ag-grid-enterprise/src'].map((dir) =>
    path.join(packagesRoot, dir)
);

/** Fails the build when something the generator discovers or assumes no longer holds, rather than silently writing incomplete CSS. */
function sanityCheck(condition: unknown, message: string): asserts condition {
    if (!condition) {
        throw new Error(`Static CSS sanity check failed: ${message}`);
    }
}

const themeLogger = {
    warn: (...args: unknown[]) => {
        throw new Error(`Theme warning: ${JSON.stringify(args)}`);
    },
    error: (...args: unknown[]) => {
        throw new Error(`Theme error: ${JSON.stringify(args)}`);
    },
    preInitErr: (...args: unknown[]) => {
        throw new Error(`Theme error: ${JSON.stringify(args)}`);
    },
};

const themedSelector = (cls: string) => `.${_STATIC_CSS_THEME_CLASS}.${cls}`;
const isSwappable = (part: PartImpl) => (_themePartFeatures as readonly string[]).includes(part.feature!);
const partCss = (part: PartImpl) => (typeof part.css === 'function' ? part.css() : part.css);

const writtenSelectors = new Set<string>();

/** Wraps each selector in its own `:where()`, as a `:where()` containing a selector list is a low-performance key selector. */
const whereEach = (selectors: string[]) => {
    const result = selectors.map((selector) => `:where(${selector})`).join(', ');
    writtenSelectors.add(result);
    return result;
};

const gridExports: Record<string, unknown> = grid;
const partEntries = Object.keys(gridExports).flatMap((name) => {
    const part = gridExports[name];
    return part instanceof PartImpl ? [{ name, part, cls: _themePartClass(name) }] : [];
});

const isDiscovered = (part: unknown) => partEntries.some((entry) => entry.part === part);
sanityCheck(
    isDiscovered(grid.iconSetQuartzRegular) && isDiscovered(grid.tabStyleMaterial),
    'parts discovered from the package exports are missing known parts'
);

for (const { name, part } of partEntries) {
    if (part.feature && !_themePartClass(name).startsWith(_themePartClass(part.feature))) {
        throw new Error(`Part ${name} must be named after its feature ${part.feature}`);
    }
    if (part.cssImports?.length) {
        throw new Error(`Part ${name} has cssImports, which static CSS themes do not support`);
    }
}

// createTheme() builds new part objects on each call, so compare base parts by content
const partContent = (part: PartImpl | undefined) =>
    part && JSON.stringify([part.feature, partCss(part), part.modeParams]);
const baseTheme = _asThemeImpl(grid.createTheme());
const ownParts = (name: StaticCssThemeDefaults) => {
    const { parts } = _asThemeImpl(THEMES[name]);
    sanityCheck(
        baseTheme.parts.every((part, i) => partContent(parts[i]) === partContent(part)) &&
            parts.length > baseTheme.parts.length,
        `${themeClass(name)} does not extend the base theme's parts with parts of its own`
    );
    return parts.slice(baseTheme.parts.length);
};

// every theme sets the same features in the same order, so one feature order gives the Theming API's precedence for all
const featureOrder = ownParts('quartz')
    .filter(isSwappable)
    .map((part) => part.feature!);
sanityCheck(
    JSON.stringify([...featureOrder].sort()) === JSON.stringify([..._themePartFeatures].sort()),
    `themeQuartz sets the features ${featureOrder.join(', ')}, but static CSS themes swap ${_themePartFeatures.join(', ')}`
);
for (const name of themeNames) {
    const defaultParts = _STATIC_CSS_THEME_DEFAULT_PARTS[name];
    const swapped = ownParts(name).filter(isSwappable);
    const expected = featureOrder.map((feature) =>
        _themePartClass(`${feature}-${defaultParts[feature as StaticCssThemePart]}`)
    );
    const actual = swapped.map((part) => partEntries.find((entry) => entry.part === part)?.cls ?? part.feature);
    sanityCheck(
        JSON.stringify(actual) === JSON.stringify(expected),
        `${themeClass(name)} uses the parts ${actual.join(', ')}, but _STATIC_CSS_THEME_DEFAULT_PARTS gives ${expected.join(', ')}`
    );
}

// parts without a swappable feature, e.g. styleMaterial, are only available as part of a theme
const swappableParts = partEntries
    .filter(({ part }) => isSwappable(part))
    .sort((a, b) => featureOrder.indexOf(a.part.feature!) - featureOrder.indexOf(b.part.feature!));
const acceptedPartClasses = Object.entries(grid._STATIC_CSS_THEME_PARTS).flatMap(([feature, values]) =>
    Object.keys(values).map((value) => _themePartClass(`${feature}-${value}`))
);
const exportedPartClasses = swappableParts.map(({ cls }) => cls);
sanityCheck(
    JSON.stringify(acceptedPartClasses.sort()) === JSON.stringify(exportedPartClasses.sort()),
    `the parts that _STATIC_CSS_THEME_PARTS accepts (${acceptedPartClasses.join(', ')}) must match the parts the package exports (${exportedPartClasses.join(', ')})`
);

const allParamNames = new Set<string>();

/** Emits params in the same shape as ThemeImpl._getParamsCss, so that values set on ancestors are inherited. */
const paramsCss = (selectors: string[], modeParams: Record<string, Record<string, unknown>>) => {
    let css = '';
    for (const mode of Object.keys(modeParams)) {
        const params = modeParams[mode];
        let declarations = '';
        for (const key of Object.keys(params).sort()) {
            const value = params[key];
            if (value === undefined) {
                continue;
            }
            const cssValue = paramValueToCss(key, value, themeLogger);
            if (cssValue === false) {
                throw new Error(`Invalid value for theme param ${key}: ${JSON.stringify(value)}`);
            }
            const cssName = paramToVariableName(key);
            allParamNames.add(cssName);
            declarations += `${cssName}: var(${cssName.replace('--ag-', '--ag-inherited-')}, ${cssValue});\n`;
        }
        if (!declarations) {
            continue;
        }
        if (mode === DEFAULT_MODE) {
            css += declarations;
        } else {
            const m = JSON.stringify(mode);
            css += `:where(html[data-ag-theme-mode=${m}],body[data-ag-theme-mode=${m}],.ag-theme-mode[data-ag-theme-mode=${m}]) & {\n${declarations}}\n`;
        }
    }
    return css ? `${whereEach(selectors)} {\n${css}}\n` : '';
};

const inheritanceCss = () => {
    let declarations = '';
    for (const cssName of [...allParamNames].sort()) {
        declarations += `${cssName.replace('--ag-', '--ag-inherited-')}: var(${cssName});\n`;
    }
    return `:where(.${_STATIC_CSS_INHERIT_CLASS}) {\n${declarations}}\n`;
};

/** Collects selectors by CSS text so that CSS shared by several parts is emitted once. */
const groupCssBySelector = (entries: { selector: string; css: string | undefined }[]) => {
    const selectorsByCss = new Map<string, string[]>();
    for (const { selector, css } of entries) {
        if (css) {
            selectorsByCss.set(css, [...(selectorsByCss.get(css) ?? []), selector]);
        }
    }
    let result = '';
    for (const [css, selectors] of selectorsByCss) {
        result += `${whereEach(selectors)} {\n${css}\n}\n`;
    }
    return result;
};

const listFiles = (dir: string) =>
    fs
        .readdirSync(dir, { recursive: true, encoding: 'utf8' })
        .map((file) => path.join(dir, file))
        .sort();

/**
 * All CSS the grid registers at runtime, other than theme parts: shared and core CSS first, as at
 * runtime, then module and component CSS. Partials (`_*.css`) are included by their parents.
 */
const findSourceCssFiles = () => {
    const isSource = (file: string) =>
        file.endsWith('.css') && !path.basename(file).startsWith('_') && !file.includes('/theming/parts/');
    const files = SOURCE_DIRS.flatMap(listFiles).filter(isSource);
    const first = ['ag-stack/src/theming/shared/shared.css', 'ag-grid-community/src/theming/core/core.css'].map(
        (file) => path.join(packagesRoot, file)
    );
    const ordered = [...first, ...files.filter((file) => !first.includes(file))];

    // fail if the bundle and the CSS imported by source have drifted apart, which would leave a feature unstyled
    const imported = new Set<string>();
    for (const file of SOURCE_DIRS.flatMap(listFiles)) {
        if (/\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file)) {
            for (const match of fs.readFileSync(file, 'utf8').matchAll(/from '(\.[^']+\.css)'/g)) {
                imported.add(path.resolve(path.dirname(file), match[1]));
            }
        }
    }
    const missing = [...imported].filter((file) => !ordered.includes(file) && !file.includes('/theming/parts/'));
    const unused = ordered.filter((file) => !imported.has(file));
    if (missing.length || unused.length) {
        throw new Error(
            `Static CSS sources are out of sync with the CSS imported by the source.\n` +
                `Imported but not bundled: ${missing.join(', ') || 'none'}\nBundled but not imported: ${unused.join(', ') || 'none'}`
        );
    }
    sanityCheck(
        files.includes(path.join(packagesRoot, 'ag-grid-enterprise/src/advancedFilter/advanced-filter.css')),
        'source CSS discovery is missing a known enterprise module file'
    );
    return ordered;
};

const markerCss = (variables: string[]) =>
    `/* Used to detect that this file is loaded */\n.ag-measurement-container {\n${variables.map((variable) => `${variable}: 1;\n`).join('')}}\n`;
const iconSetMarker = (file: string) => `--ag-static-css-${file}-loaded`;

const iconSetEntries = swappableParts.filter(({ part }) => part.feature === ICON_SET);
for (const { name, part } of iconSetEntries) {
    sanityCheck(
        Object.values(part.modeParams).every((params) => Object.keys(params).length === 0),
        `icon set ${name} sets params, which static CSS icon set files do not support`
    );
}
const builtInIconSet = iconSetEntries.find(({ cls }) => cls === _themePartClass(`${ICON_SET}-${BUILT_IN_ICON_SET}`));
sanityCheck(builtInIconSet, `the built-in icon set ${BUILT_IN_ICON_SET} was not found`);

const iconSetCss = (part: PartImpl, selector: string) => `${whereEach([selector])} {\n${partCss(part)}\n}\n`;

/** The CSS shared by `ag-grid.css` and `ag-grid-linked.css`: everything but the markers and the built-in icon set. */
const buildGridCss = async () => {
    let css = '';
    for (const file of findSourceCssFiles()) {
        const result = await postcss(postcssPlugins).process(fs.readFileSync(file, 'utf8'), { from: file });
        css += `/* ${path.relative(packagesRoot, file)} */\n${result.css}\n`;
    }

    // Params blocks all have 0 specificity, so source order decides precedence: base params, then
    // params set by swappable parts, then each theme's own parts and params.
    const baseModeParams = baseTheme._getModeParams();
    sanityCheck(DEFAULT_MODE in baseModeParams, `theme params have no ${DEFAULT_MODE} mode`);
    let params = paramsCss([`.${_STATIC_CSS_THEME_CLASS}`], baseModeParams);
    const partCssEntries = [];
    for (const { part, cls } of swappableParts) {
        if (part.feature !== ICON_SET) {
            params += paramsCss([themedSelector(cls)], part.modeParams);
            partCssEntries.push({ selector: themedSelector(cls), css: partCss(part) });
        }
    }
    for (const name of themeNames) {
        const selector = themedSelector(themeClass(name));
        for (const part of ownParts(name)) {
            if (!isSwappable(part)) {
                params += paramsCss([selector], part.modeParams);
                partCssEntries.push({ selector, css: partCss(part) });
            }
        }
    }
    sanityCheck(
        allParamNames.has('--ag-accent-color') && allParamNames.has('--ag-spacing'),
        'theme params are missing known params'
    );
    css += `/* theme params */\n${inheritanceCss()}${params}/* theme parts */\n${groupCssBySelector(partCssEntries)}`;
    return css;
};

/** A file name for an image, from the param that holds it or the class it styles. */
const imageName = (decl: postcss.Declaration) => {
    if (decl.prop.startsWith('--ag-')) {
        return decl.prop.slice('--ag-'.length);
    }
    const selector = decl.parent?.type === 'rule' ? (decl.parent as postcss.Rule).selector : '';
    const iconName = /\.ag-icon-([\w-]+)/.exec(selector)?.[1];
    return iconName ?? [...selector.matchAll(/\.ag-([\w-]+)/g)].at(-1)?.[1] ?? 'image';
};

/** Moves each inlined SVG into its own file, referenced by a URL relative to the CSS file. */
const linkImages = (css: string, imageDir: string) => {
    fs.mkdirSync(path.join(outputDir, imageDir), { recursive: true });
    const contentByFile = new Map<string, string>();
    const root = postcss.parse(css);
    root.walkDecls((decl) => {
        decl.value = decl.value.replace(
            /url\((["'])(data:image\/svg\+xml(?:(?!\1).)*)\1\)/g,
            (_, quote: string, dataUrl: string) => {
                const comma = dataUrl.indexOf(',');
                const meta = dataUrl.slice(0, comma);
                const data = dataUrl.slice(comma + 1);
                const svg = meta.endsWith(';base64')
                    ? Buffer.from(data, 'base64').toString('utf8')
                    : decodeURIComponent(data);
                const name = imageName(decl);
                let file = `${name}.svg`;
                for (let i = 2; contentByFile.has(file) && contentByFile.get(file) !== svg; ++i) {
                    file = `${name}-${i}.svg`;
                }
                contentByFile.set(file, svg);
                return `url(${quote}${imageDir}/${file}${quote})`;
            }
        );
    });
    for (const [file, svg] of contentByFile) {
        fs.writeFileSync(path.join(outputDir, imageDir, file), svg);
    }
    const linked = root.toString();
    sanityCheck(contentByFile.size > 0, `no images were extracted into ${imageDir}`);
    sanityCheck(!linked.includes('data:'), `a data URL was left in the linked CSS for ${imageDir}`);
    return linked;
};

const writtenFiles: string[] = [];

/** Formats the generated CSS to pass the stylelint rules applied to source CSS, so that it reads cleanly in an editor. */
const formatForStylelint = (css: string) => {
    const root = postcss.parse(css);
    root.walk((node) => {
        if (node.type === 'rule' || node.type === 'atrule') {
            // Pass rule-empty-line-before by adding double lines between rules
            node.raws.before = node.parent?.first === node ? '\n' : '\n\n';
        }
        if (node.type === 'rule') {
            // Pass selector-pseudo-element-colon-notation by re-adding the second colon in ::before that cssnano strips
            node.selector = node.selector.replace(/(?<!:):(before|after|first-line|first-letter)\b/g, '::$1');
        }
    });
    return root.toString();
};

const writeCss = async (file: string, css: string) => {
    fs.writeFileSync(path.join(outputDir, file), await prettier.format(formatForStylelint(css), { parser: 'css' }));
    writtenFiles.push(`./css/${file}`);
};

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

const gridCss = await buildGridCss();
const builtInIconSetCss = `/* built-in icon set */\n${iconSetCss(builtInIconSet.part, themedSelector(builtInIconSet.cls))}`;
await writeCss(
    `${_staticCssGridFile(false)}.css`,
    markerCss(['--ag-static-css-loaded', iconSetMarker(_staticCssIconSetFile(BUILT_IN_ICON_SET, false))]) +
        gridCss +
        builtInIconSetCss
);
// the built-in icon set is left out, so that it is linked once, from its own -linked.css file like every other icon set
await writeCss(
    `${_staticCssGridFile(true)}.css`,
    linkImages(markerCss(['--ag-static-css-loaded', '--ag-static-css-linked-loaded']) + gridCss, `${FILES_DIR}/core-images`)
);

for (const { part, cls } of iconSetEntries) {
    const iconSet = cls.replace(_themePartClass(`${ICON_SET}-`), '');
    const file = _staticCssIconSetFile(iconSet, false);
    const linkedFile = _staticCssIconSetFile(iconSet, true);
    if (part !== builtInIconSet.part) {
        await writeCss(
            `${file}.css`,
            markerCss([iconSetMarker(file)]) + iconSetCss(part, themedSelector(cls))
        );
    }
    const linkedCss = markerCss([iconSetMarker(linkedFile)]) + iconSetCss(part, themedSelector(`${cls}-linked`));
    await writeCss(`${linkedFile}.css`, linkImages(linkedCss, `${FILES_DIR}/${_staticCssPartName(ICON_SET, iconSet)}`));
}

// stylelint lints source CSS but not generated files, so apply its rule to the selectors this script writes
const { results: selectorLint } = await stylelint.lint({
    code: [...writtenSelectors].map((selector) => `${selector} { --check: 1; }`).join('\n'),
    config: { plugins: [stylelintPlugin], rules: { 'ag/no-low-performance-key-selector': true } },
});
const slowSelectors = selectorLint[0].warnings.map((warning) => warning.text);
sanityCheck(
    writtenSelectors.size > 0 && slowSelectors.length === 0,
    `generated selectors are low performance:\n${slowSelectors.join('\n')}`
);

const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const listedFiles = (paths: string[]) => paths.filter((file) => file.startsWith('./css/')).sort();
const expectedFiles = JSON.stringify([...writtenFiles].sort());
sanityCheck(
    JSON.stringify(listedFiles(Object.keys(packageJson.exports))) === expectedFiles &&
        JSON.stringify(listedFiles(packageJson.sideEffects)) === expectedFiles,
    `package.json "exports" and "sideEffects" must list exactly the generated files: ${expectedFiles}`
);
