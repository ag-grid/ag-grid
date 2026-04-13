import { defineConfig } from 'vitest/config';

import { vitestProjects } from './vitest.workspace';

// Ensure consistent timezone for date-related tests
process.env.TZ = 'UTC';

export default defineConfig({
    test: {
        watch: false,
        pool: 'threads',
        projects: vitestProjects,
    },
});
