module.exports = {
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.test.json'
        }
    },
    roots: [
        "<rootDir>/src"
    ],
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
    testEnvironment: 'jsdom',
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    setupFiles: ['jest-canvas-mock'],
};
