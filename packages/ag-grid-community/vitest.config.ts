import path from 'path';
import { defineConfig } from 'vitest/config';

import { packageSourceAliases, unitProjectTestConfig } from '../../testing/shared/vitest/shared';

export default defineConfig(async () => ({
    resolve: { alias: await packageSourceAliases(path.resolve(__dirname, '../..')) },
    test: unitProjectTestConfig({
        name: 'ag-grid-community',
        junitFile: '../../reports/ag-grid-community.xml',
    }),
}));
