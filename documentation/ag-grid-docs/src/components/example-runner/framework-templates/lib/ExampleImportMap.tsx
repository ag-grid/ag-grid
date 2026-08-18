import type { InternalFramework } from '@ag-grid-types';
import { getIsDev } from '@utils/env';
import {
    DEVELOPMENT_FLAGS,
    DEV_FLAG_PLACEHOLDERS,
    FRAMEWORK_VERSION_PLACEHOLDER,
    PRODUCTION_FLAGS,
    getDefaultFrameworkVersion,
    getImportMap,
} from '@utils/exampleModules/getImportMap';

import { ExampleRunnerCall } from './ExampleRunnerClient';

interface Props {
    internalFramework: InternalFramework;
    isEnterprise: boolean;
    isIntegratedCharts?: boolean;
    isExported?: boolean;
    nonce?: string;
}

const renderImportMap = ({ internalFramework, isEnterprise, isIntegratedCharts, isExported }: Omit<Props, 'nonce'>) => {
    const defaultVersion = getDefaultFrameworkVersion(internalFramework);
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
        <ExampleRunnerCall
            fn="injectImportMap"
            args={[{ imports, defaultVersion, defaultProd: !getIsDev(), nonce }]}
            nonce={nonce}
        />
    );
};
