/**
 * Transpiles the example in the page, for Plunker and the static CodeSandbox export, which host
 * files with no build step.
 *
 * Each module compiles to a blob URL. A blob has no path, so every relative specifier is rewritten
 * to its dependency's blob (assets to an absolute URL) and `import.meta.url` is patched back in per
 * module. Bare specifiers are left to the import map. Options come from `#ag-transpiler-options`,
 * shared with the server-side transform so the two cannot drift. `typescript` comes from a CDN.
 */
/* global ts */
const options = JSON.parse(document.getElementById('ag-transpiler-options').textContent);

const specifierRegex = () => new RegExp(options.specifierRegex, 'g');
const cssImportRegex = () => new RegExp(options.cssImportRegex, 'gm');
const assetRegex = new RegExp(options.assetRegex, 'i');
const moduleExtensionRegex = new RegExp(options.moduleExtensionRegex, 'i');
const loader = options.stylesheetLoaderName;

/**
 * The page names its options (`"target": "ES2022"`), so the numbers come from this `ts`. Mirrors
 * `transformExampleModule.ts`; kept in step by `browserTranspiler.test.ts`.
 */
const COMPILER_OPTION_ENUMS = { module: 'ModuleKind', target: 'ScriptTarget', jsx: 'JsxEmit' };

const compilerOptions = Object.fromEntries(
    Object.entries(options.compilerOptions).map(([name, value]) => [
        name,
        COMPILER_OPTION_ENUMS[name] ? ts[COMPILER_OPTION_ENUMS[name]][value] : value,
    ])
);

/**
 * Counterpart of the server-side `STYLESHEET_LOADER`. Kept as code here so a CSP example needs no
 * `unsafe-eval`, and on `window` because every module is its own blob.
 */
window[loader] = (href) =>
    new Promise((resolve) => {
        const { pathname } = new URL(href, document.baseURI);
        const linked = (link) => new URL(link.href, document.baseURI).pathname === pathname;
        if (Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(linked)) {
            resolve();
            return;
        }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.addEventListener('load', () => resolve());
        link.addEventListener('error', () => resolve());
        document.head.appendChild(link);
    });

const isRelative = (specifier) => specifier.startsWith('./') || specifier.startsWith('../');

/** Modules are keyed by their real URL, so a module shared by two others is compiled once */
const blobUrls = new Map();

/**
 * Every module the example ships, keyed by its URL without the extension: the sources import
 * './app.component' and native resolution has no default extension. The page names the files it
 * carries, so a specifier resolves to the file that exists and no probe request 404s.
 */
const moduleUrls = new Map(
    options.moduleFiles.map((fileName) => {
        const url = new URL(fileName, document.baseURI).href;
        return [url.replace(moduleExtensionRegex, ''), url];
    })
);

const fetchModule = async (url) => {
    const resolved = moduleExtensionRegex.test(url) ? url : moduleUrls.get(url);
    const response = resolved && (await fetch(resolved));

    if (!response || !response.ok) {
        throw new Error('Could not resolve example module: ' + url);
    }

    return { url: resolved, source: await response.text() };
};

/** As `rewriteCssImports` server-side, except that relative hrefs resolve here */
const rewriteCssImports = (source, url) => {
    const rewritten = source.replace(cssImportRegex(), (match, quote, specifier) => {
        if (!isRelative(specifier)) {
            return match;
        }
        return 'await window.' + loader + '(' + JSON.stringify(new URL(specifier, url).href) + ');';
    });

    return rewritten.replace(cssImportRegex(), (_match, _quote, specifier) => {
        return 'await window.' + loader + '(import.meta.resolve(' + JSON.stringify(specifier) + '));';
    });
};

const rewriteSpecifiers = async (source, url) => {
    const rewrites = new Map();

    for (const [, , , specifier] of source.matchAll(specifierRegex())) {
        if (!isRelative(specifier) || rewrites.has(specifier)) {
            continue;
        }

        const resolved = new URL(specifier, url).href;
        rewrites.set(specifier, assetRegex.test(specifier) ? resolved : await toBlobUrl(resolved));
    }

    return source.replace(specifierRegex(), (match, prefix, quote, specifier) =>
        rewrites.has(specifier) ? prefix + quote + rewrites.get(specifier) + quote : match
    );
};

const toBlobUrl = async (requestedUrl) => {
    if (blobUrls.has(requestedUrl)) {
        return blobUrls.get(requestedUrl);
    }

    const pending = (async () => {
        const { url, source } = await fetchModule(requestedUrl);
        const { outputText } = ts.transpileModule(rewriteCssImports(source, url), {
            fileName: url,
            compilerOptions: compilerOptions,
        });
        const withRealUrl = outputText.replaceAll('import.meta.url', JSON.stringify(url));
        const code = await rewriteSpecifiers(withRealUrl, url);

        return URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    })();

    blobUrls.set(requestedUrl, pending);

    return pending;
};

await import(await toBlobUrl(new URL(options.entry, document.baseURI).href));
