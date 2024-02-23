module.exports = {
    roots: [
        '<rootDir>/src',
    ],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
            },
        ],
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: [
        'js',
        'json',
        'jsx',
        'node',
        'ts',
        'tsx',
    ],
    testEnvironment: 'jsdom',
    preset: 'ts-jest',
}
