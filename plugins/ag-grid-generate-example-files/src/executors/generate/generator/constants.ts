import type { ExampleType, InternalFramework } from './types';

export const EXAMPLE_TYPES: ExampleType[] = ['generated', 'mixed', 'typescript'];

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
// also need to update grid-packages/ag-grid-docs/documentation/src/utils/consts.js if this value is changed
// and grid-packages/ag-grid-docs/example-generator-documentation.js
export const integratedChartsUsesChartsEnterprise = true;