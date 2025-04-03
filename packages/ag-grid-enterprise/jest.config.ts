import { readFileSync } from 'fs';
import * as glob from 'glob';

// Reading the SWC compilation config and remove the "exclude"
// for the test files to be compiled by SWC
const { exclude: _, ...swcJestConfig } = JSON.parse(readFileSync(`${__dirname}/.swcrc`, 'utf-8'));

// disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves.
// If we do not disable this, SWC Core will read .swcrc and won't transform our test files due to "exclude"
if (swcJestConfig.swcrc === undefined) {
    swcJestConfig.swcrc = false;
}

// Uncomment if using global setup/teardown files being transformed via swc
// https://nx.dev/packages/jest/documents/overview#global-setup/teardown-with-nx-libraries
// jest needs EsModule Interop to find the default exported setup/teardown functions
// swcJestConfig.module.noInterop = false;

const pathToGlob = (path: string) => path.replace('./', '**/');

const tests = glob.sync('packages/ag-grid-enterprise/src/**/*.test.ts');
const unitTests = tests.map(pathToGlob); //.filter((path) => !e2eTests.includes(path));

const commonConfig = {
    resolver: undefined, // NX redirects CSS imports https://github.com/nrwl/nx/blob/7495f0664b19e8fa32ef693f43d709173b6a2bc4/packages/jest/plugins/resolver.ts#L43
    prettierPath: null,
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'html'],
    modulePathIgnorePatterns: ['<rootDir>/dist'],
    testEnvironment: './jest.jsdom-env.cjs',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    preset: '../../jest.preset.js',
    transform: {
        '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
        '^.+\\.css$': 'jest-text-transformer',
        '^.+\\.html$': 'jest-text-transformer',
    },
};

const reporters: any[] = [['default', { summaryThreshold: Infinity }]];
if (process.env.CI != null || process.env.NX_TASK_TARGET_CONFIGURATION === 'ci') {
    reporters.push(['jest-junit', { outputDirectory: 'reports', outputName: 'ag-grid-enterprise.xml' }]);
}

const pathFix = (v: string) => v.replace('packages/ag-grid-enterprise/', '**/');
export default {
    reporters,
    projects: [
        {
            displayName: 'ag-grid-enterprise - unit',
            testMatch: unitTests.map(pathFix),
            ...commonConfig,
        },
    ],
};
