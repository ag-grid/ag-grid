/*
 * Browser-side runtime for documentation examples, exposed as `window.agExampleRunner`.
 *
 * Each generated example page calls into it to:
 *  - set up the page shell (fake `process.env`, global error logging)
 *  - inject an import map, resolving the `?version=` / `?prod=` query params
 *  - seed deterministic randomness for screenshot-stable examples
 *  - notify the parent frame once the example has rendered
 *  - transpile the example's TypeScript modules with the in-page TypeScript
 *    compiler, rewriting relative and CSS imports, and run the entry module
 *
 * No build step is involved: modules are fetched, transpiled and served to the
 * browser as blob URLs at load time.
 */
/* global ts */
(function () {
    const VERSION_PARAM = 'version';
    const PROD_PARAM = 'prod';
    const THEME_MODE_PARAM = 'agThemeMode';
    const THEME_MODES = { 'dark-blue': 'dark', light: 'light' };
    const VERSION_PLACEHOLDER = '0.0.0-ag-framework-version';
    const VERSION_PATTERN = '^\\d+\\.\\d+\\.\\d+(?:-[\\w.-]+)?(?:\\+[\\w.-]+)?$';
    const BUILD_TOKENS = {
        production: { '?ag-dev-query': '', '&ag-dev-appended': '' },
        development: { '?ag-dev-query': '?dev', '&ag-dev-appended': '&dev' },
    };

    const COMPILER_OPTION_ENUMS = { module: 'ModuleKind', target: 'ScriptTarget', jsx: 'JsxEmit' };

    function applyThemeMode() {
        const themeMode = new URLSearchParams(window.location.search).get(THEME_MODE_PARAM);
        const colorScheme =
            themeMode !== null && Object.prototype.hasOwnProperty.call(THEME_MODES, themeMode)
                ? THEME_MODES[themeMode]
                : undefined;

        if (!colorScheme) {
            return;
        }

        document.documentElement.dataset.agThemeMode = themeMode;
        document.documentElement.dataset.colorScheme = colorScheme;
    }

    function setUpPage() {
        window.process = { env: { NODE_ENV: 'development' } };

        applyThemeMode();

        window.addEventListener('error', function (e) {
            console.error('ERROR', e.message, e.filename);
        });
    }

    function injectImportMap(options) {
        const urlParams = new URLSearchParams(window.location.search);
        const requestedVersion = urlParams.get(VERSION_PARAM);
        const requestedProd = urlParams.get(PROD_PARAM);
        const isProd = requestedProd === null ? options.defaultProd !== false : requestedProd !== 'false';
        let version = options.defaultVersion;

        if (requestedVersion !== null) {
            if (!new RegExp(VERSION_PATTERN).test(requestedVersion)) {
                const message = `Example not loaded: "${requestedVersion}" is not a valid ?${VERSION_PARAM}= value. Expected a framework version such as ${options.defaultVersion}.`;

                const banner = document.createElement('div');
                banner.textContent = message;
                banner.setAttribute('style', 'padding: 1rem; font-family: monospace; color: #b00020;');
                document.body.appendChild(banner);

                throw new Error(message);
            }
            version = requestedVersion;
        }

        const substitutions = Object.assign({}, isProd ? BUILD_TOKENS.production : BUILD_TOKENS.development);
        substitutions[VERSION_PLACEHOLDER] = version;

        const rendered = options.imports || JSON.parse(options.template).imports;
        const imports = {};
        Object.keys(rendered).forEach(function (specifier) {
            let url = rendered[specifier];
            Object.keys(substitutions).forEach(function (token) {
                url = url.split(token).join(substitutions[token]);
            });
            imports[specifier] = url;
        });

        const importMap = document.createElement('script');
        importMap.type = 'importmap';
        importMap.textContent = JSON.stringify({ imports: imports });

        if (options.nonce) {
            importMap.nonce = options.nonce;
        }

        document.head.appendChild(importMap);
    }

    function seedRandom(seed) {
        window.agRandom = new Math.seedrandom(seed);

        window.agRandom();
        window.agRandom();
    }

    function postInitMessage(options) {
        const checkInit = function () {
            if (document.querySelector(options.initSelector)) {
                window.parent?.postMessage({
                    type: 'init',
                    pageName: options.pageName,
                    exampleName: options.exampleName,
                });
            } else {
                requestAnimationFrame(checkInit);
            }
        };

        checkInit();
    }

    function runTranspiled(options) {
        const specifierRegex = () => new RegExp(options.specifierRegex, 'g');
        const cssImportRegex = () => new RegExp(options.cssImportRegex, 'gm');
        const assetRegex = new RegExp(options.assetRegex, 'i');
        const moduleExtensionRegex = new RegExp(options.moduleExtensionRegex, 'i');
        const loader = options.stylesheetLoaderName;

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

        return toBlobUrl(new URL(options.entry, document.baseURI).href)
            .then((entryUrl) => import(entryUrl))
            .catch((error) => {
                console.error('ERROR', error && error.message);
            });
    }

    window.agExampleRunner = {
        setUpPage: setUpPage,
        injectImportMap: injectImportMap,
        seedRandom: seedRandom,
        postInitMessage: postInitMessage,
        runTranspiled: runTranspiled,
    };
})();
