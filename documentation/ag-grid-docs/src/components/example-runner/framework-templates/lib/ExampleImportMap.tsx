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
    /** Whether the page is exported, so it has no URL to read `?version=` from and may not reach the injector */
    isExported?: boolean;
    nonce?: string;
}

/**
/**
 * Tokenises the framework version and build, so one rendered map serves every combination the URL
 * can ask for. A page carrying the map resolved gets the values instead.
 */
const renderImportMap = ({ internalFramework, isEnterprise, isIntegratedCharts, isExported }: Omit<Props, 'nonce'>) => {
    const defaultVersion = getDefaultFrameworkVersion(internalFramework);
    // Frameworkless examples have no version to substitute and exports have nothing to substitute from
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
 * Framework examples register it in the browser, so `?version=` and `?prod=` can pick the framework
 * version and build. The fallback build is fixed when the page is generated: the development one under
 * the dev server, as under SystemJS. The page carries only the rendered map; what substitutes and
 * registers it is served (`public/example-runner/inject-import-map.js`).
 *
 * Exports carry the map resolved, as markup. They have no URL to read a version from, and the map is
 * load-bearing in a way nothing else in an export is: if the injector is unreachable, no specifier
 * resolves and the example never loads.
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
