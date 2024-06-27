const path = require('path');

/** @type {import('jest').Config} */
const config = {
    roots: ['<rootDir>/src'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
            },
        ],
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'ts', 'tsx'],
    testEnvironment: 'jsdom',
    preset: 'ts-jest',

    setupFilesAfterEnv: ['<rootDir>/src/jest.setup.ts'],

    moduleNameMapper: {
        // remap react to version 18 as @ag-grid-community/react by default loads an older version
        '^react$': path.dirname(require.resolve('react/package.json')),
        '^react-dom$': path.dirname(require.resolve('react-dom/package.json')),
    },
};

module.exports = config;
