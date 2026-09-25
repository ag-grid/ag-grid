import path from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';

import packageJson from '../../package.json';

// The website package that hosts this subrepo, per container repository. `@utils`/`@constants` and
// friends resolve into it, so a shared module that imports a product alias is testable in whichever
// repo the tests are run from.
const WEBSITE_PATH_PREFIX = {
    'ag-grid': '../../documentation/ag-grid-docs',
    'ag-charts': '../../packages/ag-charts-website',
    'ag-studio': '../../packages/ag-studio-docs',
};

// An unrecognised container is treated as ag-charts, so the aliases below still resolve.
const CONTAINER_REPO = packageJson.name in WEBSITE_PATH_PREFIX ? packageJson.name : 'ag-charts';

// The subrepo syncs whole, so every container receives all three theme builders. A foreign host's
// tests assert against a product this repo may not install, or pins at its own version, so a
// release of one product could redden an unrelated repository's CI. Run only our own host.
const THEME_BUILDER_HOSTS = {
    'ag-grid': 'theme-builder-grid',
    'ag-charts': 'theme-builder-charts',
    'ag-studio': 'theme-builder-studio',
};

const foreignThemeBuilderHosts = Object.entries(THEME_BUILDER_HOSTS)
    .filter(([repo]) => repo !== CONTAINER_REPO)
    .map(([, dir]) => `src/components/${dir}/**`);

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
        exclude: [...configDefaults.exclude, ...foreignThemeBuilderHosts],
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
