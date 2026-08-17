/* global ts */
const options = JSON.parse(document.getElementById('ag-transpiler-options').textContent);

const specifierRegex = () => new RegExp(options.specifierRegex, 'g');
const cssImportRegex = () => new RegExp(options.cssImportRegex, 'gm');
const assetRegex = new RegExp(options.assetRegex, 'i');
const moduleExtensionRegex = new RegExp(options.moduleExtensionRegex, 'i');
const loader = options.stylesheetLoaderName;

const COMPILER_OPTION_ENUMS = { module: 'ModuleKind', target: 'ScriptTarget', jsx: 'JsxEmit' };

const compilerOptions = Object.fromEntries(
    Object.entries(options.compilerOptions).map(([name, value]) => [
        name,
        COMPILER_OPTION_ENUMS[name] ? ts[COMPILER_OPTION_ENUMS[name]][value] : value,
    ])
);

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

const blobUrls = new Map();

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
