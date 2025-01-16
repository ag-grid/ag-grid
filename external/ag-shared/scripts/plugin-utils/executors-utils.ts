import type { ExecutorContext, TaskGraph } from '@nx/devkit';
import { readFileSync } from 'fs';
import * as fs from 'fs/promises';
import * as glob from 'glob';
import * as os from 'os';
import * as path from 'path';
import * as ts from 'typescript';

export type TaskResult = {
    success: boolean;
    terminalOutput: string;
    startTime?: number;
    endTime?: number;
};

export type BatchExecutorTaskResult = {
    task: string;
    result: TaskResult;
};

export async function exists(filePath: string) {
    try {
        return (await fs.stat(filePath))?.isFile();
    } catch {
        return false;
    }
}

export async function readJSONFile(filePath: string) {
    return (await exists(filePath)) ? JSON.parse(await fs.readFile(filePath, 'utf-8')) : null;
}

export async function readFile(filePath: string) {
    return (await exists(filePath)) ? await fs.readFile(filePath, 'utf-8') : null;
}

export async function writeJSONFile(filePath: string, data: unknown, indent = 2) {
    const dataContent = JSON.stringify(data, null, indent);
    await writeFile(filePath, dataContent);
}

export async function writeFile(filePath: string, newContent: string | Buffer) {
    const outputDir = path.dirname(filePath);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(filePath, newContent);
}

export async function deleteFile(filePath: string) {
    if (await exists(filePath)) {
        await fs.rm(filePath);
    }
}

export function parseFile(filePath: string) {
    const contents = readFileSync(filePath, 'utf8');
    return ts.createSourceFile('tempFile.ts', contents, ts.ScriptTarget.Latest, true);
}

export function inputGlob(fullPath: string) {
    return glob.sync(`${fullPath}/**/*.ts`, {
        ignore: [`${fullPath}/**/*.test.ts`, `${fullPath}/**/*.spec.ts`],
    });
}

export async function ensureDirectory(dirPath: string) {
    await fs.mkdir(dirPath, { recursive: true });
}

export function batchExecutor<ExecutorOptions>(
    executor: (opts: ExecutorOptions, ctx: ExecutorContext) => Promise<void>
) {
    return async function* (
        _taskGraph: TaskGraph,
        inputs: Record<string, ExecutorOptions>,
        overrides: ExecutorOptions,
        context: ExecutorContext
    ): AsyncGenerator<BatchExecutorTaskResult, any, unknown> {
        const tasks = Object.keys(inputs);

        for (let taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
            const task = tasks[taskIndex];
            const inputOptions = inputs[task];

            let success = false;
            let terminalOutput = '';
            try {
                await executor({ ...inputOptions, ...overrides }, context);
                success = true;
            } catch (e) {
                terminalOutput += `${e}`;
            }

            yield { task, result: { success, terminalOutput } };
        }
    };
}

export function batchWorkerExecutor<ExecutorOptions>(workerModule: string) {
    return async function* (
        taskGraph: TaskGraph,
        inputs: Record<string, ExecutorOptions>,
        overrides: ExecutorOptions,
        context: ExecutorContext
    ): AsyncGenerator<BatchExecutorTaskResult, any, unknown> {
        const results: Map<string, Promise<BatchExecutorTaskResult>> = new Map();

        let threadCount = os.cpus().length;
        if (process.env.CI == null) {
            threadCount /= 2;
        }
        const { Tinypool } = await import('tinypool');
        const pool = new Tinypool({
            runtime: 'child_process',
            filename: workerModule,
            maxThreads: threadCount,
        });
        process.on('exit', () => {
            pool.cancelPendingTasks();
            pool.destroy().catch((e) => console.error(e));
        });

        const tasks = Object.keys(inputs);

        console.info(`Batched execution of ${tasks.length} tasks, using ${pool.threads.length} threads...`);
        const start = performance.now();
        for (let taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
            const taskName = tasks[taskIndex];
            const task = taskGraph.tasks[taskName];
            const inputOptions = inputs[taskName];

            const opts = {
                options: { ...inputOptions, ...overrides },
                context: {
                    ...context,
                    projectName: task.target.project,
                    targetName: task.target.target,
                    configurationName: task.target.configuration,
                },
                taskName,
            };
            results.set(taskName, pool.run(opts));
        }

        // Run yield loop after dispatch to avoid serializing execution.
        for (let taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
            const taskName = tasks[taskIndex];
            yield results.get(taskName)!;
        }

        await Promise.allSettled(results.values());

        const duration = performance.now() - start;
        console.info(`Batched execution of ${tasks.length} jobs complete in ${Math.floor(duration / 100) / 10}s`);

        await pool.destroy();
    };
}

export async function consolePrefix(prefix: string, cb: () => Promise<void>) {
    const fns: any = {};
    const fnNames = ['log', 'debug', 'info', 'warn', 'error'] as const;
    const timesCalled: Record<(typeof fnNames)[number], number> = {
        debug: 0,
        error: 0,
        info: 0,
        log: 0,
        warn: 0,
    };
    for (const fn of fnNames) {
        fns[fn] = console[fn];

        console[fn] = (arg: any, ...args: any[]) => {
            // Filter license message.
            if (typeof arg === 'string' && arg.startsWith('*')) return;

            timesCalled[fn]++;
            fns[fn].call(console, prefix, arg, ...args);
        };
    }
    try {
        await cb();
        return timesCalled;
    } finally {
        Object.assign(console, fns);
    }
}
