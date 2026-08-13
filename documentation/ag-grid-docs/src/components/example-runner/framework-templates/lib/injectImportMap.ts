/**
 * Stands in for the framework version in the rendered import map until the browser
 * substitutes the version being run against. Shaped like a version so the entries stay
 * recognisable as URLs.
 */
export const FRAMEWORK_VERSION_PLACEHOLDER = '0.0.0-ag-framework-version';

export interface InjectImportMapOptions {
    /** The import map, serialised, with `placeholder` wherever the framework version goes */
    template: string;
    /** Substituted for `placeholder` when the URL does not request a version */
    defaultVersion: string;
    placeholder: string;
    /** URL parameter naming the framework version to run against */
    versionParam: string;
    /** Source of the pattern a requested version must match */
    versionPattern: string;
}

/**
 * Registers the example page's import map, resolving the framework version from the
 * `?version=` URL parameter when one is given.
 *
 * Example pages are statically generated, so the requested version is not known when the
 * page is built: the map is rendered with a placeholder where the framework version goes,
 * and this substitutes the version and registers the map in the browser. It is emitted as a
 * classic inline script, which the parser runs synchronously -- so the map is in place
 * before the parser reaches the example's module script, which is what the import-map spec
 * requires.
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
    defaultVersion,
    placeholder,
    versionParam,
    versionPattern,
}: InjectImportMapOptions): void {
    const requestedVersion = new URLSearchParams(window.location.search).get(versionParam);
    let version = defaultVersion;

    if (requestedVersion) {
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

    const importMap = document.createElement('script');
    importMap.type = 'importmap';
    importMap.textContent = template.split(placeholder).join(version);
    document.head.appendChild(importMap);
}
