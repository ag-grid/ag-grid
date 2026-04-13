import path from 'node:path';
import { defineConfig } from 'vitest/config';

function resolvePath(srcPath: string) {
    return path.resolve(__dirname, srcPath);
}

export default defineConfig({
    root: path.resolve(__dirname, '../..'),
    test: {
        watch: false,
        globals: true,
        environment: 'node',
        dir: __dirname,
        include: ['src/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/.nx/**'],
        reporters: ['default'],
        coverage: { reportsDirectory: '../../coverage/ag-grid-docs', provider: 'v8' },
    },
    resolve: {
        alias: {
            '@ag-website-shared': resolvePath('../../external/ag-website-shared/src'),

            // Matches `tsconfig.json`
            '@astro': resolvePath('src/astro'),
            '@components': resolvePath('src/components'),
            '@design-system': resolvePath('src/design-system'),
            '@images': resolvePath('src/images'),
            '@layouts': resolvePath('src/layouts'),
            '@stores': resolvePath('src/stores'),
            '@ag-grid-types': resolvePath('src/types/ag-grid.d.ts'),
            '@utils': resolvePath('src/utils'),
            '@constants': resolvePath('src/constants.ts'),
            'ag-grid-community': resolvePath('../../packages/ag-grid-community/src/main.ts'),
            'ag-grid-enterprise': resolvePath('../../packages/ag-grid-enterprise/src/main.ts'),
            'ag-charts-enterprise': resolvePath('../ag-charts-enterprise/src/main.ts'),
            'ag-charts-community': resolvePath('../ag-charts-community/src/main.ts'),
        },
    },
});
