import type { Framework } from '@ag-grid-types';

import { ALL_ENTERPRISE_MODULE, INTEGRATED_CHARTS_MODULE, SPARKLINES_MODULE } from './constants';

export type ChartsImportType = 'enterprise' | 'community' | 'none';
interface Params {
    chartsImportType: ChartsImportType;
    selectedModules: SelectedModules;
    framework: Framework;
}

export interface SelectedModules {
    community: string[];
    enterprise: string[];
}

const TAB_SPACING = '    ';

const getModulesWithCharts = (
    modules: string[],
    chartsImportType: ChartsImportType
): { name: string; withCharts: boolean }[] => {
    return modules.map((name) => {
        const isChartsModule = [SPARKLINES_MODULE.moduleName, INTEGRATED_CHARTS_MODULE.moduleName].includes(name);
        const isEnterpriseModule = name === ALL_ENTERPRISE_MODULE;
        const needsCharts =
            (chartsImportType === 'community' || chartsImportType === 'enterprise') &&
            (isChartsModule || isEnterpriseModule);

        return { name, withCharts: needsCharts };
    });
};

const getChartsModuleName = (chartsImportType: ChartsImportType): string => {
    return chartsImportType === 'community' ? 'AgChartsCommunityModule' : 'AgChartsEnterpriseModule';
};

const getReactCodeSnippet = ({ chartsImportType, selectedModules }: Omit<Params, 'framework'>) => {
    const { community, enterprise } = selectedModules;
    const communityImportsString = community.length ? community.map((name) => `${TAB_SPACING}${name},`).join('\n') : '';
    const enterpriseImportsString = enterprise.length
        ? enterprise.map((name) => `${TAB_SPACING}${name},`).join('\n')
        : '';
    const chartsImport =
        chartsImportType === 'community'
            ? "import { AgChartsCommunityModule } from 'ag-charts-community';"
            : chartsImportType === 'enterprise'
              ? "import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';"
              : '';

    const allModulesWithCharts = getModulesWithCharts(community.concat(enterprise), chartsImportType);
    const chartsModuleName = getChartsModuleName(chartsImportType);
    const modulesArrayContent = allModulesWithCharts
        .map(({ name, withCharts }) => {
            const exportName = withCharts ? `${name}.with(${chartsModuleName})` : name;
            return `${TAB_SPACING}${exportName},`;
        })
        .join('\n');

    const communityImport = communityImportsString
        ? `import {\n${communityImportsString}\n} from 'ag-grid-community';`
        : '';
    const enterpriseImport = enterpriseImportsString
        ? `import {\n${enterpriseImportsString}\n} from 'ag-grid-enterprise';`
        : '';

    const imports = [
        chartsImport,
        communityImport,
        enterpriseImport,
        "import { AgGridProvider, AgGridReact } from 'ag-grid-react';",
    ]
        .filter(Boolean)
        .join('\n');

    return `${imports}

const modules = [
${modulesArrayContent}
];

function App() {
    return (
        <AgGridProvider modules={modules}>
            <AgGridReact /* ... props */ />
        </AgGridProvider>
    );
}`;
};

const getDefaultCodeSnippet = ({ chartsImportType, selectedModules }: Omit<Params, 'framework'>) => {
    const { community, enterprise } = selectedModules;
    const communityImportsString = community.length ? community.map((name) => `${TAB_SPACING}${name},`).join('\n') : '';
    const enterpriseImportsString = enterprise.length
        ? enterprise.map((name) => `${TAB_SPACING}${name},`).join('\n')
        : '';
    const chartsImport =
        chartsImportType === 'community'
            ? "import { AgChartsCommunityModule } from 'ag-charts-community';"
            : chartsImportType === 'enterprise'
              ? "import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';"
              : '';

    const allModulesWithCharts = getModulesWithCharts(community.concat(enterprise), chartsImportType);
    const chartsModuleName = getChartsModuleName(chartsImportType);
    const modulesArrayContent = allModulesWithCharts
        .map(({ name, withCharts }) => {
            const exportName = withCharts ? `${name}.with(${chartsModuleName})` : name;
            return `${TAB_SPACING}${exportName},`;
        })
        .join('\n');

    return `${chartsImport ? `${chartsImport}\n` : ''}import {
    ModuleRegistry,${communityImportsString ? `\n${communityImportsString}` : ''}
} from 'ag-grid-community';${
        enterpriseImportsString
            ? `\nimport {
${enterpriseImportsString}
} from 'ag-grid-enterprise';`
            : ''
    }

ModuleRegistry.registerModules([
${modulesArrayContent}
]);`;
};

export function getModuleMappingsSnippet({ chartsImportType, selectedModules, framework }: Params): string | undefined {
    if (!selectedModules.community.length && !selectedModules.enterprise.length) {
        return;
    }

    if (framework === 'react') {
        return getReactCodeSnippet({ chartsImportType, selectedModules });
    }

    return getDefaultCodeSnippet({ chartsImportType, selectedModules });
}
