/**
 * Stands in for the framework version in the rendered import map until the browser
 * substitutes the version being run against. Shaped like a version so the entries stay
 * recognisable as URLs.
 */
export const FRAMEWORK_VERSION_PLACEHOLDER = '0.0.0-ag-framework-version';

/**
 * Stand in for the two forms the development-build flag takes in a URL (see `DevFlags`), so
 * that one rendered map can serve either build.
 */
export const DEV_FLAG_PLACEHOLDERS = {
    query: '?ag-dev-query',
    appended: '&ag-dev-appended',
};

/** Identifies the JSON block the page carries this function's options in */
export const IMPORT_MAP_OPTIONS_ID = 'ag-import-map-options';

export interface InjectImportMapOptions {
    /**
     * The import map, serialised, with `placeholder` wherever the framework version goes and
     * the build tokens wherever the build is selected.
     */
    template: string;
    /**
     * What the build tokens in `template` stand for in each build, applied whole -- a map with
     * no build-dependent entries, which is every framework but React, substitutes nothing.
     */
    buildTokens: { production: Record<string, string>; development: Record<string, string> };
    /** Substituted for `placeholder` when the URL does not request a version */
    defaultVersion: string;
    placeholder: string;
    /** URL parameter naming the framework version to run against */
    versionParam: string;
    /** Source of the pattern a requested version must match */
    versionPattern: string;
    /** URL parameter asking for the development build, with `prod=false` */
    prodParam: string;
}

/**
 * Registers the example page's import map, resolving the framework version and whether to
 * run against its development build from the `?version=` and `?prod=` URL parameters.
 *
 * Example pages are statically generated, so neither is known when the page is built: the
 * maps are rendered with a placeholder where the framework version goes, and this picks one,
 * substitutes the version and registers it in the browser. It is emitted as a classic inline
 * script, which the parser runs synchronously -- so the map is in place before the parser
 * reaches the example's module script, which is what the import-map spec requires.
 *
 * A version that is not a plausible version string aborts the load with a visible message,
 * rather than quietly running the example against the pinned default. A well-formed but
 * non-existent version is left to fail on its own: the CDN 404s and the example does not
 * start.
 *
 * Serialised into the page with `toString()`, so it must reference nothing outside its own
 * parameters.
 */
export function injectImportMap({
    template,
    buildTokens,
    defaultVersion,
    placeholder,
    versionParam,
    versionPattern,
    prodParam,
}: InjectImportMapOptions): void {
    const urlParams = new URLSearchParams(window.location.search);
    const requestedVersion = urlParams.get(versionParam);
    // Production unless the URL says otherwise, as under SystemJS
    const isProd = urlParams.get(prodParam) !== 'false';
    let version = defaultVersion;

    // An empty `?version=` is a version that is not a version, not an absent one, so it fails
    // below rather than quietly loading the default
    if (requestedVersion !== null) {
        if (!new RegExp(versionPattern).test(requestedVersion)) {
            const message =
                `Example not loaded: "${requestedVersion}" is not a valid ?${versionParam}= value. ` +
                `Expected a framework version such as ${defaultVersion}.`;

            const banner = document.createElement('div');
            banner.textContent = message;
            banner.setAttribute('style', 'padding: 1rem; font-family: monospace; color: #b00020;');
            document.body.appendChild(banner);

            throw new Error(message);
        }
        version = requestedVersion;
    }

    const substitutions: Record<string, string> = {
        [placeholder]: version,
        ...(isProd ? buildTokens.production : buildTokens.development),
    };
    let importMapJson = template;
    for (const token of Object.keys(substitutions)) {
        importMapJson = importMapJson.split(token).join(substitutions[token]);
    }

    const importMap = document.createElement('script');
    importMap.type = 'importmap';
    importMap.textContent = importMapJson;

    // An example may carry a CSP that allows inline scripts only by nonce -- the security-test
    // examples do -- and a script created here has none, so it takes the nonce of the script
    // running this. Read from the IDL attribute, which keeps the value after the parser hides it.
    const nonce = (document.currentScript as HTMLScriptElement | null)?.nonce;
    if (nonce) {
        importMap.nonce = nonce;
    }

    document.head.appendChild(importMap);
}
