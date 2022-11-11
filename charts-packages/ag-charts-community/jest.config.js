const glob = require('glob');
const fs = require('fs');

const pathToGlob = (path) => path.replace('./', '**/');

const tests = glob.sync('./src/**/*.test.ts');
const e2eTests = tests
    .filter((path) => {
        const fileContents = fs.readFileSync(path).toString();

        // 'Heuristic' for finding e2e tests :-P
        return fileContents.indexOf('setupMockCanvas()') >= 0;
    })
    .map(pathToGlob);
const unitTests = tests.map(pathToGlob).filter((path) => !e2eTests.includes(path));

const commonConfig = {
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.test.json',
        },
    },
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testEnvironment: 'jsdom',
    setupFiles: ['jest-canvas-mock'],
};

module.exports = {
    projects: [
        {
            displayName: 'unit',
            roots: ['<rootDir>/src'],
            testMatch: unitTests,
            ...commonConfig,
        },
        {
            displayName: 'e2e',
            roots: ['<rootDir>/src'],
            testMatch: e2eTests,
            // runner: 'jest-serial-runner',
            // maxWorkers: 1,
            // maxConcurrency: 1,
            // slowTestThreshold: 10,
            ...commonConfig,
        },
    ],
};
