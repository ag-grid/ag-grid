import type { Framework, ImportType } from '@ag-grid-types';
import { agGridVersion } from '@constants';

import type { LicensedProducts } from '../types';
import { getDependencies } from './getDependencies';
import { TEMPLATES } from './templates';

export const getDependenciesSnippet = ({
    framework,
    licensedProducts,
    importType,
    useStandaloneCharts,
}: {
    framework: Framework;
    licensedProducts: LicensedProducts;
    importType?: ImportType;
    useStandaloneCharts?: boolean;
}) => {
    const dependencies = getDependencies({
        framework,
        licensedProducts,
        importType,
        useStandaloneCharts,
    });

    const depObject: Record<string, string> = {};
    dependencies.forEach((dependency) => {
        depObject[dependency] = `~${agGridVersion}`;
    });

    return dependencies.length > 0 ? `dependencies: ${JSON.stringify(depObject, null, 4)}` : undefined;
};

export const getBootstrapSnippet = ({
    framework,
    importType,
    license: rawLicense,
}: {
    framework: Framework;
    license?: string;
    importType?: ImportType;
}) => {
    const license = rawLicense?.trim();
    const frameworkTemplate = TEMPLATES[framework];
    if (!frameworkTemplate) {
        console.error('Framework template not found for', framework);
        return '';
    }

    const template = frameworkTemplate[importType];

    return (template && template({ license })).trim() || '';
};
