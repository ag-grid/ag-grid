import type { InternalFramework } from './types';

/**
 * The source entry file to generate framework code from
 */
export const SOURCE_ENTRY_FILE_NAME = 'main.ts';

/**
 * The main angular file name that is generated from the source entry file
 */
export const ANGULAR_GENERATED_MAIN_FILE_NAME = 'app.component.ts';

export const INTERNAL_FRAMEWORK_DEPENDENCIES: Partial<Record<InternalFramework, Record<string, string>>> = {
    angular: {
        '@angular/core': '^14',
        '@angular/common': '^14',
        '@angular/forms': '^14',
        '@angular/platform-browser': '^14',
    },
    reactFunctional: {
        react: '^18.0.0',
        'react-dom': '^18.0.0',
        '@types/react': '^18.0.0',
        '@types/react-dom': '^18.0.0',
    },
    reactFunctionalTs: {
        react: '^18.0.0',
        'react-dom': '^18.0.0',
        '@types/react': '^18.0.0',
        '@types/react-dom': '^18.0.0',
    },
};

// whether integrated charts includes ag-charts-enterprise or just ag-charts-community
// also need to update documentation/ag-grid-docs/src/constants.ts if this value is changed
export const integratedChartsUsesChartsEnterprise = true;
export const getEnterprisePackageName = () =>
    `ag-grid-${integratedChartsUsesChartsEnterprise ? 'charts-' : ''}enterprise`;
