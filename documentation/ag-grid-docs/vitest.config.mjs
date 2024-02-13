import { getViteConfig } from 'astro/config';
import path from 'node:path';

function resolvePath(srcPath) {
    return path.resolve(__dirname, srcPath);
}

export default getViteConfig({
    root: __dirname,
    cacheDir: '../../node_modules/.vite/test',
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
    resolve: {
        alias: {
            // Matches `tsconfig.json`
            '@astro': resolvePath('src/astro'),
            '@components': resolvePath('src/components'),
            '@design-system': resolvePath('src/design-system'),
            '@features': resolvePath('src/features'),
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
