import { defineConfig } from 'vitest/config';

import { dropCssParseErrors, vitestReporters } from './vitest.shared';

// Vitest adds one `unhandledRejection` listener to `process` per project pool; the workspace run has
// enough projects to trip Node's default 10-listener cap and print a spurious MaxListenersExceededWarning.
// Lift the cap on `process` only — leak detection on every other emitter (incl. grid code) is untouched.
process.setMaxListeners(0);

// Root config for the merged workspace run (vitest.workspace.ts). In workspace mode Vitest reads
// runner-global options — reporters/outputFile, onConsoleLog, coverage, watch — from HERE, not from the
// per-project configs, so anything global must live in this file to take effect during `./behave.sh`.
export default defineConfig({
    // Don't wipe the terminal scrollback when the run starts.
    clearScreen: false,
    test: {
        watch: false,
        // Workspace-wide default: threads is faster than Vitest's default `forks` for this jsdom workload.
        // Projects may override (behavioural switches to forks only for benchmark runs via benches.sh).
        pool: 'threads',
        // Per-project `reporters` are ignored in workspace mode, so this governs the whole run.
        reporters: vitestReporters(),
        outputFile: {
            junit: 'reports/workspace.xml',
        },
        onConsoleLog: dropCssParseErrors,
    },
});
