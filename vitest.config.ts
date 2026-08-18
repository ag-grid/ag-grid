import { defineConfig } from 'vitest/config';

import { resultJsonFile, vitestReporters } from './testing/shared/vitest/shared';
import projects from './vitest.workspace';

// Vitest adds one `unhandledRejection` listener to `process` per project pool; a full run has
// enough projects to trip Node's default 10-listener cap and print a spurious MaxListenersExceededWarning.
// Lift the cap on `process` only — leak detection on every other emitter (incl. grid code) is untouched.
process.setMaxListeners(0);

// Root config for the merged multi-project run. Vitest reads runner-global options — reporters/outputFile,
// coverage, watch — from HERE, not from the per-project configs, so anything global must live in this file
// to take effect during `./behave.sh`. Project-scoped options (pool, environment, setupFiles) do NOT
// cascade from here, so each project config sets its own; `unitProjectTestConfig` keeps them consistent.
export default defineConfig({
    // Don't wipe the terminal scrollback when the run starts.
    clearScreen: false,
    test: {
        projects,
        watch: false,
        // Runner-global, and the only place it counts: vitest builds each worker's `sequence` wholly from
        // the root config, so the projects' own copy applies to a standalone `nx test <project>` run alone.
        sequence: { setupFiles: 'list' },
        reporters: vitestReporters(),
        outputFile: {
            junit: 'reports/workspace.xml',
            ...(resultJsonFile ? { json: resultJsonFile } : {}),
        },
    },
});
