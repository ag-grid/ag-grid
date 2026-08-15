/**
 * Registers the example page's import map, substituting the framework version and build that
 * `?version=` and `?prod=` ask for -- neither is known when the page is statically generated.
 *
 * Served as a classic script rather than inlined, so that an example's `index.html` carries no
 * machinery. The parser runs it synchronously, which is what puts the map in place before the
 * example's module script, as the import-map spec requires -- a module script here would be
 * deferred, and an import map added after module loading has started is an error.
 *
 * The page supplies only what varies per example, in `#ag-import-map`: the rendered map, with
 * a token wherever the version or the build appears, and the build to use by default. The
 * version it runs against is a variable of its own, `window.agFrameworkVersion`, so that a
 * reader of the page can point the example at another version by editing it. Everything below
 * is fixed, and is checked against its TypeScript counterpart by `injectImportMap.test.ts` so
 * the two cannot drift.
 */
(function () {
    var OPTIONS_ID = 'ag-import-map';
    var VERSION_GLOBAL = 'agFrameworkVersion';
    var VERSION_PARAM = 'version';
    var PROD_PARAM = 'prod';
    var VERSION_PLACEHOLDER = '0.0.0-ag-framework-version';
    var VERSION_PATTERN = '^\\d+\\.\\d+\\.\\d+(?:-[\\w.-]+)?(?:\\+[\\w.-]+)?$';
    var BUILD_TOKENS = {
        production: { '?ag-dev-query': '', '&ag-dev-appended': '' },
        development: { '?ag-dev-query': '?dev', '&ag-dev-appended': '&dev' },
    };

    // Read before anything can throw: `document.currentScript` is only this script while it runs
    var nonce = document.currentScript ? document.currentScript.nonce : undefined;
    var options = JSON.parse(document.getElementById(OPTIONS_ID).textContent);
    var urlParams = new URLSearchParams(window.location.search);
    var requestedVersion = urlParams.get(VERSION_PARAM);
    var requestedProd = urlParams.get(PROD_PARAM);
    // The page's default build unless the URL asks for one. A page that names no default -- an
    // export taken before this script asked for one -- gets the production build, since this is
    // served from a mutable URL and so has to keep reading pages older than itself.
    var isProd = requestedProd === null ? options.defaultProd !== false : requestedProd !== 'false';
    // The version the page names unless the URL asks for another, so that editing the page runs
    // the example against a version of the reader's choosing. `defaultVersion` is read for a page
    // from before the version became a variable of its own -- an export taken then.
    var pageVersion = window[VERSION_GLOBAL] || options.defaultVersion;
    var version = requestedVersion === null ? pageVersion : requestedVersion;

    // An empty `?version=` is a version that is not a version, not an absent one, so it fails
    // here rather than quietly loading the default. A well-formed but non-existent one is left
    // to 404 on its own.
    if (!new RegExp(VERSION_PATTERN).test(version)) {
        var source = requestedVersion === null ? 'window.' + VERSION_GLOBAL : '?' + VERSION_PARAM + '=';
        var message =
            'Example not loaded: "' +
            version +
            '" is not a valid ' +
            source +
            ' value. Expected a framework version such as 19.2.1.';

        var banner = document.createElement('div');
        banner.textContent = message;
        banner.setAttribute('style', 'padding: 1rem; font-family: monospace; color: #b00020;');
        document.body.appendChild(banner);

        throw new Error(message);
    }

    var substitutions = Object.assign({}, isProd ? BUILD_TOKENS.production : BUILD_TOKENS.development);
    substitutions[VERSION_PLACEHOLDER] = version;

    var importMapJson = options.template;
    Object.keys(substitutions).forEach(function (token) {
        importMapJson = importMapJson.split(token).join(substitutions[token]);
    });

    var importMap = document.createElement('script');
    importMap.type = 'importmap';
    importMap.textContent = importMapJson;

    // An example may carry a CSP that allows inline scripts only by nonce -- the security-test
    // examples do -- and a script created here has none, so it takes the nonce of this script.
    // Read from the IDL attribute, which keeps the value after the parser hides it.
    if (nonce) {
        importMap.nonce = nonce;
    }

    document.head.appendChild(importMap);
})();
