import type { InternalFramework } from '@ag-grid-types';
import { getIsDev } from '@utils/env';
import { exampleRunnerAsset } from '@utils/exampleModules/exampleRunnerAsset';
import {
    DEV_FLAG_PLACEHOLDERS,
    FRAMEWORK_VERSION_GLOBAL,
    FRAMEWORK_VERSION_PLACEHOLDER,
    IMPORT_MAP_OPTIONS_ID,
    PRODUCTION_FLAGS,
    getDefaultFrameworkVersion,
    getImportMap,
} from '@utils/exampleModules/getImportMap';
import { getFrameworkDisplayText, getFrameworkFromInternalFramework } from '@utils/framework';

interface Props {
    internalFramework: InternalFramework;
    isEnterprise: boolean;
    isIntegratedCharts?: boolean;
    nonce?: string;
}

/**
 * Renders the map with a token wherever the framework version or the build appears, so that one
 * rendered map can serve every version and build the URL asks for. Frameworks with no version to
 * resolve get their real values rendered in, since nothing is substituted for them in the browser.
 */
const renderImportMap = ({ internalFramework, isEnterprise, isIntegratedCharts }: Omit<Props, 'nonce'>) => {
    const defaultVersion = getDefaultFrameworkVersion(internalFramework);
    const imports = getImportMap({
        internalFramework,
        isEnterprise,
        isIntegratedCharts,
        frameworkVersion: defaultVersion && FRAMEWORK_VERSION_PLACEHOLDER,
        dev: defaultVersion ? DEV_FLAG_PLACEHOLDERS : PRODUCTION_FLAGS,
    });

    // Not pretty-printed: nothing reads this in the page, and the indentation is only weight
    return { template: JSON.stringify({ imports }), defaultVersion };
};

/**
 * The import map that resolves the example's bare package specifiers.
 *
 * For framework examples it is registered in the browser rather than served as markup, so that
 * `?version=` and `?prod=` can pick the framework version and build. Which build the page falls
 * back to is fixed when it is generated: the development one under the dev server, so that local
 * examples run against React's development build as they did under SystemJS. The version is the
 * page's own, written where a reader of `index.html` can change it; the map it is substituted
 * into travels as data, and what registers it is served -- see
 * `public/example-runner/inject-import-map.js`.
 */
export const ExampleImportMap = ({ internalFramework, isEnterprise, isIntegratedCharts, nonce }: Props) => {
    const { template, defaultVersion } = renderImportMap({ internalFramework, isEnterprise, isIntegratedCharts });
    const frameworkName = getFrameworkDisplayText(getFrameworkFromInternalFramework(internalFramework));

    if (!defaultVersion) {
        // Nothing to resolve from the URL, so the map is served as rendered
        return <script nonce={nonce} type="importmap" dangerouslySetInnerHTML={{ __html: template }} />;
    }

    return (
        <>
            <script
                nonce={nonce}
                dangerouslySetInnerHTML={{
                    __html: `\n// The ${frameworkName} version this example runs against -- edit to try another\nwindow.${FRAMEWORK_VERSION_GLOBAL} = '${defaultVersion}';\n`,
                }}
            />
            <script
                nonce={nonce}
                type="application/json"
                id={IMPORT_MAP_OPTIONS_ID}
                dangerouslySetInnerHTML={{ __html: JSON.stringify({ template, defaultProd: !getIsDev() }) }}
            />
            <script nonce={nonce} src={exampleRunnerAsset('inject-import-map.js')} />
        </>
    );
};
