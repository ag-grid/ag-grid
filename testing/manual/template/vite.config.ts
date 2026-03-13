import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';

const require = createRequire(import.meta.url);

const angularEnabled = !!process.env.ANGULAR;

const agGridRoot = path.resolve(__dirname, '../../..');

export default defineConfig(async () => {
    const plugins = [cssFileDefaultImport(), ...(angularEnabled ? [] : [serveAngularDisabledPage()]), react(), vue()];
    const aliases: Record<string, string> = {
        'ag-grid-community': path.join(agGridRoot, 'packages/ag-grid-community/src/main.ts'),
        'ag-grid-enterprise': path.join(agGridRoot, 'packages/ag-grid-enterprise/src/main.ts'),
        'ag-grid-react': path.join(agGridRoot, 'packages/ag-grid-react/src/index.ts'),
        'ag-grid-vue3': path.join(agGridRoot, 'packages/ag-grid-vue3/src/main.ts'),
        '@': path.join(agGridRoot, 'packages/ag-grid-vue3/src'), // resolves @/ imports within ag-grid-vue3 source
    };

    if (angularEnabled) {
        const angular = (await import('@analogjs/vite-plugin-angular')).default;
        plugins.unshift(
            ...angular({
                tsconfig: 'tsconfig.angular.json',
                disableTypeChecking: true,
                transformFilter: (_code: string, id: string) => {
                    // Only let the Angular plugin transform files in the angular
                    // directory or ag-grid-angular source - not React/Vue/JavaScript files
                    return id.includes('/src/angular/') || id.includes('/ag-grid-angular/');
                },
            })
        );
        aliases['ag-grid-angular'] = path.join(
            agGridRoot,
            'packages/ag-grid-angular/projects/ag-grid-angular/src/public-api.ts'
        );
    } else {
        console.log('\x1b[33m%s\x1b[0m', 'Angular disabled. Run with ANGULAR=1 yarn dev to enable.');
    }

    const postcssPlugins = require(path.join(agGridRoot, 'postcss-plugins.cjs'));

    return {
        plugins,
        css: { postcss: { plugins: postcssPlugins } },
        resolve: { alias: aliases },
        build: {
            target: 'esnext',
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, 'index.html'),
                    angular: path.resolve(
                        __dirname,
                        angularEnabled ? 'src/angular/index.html' : 'src/angular/disabled.html'
                    ),
                    react: path.resolve(__dirname, 'src/react/index.html'),
                    javascript: path.resolve(__dirname, 'src/javascript/index.html'),
                    vue: path.resolve(__dirname, 'src/vue/index.html'),
                },
            },
        },
    };
});

function serveAngularDisabledPage(): Plugin {
    return {
        name: 'serve-angular-disabled-page',
        transformIndexHtml(html, ctx) {
            if (ctx.filename.includes('/src/angular/')) {
                return fs.readFileSync(path.resolve(__dirname, 'src/angular/disabled.html'), 'utf-8');
            }
        },
    };
}

// AG Grid source uses `import css from './foo.css'` (default imports of CSS
// strings). Vite requires `?inline` after the CSS file to get this behaviour.
// This plugin appends ?inline to all imported CSS files.
function cssFileDefaultImport(): Plugin {
    const agGridSrc = path.join(agGridRoot, 'packages');
    return {
        name: 'ag-grid-css-inline',
        enforce: 'pre',
        async resolveId(source, importer) {
            if (source.endsWith('.css') && importer?.startsWith(agGridSrc)) {
                const resolved = await this.resolve(source, importer, { skipSelf: true });
                if (resolved) {
                    return resolved.id + '?inline';
                }
            }
        },
    };
}
