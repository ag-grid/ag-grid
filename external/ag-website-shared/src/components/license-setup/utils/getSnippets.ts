import type { Framework, ImportType } from '@ag-grid-types';
import { agGridVersion } from '@constants';

import { getGridDependencies } from './getDependencies';
import { GRID_LICENSE_TEMPLATES, getChartsTemplate } from './templates';

export const getDependenciesSnippet = ({
    framework,
    isIntegratedCharts,
    importType,
}: {
    framework: Framework;
    isIntegratedCharts: boolean;
    importType?: ImportType;
}) => {
    const dependencies = getGridDependencies({
        framework,
        isIntegratedCharts,
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
    isIntegratedCharts,
    importType,
}: {
    framework: Framework;
    isIntegratedCharts: boolean;
    importType?: ImportType;
}) => {
    const dependencies = getGridDependencies({
        framework,
        isIntegratedCharts,
        importType,
    });
    const dependenciesStr = dependencies.join(' ');

    return dependencies.length > 0 ? `npm install ${dependenciesStr}` : undefined;
};

export const getBootstrapSnippet = ({
    framework,
    importType,
    license: rawLicense,
    isIntegratedCharts,
}: {
    framework: Framework;
    license?: string;
    importType?: ImportType;
    isIntegratedCharts?: boolean;
}): {
    grid: string;
    charts: string;
} => {
    const license = rawLicense?.trim();
    const frameworkTemplate = GRID_LICENSE_TEMPLATES[framework];
    const gridTemplate = frameworkTemplate[importType];

    return {
        grid: (gridTemplate && gridTemplate({ license, isIntegratedCharts })).trim() || '',
        charts: getChartsTemplate({ license }),
    };
};
