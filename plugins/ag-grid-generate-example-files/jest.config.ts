/* eslint-disable */
export default {
    displayName: 'plugins-ag-grid-generate-example-files',
    preset: '../../jest.preset.js',
    transform: {
        '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/packages/plugins/ag-grid-generate-example-files',
};
