import { defineConfig } from 'vitest/config';

import { unitProjectTestConfig } from '../../testing/shared/vitest/shared';

export default defineConfig({
    test: unitProjectTestConfig({
        name: 'locale',
        junitFile: '../../reports/locale.xml',
        environment: 'node',
    }),
});
