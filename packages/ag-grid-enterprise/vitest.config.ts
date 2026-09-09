import path from 'path';
import { defineConfig } from 'vitest/config';

import { packageSourceAliases, unitProjectTestConfig } from '../../testing/shared/vitest/shared';

export default defineConfig(async () => ({
    resolve: { alias: await packageSourceAliases(path.resolve(__dirname, '../..')) },
    test: unitProjectTestConfig({
        name: 'ag-grid-enterprise',
        junitFile: '../../reports/ag-grid-enterprise.xml',
        setupFiles: ['./vitest.setup.ts'],
    }),
}));
