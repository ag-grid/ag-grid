/**
 * Transpiles the example in the page, rather than being served the result. Only Plunker and the
 * static CodeSandbox export need this: they host static files with no build step, and have to
 * show the TypeScript the example was authored in, so nothing can transpile the sources before
 * they get there.
 *
 * Modules become blob URLs, because a browser will not execute TypeScript and there is no other
 * URL to give the transpiled output. That costs the two things a real URL provides, both of
 * which are patched back in per module: relative specifiers (rewritten to the blob URL of the
 * dependency, or to an absolute URL for a non-module asset) and `import.meta.url` (substituted
 * with the module's real URL). Bare specifiers are left alone -- a blob module resolves those
 * through the document's import map like any other.
 *
 * Served rather than inlined, so that an example's `index.html` carries no machinery. What the
 * page supplies in `#ag-transpiler-options` is only what this shares with the server-side
 * transform -- the patterns and the compiler options -- so that the two transpilers cannot
 * drift. `typescript` itself is loaded from a CDN by the tag before this one.
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
