import type { InternalFramework } from '@ag-grid-types';
import {
    FRAMEWORK_VERSION_PARAM,
    FRAMEWORK_VERSION_PATTERN,
    PROD_PARAM,
    getDefaultFrameworkVersion,
    getImportMap,
} from '@utils/exampleModules/getImportMap';
import { toModuleFileName } from '@utils/exampleModules/transformExampleModule';
import { pathJoin } from '@utils/pathJoin';

import { BrowserTranspiler } from './BrowserTranspiler';
import { SeedRandom } from './SeedRandom';
import { FRAMEWORK_VERSION_PLACEHOLDER, type InjectImportMapOptions, injectImportMap } from './injectImportMap';

interface Props {
    appLocation: string;
    entryFileName: string;
    internalFramework: InternalFramework;
    isEnterprise: boolean;
    isIntegratedCharts?: boolean;
    usesMathRandom?: boolean;
    /**
     * Whether the example's sources are transpiled in the page rather than served transpiled,
     * which is what Plunker needs (see `BrowserTranspiler`)
     */
    transpileInBrowser?: boolean;
    nonce?: string;
}

/**
 * Example modules are loaded natively by the browser: an import map resolves the bare
 * package specifiers, and the entry file is loaded as a module. TypeScript and JSX sources
 * are transpiled server-side and served as `.js`, so the entry point is requested as such.
 * The exception is Plunker, which is handed the sources as authored -- see `transpileInBrowser`.
 *
 * For framework examples the map is registered in the browser rather than served as markup, so
 * that `?version=` and `?prod=` can pick the framework version and build an example runs
 * against -- see `injectImportMap`.
 */
export const ExampleModules = ({
    appLocation,
    entryFileName,
    internalFramework,
    isEnterprise,
    isIntegratedCharts,
    usesMathRandom,
    transpileInBrowser,
    nonce,
}: Props) => {
    const defaultVersion = getDefaultFrameworkVersion(internalFramework);
    // Substituted in the browser, so the version can come from the URL (see injectImportMap)
    const frameworkVersion = defaultVersion ? FRAMEWORK_VERSION_PLACEHOLDER : undefined;
    const renderMap = (isProd: boolean) => {
        const imports = getImportMap({
            internalFramework,
            isEnterprise,
            isIntegratedCharts,
            frameworkVersion,
            isProd,
        });
        return JSON.stringify({ imports }, null, 4);
    };

    const production = renderMap(true);
    const development = renderMap(false);
    const startFile = pathJoin(appLocation, toModuleFileName(entryFileName));

    const injectOptions: InjectImportMapOptions | undefined = defaultVersion
        ? {
              // Only React has a separate development build, so for the others there is one map
              templates: { production, development: development === production ? undefined : development },
              defaultVersion,
              placeholder: FRAMEWORK_VERSION_PLACEHOLDER,
              versionParam: FRAMEWORK_VERSION_PARAM,
              versionPattern: FRAMEWORK_VERSION_PATTERN.source,
              prodParam: PROD_PARAM,
          }
        : undefined;

    return (
        <>
            {injectOptions ? (
                <script
                    nonce={nonce}
                    dangerouslySetInnerHTML={{ __html: `(${injectImportMap})(${JSON.stringify(injectOptions)});` }}
                />
            ) : (
                // Nothing to resolve from the URL, so the map is served as rendered
                <script nonce={nonce} type="importmap" dangerouslySetInnerHTML={{ __html: production }} />
            )}
            {usesMathRandom && <SeedRandom nonce={nonce} />}

            {/* Examples read `process.env.NODE_ENV` to guard dev-only validations, and nothing
                in a browser defines it. Classic scripts run before deferred module scripts, so
                this is in place by the time the example's own code does. */}
            <script
                nonce={nonce}
                dangerouslySetInnerHTML={{
                    __html: `window.process = { env: { NODE_ENV: 'development' } };
window.addEventListener('error', function (e) { console.error('ERROR', e.message, e.filename); });`,
                }}
            />
            {transpileInBrowser ? (
                <BrowserTranspiler entryFileName={entryFileName} nonce={nonce} />
            ) : (
                <script nonce={nonce} type="module" src={startFile} />
            )}
        </>
    );
};
