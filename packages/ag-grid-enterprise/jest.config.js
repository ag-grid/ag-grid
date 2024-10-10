module.exports = {
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
    testEnvironment: './jest.jsdom-env.cjs',
    preset: 'ts-jest',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
