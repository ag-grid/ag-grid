import type { InternalFramework } from '@ag-grid-types';
import { getIsDev } from '@utils/env';
import { exampleRunnerAsset } from '@utils/exampleModules/exampleRunnerAsset';
import {
    DEVELOPMENT_FLAGS,
    DEV_FLAG_PLACEHOLDERS,
    FRAMEWORK_VERSION_PLACEHOLDER,
    IMPORT_MAP_OPTIONS_ID,
    PRODUCTION_FLAGS,
    getDefaultFrameworkVersion,
    getImportMap,
} from '@utils/exampleModules/getImportMap';

interface Props {
    internalFramework: InternalFramework;
    isEnterprise: boolean;
    isIntegratedCharts?: boolean;
    /**
     * Whether the page is exported to Plunker or CodeSandbox, and so has neither a URL to read
     * `?version=` from nor any guarantee that the injector is reachable
     */
    isExported?: boolean;
    nonce?: string;
}

/**
 * Renders the map with a token wherever the framework version or the build appears, so that one
 * rendered map can serve every version and build the URL asks for -- unless the page is to carry
 * the map resolved, in which case the values it would be substituted with are rendered in.
 */
const renderImportMap = ({ internalFramework, isEnterprise, isIntegratedCharts, isExported }: Omit<Props, 'nonce'>) => {
    const defaultVersion = getDefaultFrameworkVersion(internalFramework);
    // Frameworkless examples have no version to substitute, and an exported page has nothing to
    // substitute from, so both carry the map as rendered
    const isResolved = isExported || !defaultVersion;
    const dev = getIsDev() ? DEVELOPMENT_FLAGS : PRODUCTION_FLAGS;
    const imports = getImportMap({
        internalFramework,
        isEnterprise,
        isIntegratedCharts,
        frameworkVersion: isResolved ? defaultVersion : FRAMEWORK_VERSION_PLACEHOLDER,
        dev: isResolved ? dev : DEV_FLAG_PLACEHOLDERS,
    });

    return { imports, defaultVersion, isResolved };
};

/**
 * The import map that resolves the example's bare package specifiers.
 *
 * For framework examples the runner registers it in the browser rather than serving it as markup,
 * so that `?version=` and `?prod=` can pick the framework version and build. Which build the page
 * falls back to is fixed when it is generated: the development one under the dev server, so that
 * local examples run against React's development build as they did under SystemJS. The page
 * carries the rendered map and nothing else; what substitutes and registers it is served -- see
 * `public/example-runner/inject-import-map.js`.
 *
 * Exported pages instead carry the map resolved, as markup. They have no URL to read a version
 * from, and nothing else in an export is load-bearing the way the map is: a page that cannot reach
 * the injector resolves no specifier at all, so the example does not load.
 */
export const ExampleImportMap = ({ internalFramework, isEnterprise, isIntegratedCharts, isExported, nonce }: Props) => {
    const { imports, defaultVersion, isResolved } = renderImportMap({
        internalFramework,
        isEnterprise,
        isIntegratedCharts,
        isExported,
    });

    if (isResolved) {
        return (
            <script nonce={nonce} type="importmap" dangerouslySetInnerHTML={{ __html: JSON.stringify({ imports }) }} />
        );
    }

    return (
        <>
            <script
                nonce={nonce}
                type="application/json"
                id={IMPORT_MAP_OPTIONS_ID}
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({ imports, defaultVersion, defaultProd: !getIsDev() }),
                }}
            />
            <script nonce={nonce} src={exampleRunnerAsset('inject-import-map.js')} />
        </>
    );
};
