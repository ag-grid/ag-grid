import type { ExecutorContext } from '@nx/devkit';
import { spawnSync } from 'child_process';
import * as glob from 'glob';
import * as os from 'os';
import * as path from 'path';

import { readGridOptionsType } from '../../../gridOptionsTypes/gridOptionsTypesFile';
import type { ExecutorOptions as GenerateOptions } from '../generate/executor';

export type ExecutorOptions = {
    mode: 'dev' | 'prod';
    /** Docs project whose examples are generated, e.g. `ag-grid-docs`. */
    parentProject: string;
    /** Base output directory; each example lands under `<outputBasePath>/<parentProject>/...`. */
    outputBasePath: string;
    writeFiles?: boolean;
};

/**
 * Generates every docs example in a single Nx task.
 *
 * Each example used to be its own Nx project with its own `generate-example` task, so a full
 * generation scheduled >1000 tasks. The per-task bookkeeping (hashing, cache lookups, and — with
 * the daemon — one socket round-trip each) cost substantially more than the generation itself.
 * The per-example targets still exist for the watch loop and for regenerating a single example by
 * hand; this executor is the bulk path used by `generate-examples`.
 *
 * Output paths must match what `ag-grid-task-autogen`'s `createNodes` computes for the per-example
 * tasks, so that both paths write to exactly the same place.
 */
export function exampleOutputPath({
    entryFilePath,
    parentProject,
    outputBasePath,
}: {
    entryFilePath: string;
    parentProject: string;
    outputBasePath: string;
}) {
    const exampleDir = path.dirname(entryFilePath);
    const srcRoot = `documentation/${parentProject}/src`;
    // `content/docs/<page>/_examples/<name>` -> `docs/<page>/_examples/<name>`
    const relativeToSrc = path.relative(srcRoot, exampleDir);
    const srcRelativeInputPath = relativeToSrc.split(path.sep).slice(1).join('/');

    return {
        exampleDir,
        outputPath: path.posix.join(outputBasePath, parentProject, srcRelativeInputPath),
    };
}

export function findExampleEntryFiles(parentProject: string) {
    return glob
        .sync(`documentation/${parentProject}/src/**/_examples/*/main.ts`)
        .map((p) => p.split(path.sep).join('/'))
        .sort();
}

/**
 * Escape hatch for the single-task collapse. With `DISABLE_EXAMPLE_GEN_COLLAPSE=true` the examples
 * are generated through the per-example Nx tasks instead, as they were before the collapse. Those
 * targets are still defined (the watch loop uses them), so this path stays exercised rather than
 * rotting. The env var is declared as an input on `generate-examples`, so flipping it invalidates
 * the cache rather than silently reusing output produced by the other strategy.
 */
const GENERATED_EXAMPLE_TAG = 'type:generated-example';

function generateViaPerExampleTasks(configurationName?: string) {
    const args = ['nx', 'run-many', '-t', 'generate-example', `--projects=tag:${GENERATED_EXAMPLE_TAG}`];
    if (configurationName) {
        args.push('-c', configurationName);
    }
    console.info(`DISABLE_EXAMPLE_GEN_COLLAPSE is set - generating via per-example tasks: npx ${args.join(' ')}`);
    const result = spawnSync('npx', args, { stdio: 'inherit', env: process.env });
    if (result.status !== 0) {
        return { success: false, terminalOutput: 'Per-example generation failed' };
    }
    // `run-many` exits 0 when the project filter matches nothing, so verify work actually happened
    // rather than silently reporting success on an empty run.
    const generated = glob.sync('dist/generated-examples/*/**/contents.json').length;
    if (generated === 0) {
        return {
            success: false,
            terminalOutput: `Per-example generation produced no output - did the '${GENERATED_EXAMPLE_TAG}' project filter match anything?`,
        };
    }
    return { success: true, terminalOutput: `Generated ${generated} example files via per-example tasks` };
}

export default async function (options: ExecutorOptions, ctx: ExecutorContext) {
    const { mode, parentProject, outputBasePath, writeFiles = false } = options;

    if (process.env.DISABLE_EXAMPLE_GEN_COLLAPSE === 'true') {
        return generateViaPerExampleTasks(ctx?.configurationName);
    }

    const entryFiles = findExampleEntryFiles(parentProject);
    if (entryFiles.length === 0) {
        return { success: false, terminalOutput: `No examples found for '${parentProject}'` };
    }

    const jobs: { taskName: string; options: GenerateOptions }[] = entryFiles.map((entryFilePath) => {
        const { exampleDir, outputPath } = exampleOutputPath({ entryFilePath, parentProject, outputBasePath });
        return {
            taskName: exampleDir,
            options: {
                mode,
                examplePath: exampleDir,
                outputPath,
                writeFiles,
                inputs: [],
                output: '',
            } as GenerateOptions,
        };
    });

    const threadCount = process.env.CI == null ? Math.round(os.cpus().length / 2) : Math.min(4, os.cpus().length);
    const gridOptionsTypes = readGridOptionsType();

    const { Tinypool } = await import('tinypool');
    const pool = new Tinypool({
        runtime: 'child_process',
        filename: path.join(__dirname, '../generate/batch-instance.js'),
        maxThreads: threadCount,
        env: process.env as Record<string, string>,
        maxMemoryLimitBeforeRecycle: Number(process.env.NX_WORKER_RECYCLE_HEAP_BYTES) || 1_024 * 1_024 * 1_024,
    });

    const destroy = () => {
        pool.cancelPendingTasks();
        pool.destroy().catch((e) => console.error(e));
    };
    process.on('exit', destroy);

    console.info(`Generating ${jobs.length} examples using ${threadCount} threads...`);
    const start = performance.now();

    const failures: string[] = [];
    let completed = 0;
    let nextMilestone = 10;
    const settle = (taskName: string, success: boolean, terminalOutput: string) => {
        completed++;
        if (!success) {
            failures.push(`${taskName}: ${terminalOutput}`);
        }
        const percent = Math.floor((completed / jobs.length) * 100);
        if (percent >= nextMilestone || completed === jobs.length) {
            console.info(`Progress: ${completed}/${jobs.length} (${percent}%)`);
            nextMilestone = percent - (percent % 10) + 10;
        }
    };

    const running = jobs.map(({ taskName, options: jobOptions }) =>
        pool
            .run({ taskName, options: jobOptions, context: {}, gridOptionsTypes })
            .then((r: any) => settle(taskName, r?.result?.success ?? false, r?.result?.terminalOutput ?? ''))
            .catch((e: unknown) => settle(taskName, false, `${e}`))
    );

    await Promise.allSettled(running);

    const duration = performance.now() - start;
    console.info(`Generated ${jobs.length} examples in ${Math.floor(duration / 100) / 10}s`);

    await pool.destroy();
    process.off('exit', destroy);

    if (failures.length > 0) {
        console.error(`${failures.length} example(s) failed to generate:`);
        for (const failure of failures.slice(0, 20)) {
            console.error(`  ${failure}`);
        }
        return { success: false, terminalOutput: `${failures.length} example(s) failed to generate` };
    }

    return { success: true, terminalOutput: `Generated ${jobs.length} examples` };
}
