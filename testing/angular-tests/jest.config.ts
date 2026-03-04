export default {
    setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
    preset: 'jest-preset-angular',
    resolver: '<rootDir>/jest-resolver.js',
    moduleNameMapper: {
        // Map ag-grid-angular to source so jest-preset-angular JIT compiles it
        '^ag-grid-angular$': '<rootDir>/../../packages/ag-grid-angular/projects/ag-grid-angular/src/public-api.ts',
    },
    transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
};
