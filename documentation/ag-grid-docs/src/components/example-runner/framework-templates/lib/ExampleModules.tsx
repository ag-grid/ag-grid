import type { InternalFramework } from '@ag-grid-types';
import {
    DEVELOPMENT_FLAGS,
    FRAMEWORK_VERSION_PARAM,
    FRAMEWORK_VERSION_PATTERN,
    PRODUCTION_FLAGS,
    PROD_PARAM,
    getDefaultFrameworkVersion,
    getImportMap,
} from '@utils/exampleModules/getImportMap';
import { toModuleFileName } from '@utils/exampleModules/transformExampleModule';
import { pathJoin } from '@utils/pathJoin';

import { BrowserTranspiler } from './BrowserTranspiler';
import { SeedRandom } from './SeedRandom';
import {
    DEV_FLAG_PLACEHOLDERS,
    FRAMEWORK_VERSION_PLACEHOLDER,
    IMPORT_MAP_OPTIONS_ID,
    type InjectImportMapOptions,
    injectImportMap,
} from './injectImportMap';

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
    // The framework version and build are substituted in the browser, so that they can come
    // from the URL: the map is rendered once, with a token everywhere either one appears
    const imports = getImportMap({
        internalFramework,
        isEnterprise,
        isIntegratedCharts,
        frameworkVersion: defaultVersion && FRAMEWORK_VERSION_PLACEHOLDER,
        dev: defaultVersion ? DEV_FLAG_PLACEHOLDERS : PRODUCTION_FLAGS,
    });
    // Not pretty-printed: nothing reads this in the page, and the indentation is only weight
    const importMap = JSON.stringify({ imports });
    const startFile = pathJoin(appLocation, toModuleFileName(entryFileName));

    const injectOptions: InjectImportMapOptions | undefined = defaultVersion
        ? {
              template: importMap,
              buildTokens: {
                  production: {
                      [DEV_FLAG_PLACEHOLDERS.query]: PRODUCTION_FLAGS.query,
                      [DEV_FLAG_PLACEHOLDERS.appended]: PRODUCTION_FLAGS.appended,
                  },
                  development: {
                      [DEV_FLAG_PLACEHOLDERS.query]: DEVELOPMENT_FLAGS.query,
                      [DEV_FLAG_PLACEHOLDERS.appended]: DEVELOPMENT_FLAGS.appended,
                  },
              },
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
                <>
                    <script
                        nonce={nonce}
                        type="application/json"
                        id={IMPORT_MAP_OPTIONS_ID}
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(injectOptions) }}
                    />
                    <script
                        nonce={nonce}
                        dangerouslySetInnerHTML={{
                            __html:
                                `(${injectImportMap})(JSON.parse(` +
                                `document.getElementById(${JSON.stringify(IMPORT_MAP_OPTIONS_ID)}).textContent));`,
                        }}
                    />
                </>
            ) : (
                // Nothing to resolve from the URL, so the map is served as rendered
                <script nonce={nonce} type="importmap" dangerouslySetInnerHTML={{ __html: importMap }} />
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
