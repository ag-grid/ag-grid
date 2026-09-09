import path from 'node:path';
import { defineConfig } from 'vitest/config';

import packageJson from '../../package.json';

// The website package that hosts this subrepo, per container repository. `@utils`/`@constants` and
// friends resolve into it, so a shared module that imports a product alias is testable in whichever
// repo the tests are run from.
const WEBSITE_PATH_PREFIX = {
    'ag-grid': '../../documentation/ag-grid-docs',
    'ag-charts': '../../packages/ag-charts-website',
    'ag-studio': '../../packages/ag-studio-docs',
};

function resolvePath(srcPath) {
    const pathPrefix = WEBSITE_PATH_PREFIX[packageJson.name] ?? WEBSITE_PATH_PREFIX['ag-charts'];
    return path.resolve(__dirname, pathPrefix, srcPath);
}

export default defineConfig({
    root: __dirname,
    test: {
        globals: true,
        environment: 'node',
        pool: 'threads',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        reporters: ['default'],
        coverage: { reportsDirectory: '../../coverage/ag-website-shared', provider: 'v8' },
    },
    resolve: {
        alias: {
            '@ag-website-shared': `${__dirname}/src`,

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
        },
    },
});
