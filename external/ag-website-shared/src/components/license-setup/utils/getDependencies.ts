import type { Framework, ImportType } from '@ag-grid-types';

import type { Products } from '../types';

export const getDependencies = ({
    framework,
    products,
    importType,
}: {
    framework: Framework;
    products: Products;
    importType?: ImportType;
}) => {
    const dependencies: string[] = [];

    if (importType === 'packages') {
        if (products.gridEnterprise || products.integratedEnterprise) {
            if (framework === 'react') {
                dependencies.push('ag-grid-react');
            } else if (framework === 'angular') {
                dependencies.push('ag-grid-angular');
            } else if (framework === 'vue') {
                dependencies.push('ag-grid-vue3');
            }
        }

        if (products.chartsEnterprise) {
            if (framework === 'react') {
                dependencies.push('ag-charts-react');
            } else if (framework === 'angular') {
                dependencies.push('ag-charts-angular');
            } else if (framework === 'vue') {
                dependencies.push('ag-charts-vue3');
            }
        }

        if (products.integratedEnterprise) {
            dependencies.push('ag-grid-charts-enterprise');

            if (products.chartsEnterprise) {
                dependencies.push('ag-charts-enterprise');
            }
        } else if (products.gridEnterprise) {
            dependencies.push('ag-grid-enterprise');

            if (products.chartsEnterprise) {
                dependencies.push('ag-charts-enterprise');
            }
        } else if (products.chartsEnterprise) {
            dependencies.push('ag-charts-enterprise');
        } else {
            dependencies.push('ag-grid-react', 'ag-grid-community', 'ag-charts-react', 'ag-charts-community');
        }
    } else if (importType === 'modules') {
        // TODO
        // dependencies.push('@ag-grid-community/client-side-row-model', '@ag-grid-community/styles');
        // if (framework === 'react') {
        //     dependencies.push('@ag-grid-community/react');
        // } else if (framework === 'angular') {
        //     dependencies.push('@ag-grid-community/angular');
        // } else if (framework === 'vue') {
        //     dependencies.push('@ag-grid-community/vue3');
        // }
        // if (licensedProducts.grid) {
        //     dependencies.push('@ag-grid-enterprise/core');
        //     if (licensedProducts.charts) {
        //         dependencies.push('@ag-grid-enterprise/charts-enterprise');
        //     }
        // } else {
        //     if (licensedProducts.charts) {
        //         // Invalid state - need grid to be enabled
        //     }
        // }
    }

    return dependencies;
};
