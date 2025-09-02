import path from 'node:path';
import { defineConfig } from 'vitest/config';

function resolvePath(srcPath: string) {
    return path.resolve(__dirname, srcPath);
}

export default defineConfig({
    root: __dirname,
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/_examples/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
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
            'ag-charts-enterprise': resolvePath('../ag-charts-enterprise/src/main.ts'),
            'ag-charts-community': resolvePath('../ag-charts-community/src/main.ts'),
        },
    },
});
