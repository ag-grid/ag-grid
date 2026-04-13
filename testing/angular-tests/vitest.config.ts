import angular from '@analogjs/vite-plugin-angular';
import path from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const thisDir = path.dirname(new URL(import.meta.url).pathname);
const localNodeModules = path.resolve(thisDir, 'node_modules');

/**
 * Vite plugin that redirects @angular/* imports to the local node_modules,
 * ensuring we use Angular 21 from testing/angular-tests/ rather than the
 * root-hoisted Angular 19.
 */
function resolveLocalAngular(): Plugin {
    return {
        name: 'resolve-local-angular',
        enforce: 'pre',
        resolveId(source) {
            if (source.startsWith('@angular/')) {
                return this.resolve(source, path.join(localNodeModules, '_resolver.js'), {
                    skipSelf: true,
                });
            }
            return null;
        },
    };
}

export default defineConfig({
    plugins: [resolveLocalAngular(), angular({ tsconfig: path.resolve(thisDir, 'tsconfig.spec.json') })],
    resolve: {
        alias: {
            // Resolve ag-grid-angular from source (JIT compiled by the Angular plugin)
            'ag-grid-angular': path.resolve(
                thisDir,
                '../../packages/ag-grid-angular/projects/ag-grid-angular/src/public-api.ts'
            ),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: [path.resolve(thisDir, 'vitest.setup.ts')],
        reporters: ['default'],
        watch: false,
        pool: 'forks',
        root: path.resolve(thisDir, '../..'),
        dir: thisDir,
        include: ['src/**/*.spec.ts'],
        css: false,
    },
});
