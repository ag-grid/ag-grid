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

import {
    DEV_FLAG_PLACEHOLDERS,
    FRAMEWORK_VERSION_PLACEHOLDER,
    IMPORT_MAP_OPTIONS_ID,
    type InjectImportMapOptions,
    injectImportMap,
} from './injectImportMap';

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

/** What the browser needs to turn the rendered template into the map for this page's URL */
const getInjectOptions = (template: string, defaultVersion: string): InjectImportMapOptions => ({
    template,
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
});

/**
 * The import map that resolves the example's bare package specifiers.
 *
 * For framework examples it is registered in the browser rather than served as markup, so that
 * `?version=` and `?prod=` can pick the framework version and build -- see `injectImportMap`.
 */
export const ExampleImportMap = ({ internalFramework, isEnterprise, isIntegratedCharts, nonce }: Props) => {
    const { template, defaultVersion } = renderImportMap({ internalFramework, isEnterprise, isIntegratedCharts });

    if (!defaultVersion) {
        // Nothing to resolve from the URL, so the map is served as rendered
        return <script nonce={nonce} type="importmap" dangerouslySetInnerHTML={{ __html: template }} />;
    }

    const options = JSON.stringify(getInjectOptions(template, defaultVersion));
    const optionsElement = `document.getElementById(${JSON.stringify(IMPORT_MAP_OPTIONS_ID)})`;

    return (
        <>
            <script
                nonce={nonce}
                type="application/json"
                id={IMPORT_MAP_OPTIONS_ID}
                dangerouslySetInnerHTML={{ __html: options }}
            />
            <script
                nonce={nonce}
                dangerouslySetInnerHTML={{
                    __html: `(${injectImportMap})(JSON.parse(${optionsElement}.textContent));`,
                }}
            />
        </>
    );
};
