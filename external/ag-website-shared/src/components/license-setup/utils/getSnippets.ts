import type { Framework, ImportType } from '@ag-grid-types';
import { agGridVersion } from '@constants';

import type { Products } from '../types';
import { getDependencies } from './getDependencies';
import { GRID_LICENSE_TEMPLATES, getChartsTemplate } from './templates';

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
}): {
    grid: string;
    charts: string;
} => {
    const license = rawLicense?.trim();
    const frameworkTemplate = GRID_LICENSE_TEMPLATES[framework];
    const gridTemplate = frameworkTemplate[importType];

    return {
        grid: (gridTemplate && gridTemplate({ license, userProducts })).trim() || '',
        charts: getChartsTemplate({ license }),
    };
};
