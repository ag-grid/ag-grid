import type { Framework, ImportType } from '@ag-grid-types';

export const getGridDependencies = ({
    framework,
    isIntegratedCharts,
    importType,
}: {
    framework: Framework;
    isIntegratedCharts: boolean;
    importType?: ImportType;
}) => {
    const dependencies: string[] = [];

    if (importType === 'packages') {
        if (framework === 'react') {
            dependencies.push('ag-grid-react');
        } else if (framework === 'angular') {
            dependencies.push('ag-grid-angular');
        } else if (framework === 'vue') {
            dependencies.push('ag-grid-vue3');
        }

        if (isIntegratedCharts) {
            dependencies.push('ag-grid-charts-enterprise');
        } else {
            dependencies.push('ag-grid-enterprise');
        }
    } else if (importType === 'modules') {
        dependencies.push('@ag-grid-community/client-side-row-model', '@ag-grid-community/styles');

        if (framework === 'react') {
            dependencies.push('@ag-grid-community/react');
        } else if (framework === 'angular') {
            dependencies.push('@ag-grid-community/angular');
        } else if (framework === 'vue') {
            dependencies.push('@ag-grid-community/vue3');
        }

        if (isIntegratedCharts) {
            dependencies.push('@ag-grid-enterprise/core', '@ag-grid-enterprise/charts-enterprise');
        } else {
            dependencies.push('@ag-grid-enterprise/core');
        }
    }

    return dependencies;
};
