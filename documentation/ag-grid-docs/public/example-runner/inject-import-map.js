(function () {
    const OPTIONS_ID = 'ag-import-map';
    const VERSION_PARAM = 'version';
    const PROD_PARAM = 'prod';
    const VERSION_PLACEHOLDER = '0.0.0-ag-framework-version';
    const VERSION_PATTERN = '^\\d+\\.\\d+\\.\\d+(?:-[\\w.-]+)?(?:\\+[\\w.-]+)?$';
    const BUILD_TOKENS = {
        production: { '?ag-dev-query': '', '&ag-dev-appended': '' },
        development: { '?ag-dev-query': '?dev', '&ag-dev-appended': '&dev' },
    };

    const nonce = document.currentScript ? document.currentScript.nonce : undefined;
    const options = JSON.parse(document.getElementById(OPTIONS_ID).textContent);
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

    if (nonce) {
        importMap.nonce = nonce;
    }

    document.head.appendChild(importMap);
})();
