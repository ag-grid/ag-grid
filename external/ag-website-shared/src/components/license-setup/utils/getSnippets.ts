import type { Framework, ImportType } from '@ag-grid-types';
import { agGridVersion } from '@constants';

import type { Products } from '../types';
import { getDependencies } from './getDependencies';
import { TEMPLATES } from './templates';

export const getDependenciesSnippet = ({
    framework,
    products,
    importType,
}: {
    framework: Framework;
    products: Products;
    importType?: ImportType;
}) => {
    const dependencies = getDependencies({
        framework,
        products,
        importType,
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
    userProducts = {} as Products,
}: {
    framework: Framework;
    license?: string;
    importType?: ImportType;
    userProducts?: Products;
}) => {
    const license = rawLicense?.trim();
    const frameworkTemplate = TEMPLATES[framework];
    if (!frameworkTemplate) {
        console.error('Framework template not found for', framework);
        return '';
    }

    const template = frameworkTemplate[importType];

    return (template && template({ license, userProducts })).trim() || '';
};
