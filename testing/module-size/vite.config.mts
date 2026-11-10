import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        // Vite 5's default target (es2020 / safari14) would downlevel the grid's `#private` members to WeakMap
        // helpers, so sizes would no longer reflect what the packages ship.
        target: 'es2022',
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
