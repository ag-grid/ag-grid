import type { Framework, ImportType } from '@ag-grid-types';

import type { LicensedProducts } from '../types';

export const getDependencies = ({
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
    const dependencies: string[] = [];

    if (importType === 'packages') {
        if (framework === 'react') {
            dependencies.push('ag-grid-react');
        } else if (framework === 'angular') {
            dependencies.push('ag-grid-angular');
        } else if (framework === 'vue') {
            dependencies.push('ag-grid-vue3');
        }

        if (licensedProducts.grid) {
            if (licensedProducts.charts) {
                dependencies.push('ag-grid-charts-enterprise');
            } else {
                dependencies.push('ag-grid-enterprise');
            }
        } else if (!licensedProducts.grid && framework === 'javascript') {
            dependencies.push('ag-grid-community');
        }
    } else if (importType === 'modules') {
        if (framework === 'react') {
            dependencies.push('@ag-grid-community/react');
        } else if (framework === 'angular') {
            dependencies.push('@ag-grid-community/angular');
        } else if (framework === 'vue') {
            dependencies.push('@ag-grid-community/vue3');
        }

        if (licensedProducts.grid) {
            dependencies.push('@ag-grid-enterprise/core');

            if (licensedProducts.charts) {
                dependencies.push('@ag-grid-enterprise/charts-enterprise');
            }
        } else if (!licensedProducts.grid && framework === 'javascript') {
            dependencies.push('@ag-grid-community/core');
        }
    }

    if (useStandaloneCharts) {
        if (licensedProducts.charts) {
            dependencies.push('ag-charts-enterprise');
        } else {
            dependencies.push('ag-charts-community');
        }
    }

    return dependencies;
};
