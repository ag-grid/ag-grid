import angular from '@analogjs/vite-plugin-angular';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';

// Resolve AG Grid packages to source for near-realtime HMR
const agGridRoot = path.resolve(__dirname, '../../..');

export default defineConfig({
    plugins: [
        angular({
            tsconfig: 'tsconfig.angular.json',
            disableTypeChecking: true,
            transformFilter: (_code: string, id: string) => {
                // Only let the Angular plugin transform files in the angular
                // directory or ag-grid-angular source - not React/Vue/Vanilla files
                return id.includes('/src/angular/') || id.includes('/ag-grid-angular/');
            },
        }),
        react(),
        vue(),
    ],
    resolve: {
        alias: {
            'ag-grid-community': path.join(agGridRoot, 'packages/ag-grid-community/src/main.ts'),
            'ag-grid-enterprise': path.join(agGridRoot, 'packages/ag-grid-enterprise/src/main.ts'),
            'ag-grid-angular': path.join(
                agGridRoot,
                'packages/ag-grid-angular/projects/ag-grid-angular/src/public-api.ts'
            ),
            'ag-grid-react': path.join(agGridRoot, 'packages/ag-grid-react/src/index.ts'),
            'ag-grid-vue3': path.join(agGridRoot, 'packages/ag-grid-vue3/src/main.ts'),
            '@': path.join(agGridRoot, 'packages/ag-grid-vue3/src'), // resolves @/ imports within ag-grid-vue3 source
        },
    },
    build: {
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
                angular: path.resolve(__dirname, 'src/angular/index.html'),
                react: path.resolve(__dirname, 'src/react/index.html'),
                vanilla: path.resolve(__dirname, 'src/vanilla/index.html'),
                vue: path.resolve(__dirname, 'src/vue/index.html'),
            },
        },
    },
});
