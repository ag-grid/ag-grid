const { compilerOptions } = require('./tsconfig.test');

module.exports = {
    roots: ['<rootDir>'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.test.json',
            },
        ],
    },
    modulePaths: [compilerOptions.baseUrl],
    moduleNameMapper: {
        '@ag-grid-community/core': ['node_modules/@ag-grid-community/core/dist/cjs/es6/main.js'],
        '@ag-grid-enterprise/core': ['node_modules/@ag-grid-enterprise/core/dist/cjs/es6/main.js'],
    },
    testEnvironment: 'jsdom',
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
