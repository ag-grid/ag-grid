/**
 * Registers the example page's import map, substituting the framework version and build that
 * `?version=` and `?prod=` ask for -- neither is known when the page is statically generated.
 *
 * Served, so `index.html` carries no machinery. Classic so it runs synchronously: a deferred module
 * script would register the map after module loading starts, which is an error.
 *
 * The page supplies only `#ag-import-map` -- the rendered map, tokenised wherever the version or
 * build appears, plus both defaults. The constants below are checked against their TypeScript
 * counterparts by `injectImportMap.test.ts`.
 */
(function () {
    var OPTIONS_ID = 'ag-import-map';
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
    // The page's default build unless the URL asks for one. Served from a mutable URL, so it must
    // still read older pages: one naming no default gets production.
    var isProd = requestedProd === null ? options.defaultProd !== false : requestedProd !== 'false';
    var version = options.defaultVersion;

    // An empty `?version=` counts as malformed, so it fails loudly. A well-formed but non-existent one
    // is left to 404 on its own.
    if (requestedVersion !== null) {
        if (!new RegExp(VERSION_PATTERN).test(requestedVersion)) {
            var message =
                'Example not loaded: "' +
                requestedVersion +
                '" is not a valid ?' +
                VERSION_PARAM +
                '= value. Expected a framework version such as ' +
                options.defaultVersion +
                '.';

            var banner = document.createElement('div');
            banner.textContent = message;
            banner.setAttribute('style', 'padding: 1rem; font-family: monospace; color: #b00020;');
            document.body.appendChild(banner);

            throw new Error(message);
        }
        version = requestedVersion;
    }

    var substitutions = Object.assign({}, isProd ? BUILD_TOKENS.production : BUILD_TOKENS.development);
    substitutions[VERSION_PLACEHOLDER] = version;

    // Only the URLs carry tokens, so each is substituted in turn. Older pages carry the map as a JSON
    // string, so both forms are read.
    var rendered = options.imports || JSON.parse(options.template).imports;
    var imports = {};
    Object.keys(rendered).forEach(function (specifier) {
        var url = rendered[specifier];
        Object.keys(substitutions).forEach(function (token) {
            url = url.split(token).join(substitutions[token]);
        });
        imports[specifier] = url;
    });

    var importMap = document.createElement('script');
    importMap.type = 'importmap';
    importMap.textContent = JSON.stringify({ imports: imports });

    // The security-test examples allow inline scripts only by nonce, so the map takes this script's.
    // Read from the IDL attribute, which keeps the value after the parser hides it.
    if (nonce) {
        importMap.nonce = nonce;
    }

    document.head.appendChild(importMap);
})();
