import type { Framework, ImportType } from '@ag-grid-types';
import { agGridVersion } from '@constants';

import type { Products } from '../types';
import { getDependencies } from './getDependencies';
import { GRID_LICENSE_TEMPLATES, getChartsTemplate } from './templates';

export const getDependenciesSnippet = ({
    framework,
    products,
    noProducts,
    importType,
}: {
    framework: Framework;
    products: Products;
    noProducts: boolean;
    importType?: ImportType;
}) => {
    const dependencies = getDependencies({
        framework,
        products,
        noProducts,
        importType,
    });

    const depObject: Record<string, string> = {};
    dependencies.forEach((dependency) => {
        depObject[dependency] = `~${agGridVersion}`;
    });

    return dependencies.length > 0 ? `dependencies: ${JSON.stringify(depObject, null, 4)}` : undefined;
};

export const getNpmInstallSnippet = ({
    framework,
    products,
    noProducts,
    importType,
}: {
    framework: Framework;
    products: Products;
    noProducts: boolean;
    importType?: ImportType;
}) => {
    const dependencies = getDependencies({
        framework,
        products,
        noProducts,
        importType,
    });
    const dependenciesStr = dependencies.join(' ');

    return dependencies.length > 0 ? `npm install ${dependenciesStr}` : undefined;
};

export const getBootstrapSnippet = ({
    framework,
    importType,
    license: rawLicense,
    userProducts = {} as Products,
    noProducts,
}: {
    framework: Framework;
    license?: string;
    importType?: ImportType;
    userProducts?: Products;
    noProducts?: boolean;
}): {
    grid: string;
    charts: string;
} => {
    const license = rawLicense?.trim();
    const frameworkTemplate = GRID_LICENSE_TEMPLATES[framework];
    const gridTemplate = frameworkTemplate[importType];
    const hideLicense = noProducts;

    return {
        grid: (gridTemplate && gridTemplate({ license, userProducts, hideLicense })).trim() || '',
        charts: getChartsTemplate({ license }),
    };
};
