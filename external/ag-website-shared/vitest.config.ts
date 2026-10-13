import path from 'node:path';
import { defineConfig } from 'vitest/config';

import packageJson from '../../package.json';

// The website package that hosts this subrepo, keyed by the container's root package name.
// `@utils`/`@constants` and friends resolve into it, so a shared module that imports a product
// alias is testable in whichever repo the tests are run from.
const WEBSITE_PATH_PREFIX = {
    'ag-grid': '../../documentation/ag-grid-docs',
    'ag-charts': '../../packages/ag-charts-website',
    'ag-studio-workspace-root': '../../packages/ag-studio-docs',
};

const CONTAINER_REPO = packageJson.name;
if (!(CONTAINER_REPO in WEBSITE_PATH_PREFIX)) {
    throw new Error(`ag-website-shared: no website path mapped for container package "${CONTAINER_REPO}"`);
}

function resolvePath(srcPath) {
    return path.resolve(__dirname, WEBSITE_PATH_PREFIX[CONTAINER_REPO], srcPath);
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
