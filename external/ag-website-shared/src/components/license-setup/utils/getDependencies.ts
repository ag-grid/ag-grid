import type { Framework, Library } from '@ag-grid-types';

const getGridDependencies = ({ framework }: { framework: Framework }) => {
    const dependencies: string[] = [];

    if (framework === 'react') {
        dependencies.push('ag-grid-react');
    } else if (framework === 'angular') {
        dependencies.push('ag-grid-angular');
    } else if (framework === 'vue') {
        dependencies.push('ag-grid-vue3');
    }

    dependencies.push('ag-grid-community', 'ag-grid-enterprise');

    return dependencies;
};

const getChartsDependencies = ({ framework }: { framework: Framework }) => {
    const dependencies: string[] = [];

    dependencies.push('ag-charts-enterprise');
    if (framework === 'react') {
        dependencies.push('ag-charts-react');
    } else if (framework === 'angular') {
        dependencies.push('ag-charts-angular');
    } else if (framework === 'vue') {
        dependencies.push('ag-charts-vue3');
    }

    return dependencies;
};

export const getDependencies = ({ library, framework }: { library: Library; framework: Framework }) => {
    return library === 'grid'
        ? getGridDependencies({
              framework,
          })
        : getChartsDependencies({
              framework,
          });
};
