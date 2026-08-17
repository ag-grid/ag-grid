/**
 * Transpiles the example in the page. Plunker and the static CodeSandbox export host files with no
 * build step, so nothing can transpile the TypeScript before it gets there.
 *
 * Each module is compiled to a blob URL, since a browser will not run TypeScript. A blob has no
 * path, so two things are patched back in per module: relative specifiers, rewritten to the blob
 * URL of the dependency (or to an absolute URL for an asset), and `import.meta.url`, replaced with
 * the module's real URL. Bare specifiers are left to the page's import map.
 *
 * The page carries only what this shares with the server-side transform, in
 * `#ag-transpiler-options`, so the two transpilers cannot drift. `typescript` comes from a CDN,
 * loaded by the tag before this one.
 */
/* global ts */
const options = JSON.parse(document.getElementById('ag-transpiler-options').textContent);

const specifierRegex = () => new RegExp(options.specifierRegex, 'g');
const cssImportRegex = () => new RegExp(options.cssImportRegex, 'gm');
const assetRegex = new RegExp(options.assetRegex, 'i');
const moduleExtensionRegex = new RegExp(options.moduleExtensionRegex, 'i');
const loader = options.stylesheetLoaderName;

/**
 * The counterpart of `STYLESHEET_LOADER`, which the server-side transform injects into the
 * modules it rewrites. Kept as code here rather than passed in as source text, so that an
 * example carrying a CSP does not need `unsafe-eval` to run its own stylesheets. Each module is
 * its own blob, so the loader has to be reachable from all of them -- hence `window`.
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
 * Native resolution has no default extension, and neither do the sources: Angular examples
 * import './app.component'. Each candidate is fetched rather than probed, since the response
 * is what gets compiled anyway.
 */
const fetchModule = async (url) => {
    const candidates = moduleExtensionRegex.test(url)
        ? [url]
        : options.moduleExtensions.map((extension) => url + extension);

    for (const candidate of candidates) {
        const response = await fetch(candidate);
        if (response.ok) {
            return { url: candidate, source: await response.text() };
        }
    }

    throw new Error('Could not resolve example module: ' + url);
};

/** As `rewriteCssImports` server-side, but resolving relative hrefs here rather than in the module */
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
            compilerOptions: options.compilerOptions,
        });
        const withRealUrl = outputText.replaceAll('import.meta.url', JSON.stringify(url));
        const code = await rewriteSpecifiers(withRealUrl, url);

        return URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    })();

    blobUrls.set(requestedUrl, pending);

    return pending;
};

await import(await toBlobUrl(new URL(options.entry, document.baseURI).href));
