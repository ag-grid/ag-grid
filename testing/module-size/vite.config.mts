import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const tsconfigBase = JSON.parse(readFileSync(new URL('../../tsconfig.base.json', import.meta.url), 'utf8'));

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        target: tsconfigBase.compilerOptions.target.toLowerCase(),
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ['react', 'react-dom'],
                    // agGridCommunity: ['ag-grid-community'],
                    // agGridEnterprise: ['ag-grid-enterprise'],
                    agGridCommunityEnterprise: [
                        'ag-grid-community',
                        'ag-grid-enterprise',
                        'ag-charts-enterprise',
                        'ag-charts-community',
                    ],
                    agGridReact: ['ag-grid-react'],
                },
            },
        },
    },
});
