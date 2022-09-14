type SchedulerJob<Context, Result> = {
    ctx: Context;
    run(
        ctx: Context,
        rescheduleJob: (j: RescheduledJob<Context, Result>) => void,
        deadline: number
    ): Promise<Result> | Result | undefined;

    added: number;
    done: {
        count: number;
        resolve: (r: Result) => void;
        reject: (e: any) => void;
    };
};

export type UserSchedulerJob<Context, Result> = Pick<SchedulerJob<Context, Result>, 'run' | 'ctx'>;
type RescheduledJob<Context, Result> = Pick<SchedulerJob<Context, Result>, 'ctx'>;

class Scheduler {
    private queue: SchedulerJob<any, any>[] = [];
    private running = false;
    private period = 16.7;
    private executionRatio = 0.4;
    private timer = undefined;

    private start(): void {
        this.running = true;

        let cbInProgress = false;

        const cb = async () => {
            if (cbInProgress) {
                return;
            }

            try {
                cbInProgress = true;
                await this.run();
            } finally {
                cbInProgress = false;
                if (this.queue.length <= 0) {
                    clearInterval(this.timer);
                    this.running = false;
                }
            }
        };

        setInterval(cb, this.period);
    }

    // private stop(): void {
    //   this.queue = [];
    // }

    private async run(deadline = this.period * this.executionRatio) {
        const start = performance.now();

        while (performance.now() - start < deadline) {
            const job = this.queue.shift();

            if (!job) {
                break;
            }

            try {
                const scheduleJob = (chainedJob: RescheduledJob<any, any>) => {
                    job.done.count++;
                    this.queue.push({ ...chainedJob, run: job.run, added: performance.now(), done: job.done });
                };

                let result = job.run(job.ctx, scheduleJob, start + deadline);
                if (result instanceof Promise) {
                    result = await result;
                }

                job.done.count--;

                if (job.done.count === 0) {
                    job.done.resolve(result);
                }
            } catch (e) {
                if (job.done.count === 0) {
                    job.done.reject(e);
                } else {
                    console.error('AG Charts - chained scheduled job failed with error', e);
                }
            }
        }
    }

    scheduleJob<C, R>(job: UserSchedulerJob<C, R>): Promise<R> {
        if (!this.running) {
            this.start();
        }

        return new Promise((resolve, reject) => {
            this.queue.push({ ...job, added: performance.now(), done: { resolve, reject, count: 1 } });
        });
    }
}

export const SCHEDULER = new Scheduler();

export function batchedFilter<D>(input: D[], predicate: (d: D) => boolean, maxBatchSize = 1000): Promise<D[]> {
    return SCHEDULER.scheduleJob({
        ctx: { idx: 0, resultIdx: 0, result: new Array<D>(input.length) },
        run: ({ idx, resultIdx, result }, rescheduleJob, deadline) => {
            let batchSize = 0;

            while (deadline > performance.now() && batchSize < maxBatchSize && idx < input.length) {
                const d = input[idx];
                if (predicate(d)) {
                    result[resultIdx++] = d;
                }

                batchSize++;
                idx++;
            }

            if (idx < input.length) {
                rescheduleJob({ ctx: { idx, resultIdx, result } });
            }

            return result;
        },
    });
}

export function batchedMap<D, R>(input: D[], mapper: (d: D) => R, maxBatchSize = 1000): Promise<R[]> {
    return SCHEDULER.scheduleJob({
        ctx: { idx: 0, result: new Array<R>(input.length) },
        run: ({ idx, result }, rescheduleJob, deadline) => {
            let batchSize = 0;

            while (deadline > performance.now() && batchSize < maxBatchSize && idx < input.length) {
                result[idx] = mapper(input[idx]);
                batchSize++;
                idx++;
            }

            if (idx < input.length) {
                rescheduleJob({ ctx: { idx, result } });
            }

            return result;
        },
    });
}

export function batchedReduce<D, R>(input: D[], reducer: (d: D, r: R) => R, start: R, maxBatchSize = 1000): Promise<R> {
    return SCHEDULER.scheduleJob({
        ctx: { idx: 0, result: start },
        run: ({ idx, result }, rescheduleJob, deadline) => {
            let batchSize = 0;

            while (deadline > performance.now() && batchSize < maxBatchSize && idx < input.length) {
                result = reducer(input[idx], result);
                batchSize++;
                idx++;
            }

            if (idx < input.length) {
                rescheduleJob({ ctx: { idx, result } });
            }

            return result;
        },
    });
}

type MapProcessingStep<INPUT, OUTPUT> = { map: (d: INPUT, idx: number) => OUTPUT };
type FilterProcessingStep<INPUT> = { filter: (d: INPUT, idx: number) => boolean };
type ForEachProcessingStep<INPUT> = { forEach: (d: INPUT, idx: number) => void | Promise<void> };
type ProcessingStep<INPUT, OUTPUT> =
    | MapProcessingStep<INPUT, OUTPUT>
    | FilterProcessingStep<INPUT>
    | ForEachProcessingStep<INPUT>;

function isMap<I, O>(s: ProcessingStep<I, O>): s is MapProcessingStep<I, O> {
    return typeof (s as any)['map'] === 'function';
}

function isFilter<I, O>(s: ProcessingStep<I, O>): s is FilterProcessingStep<I> {
    return typeof (s as any)['filter'] === 'function';
}

function isForEach<I, O>(s: ProcessingStep<I, O>): s is ForEachProcessingStep<I> {
    return typeof (s as any)['forEach'] === 'function';
}

const FILTERED = Symbol();

/**
 * Allows chaining of a series of map/filter calls to perform data processing; execution of the
 * pipeline makes use of job scheduling and batching to try and avoid blocking the main thread.
 */
export class BatchedChain<D, R = D> {
    private chain: { step: ProcessingStep<any, any>; executions: number }[] = [];

    /** Add a map operation to the chain. */
    map<R1>(fn: (d: R, idx: number) => R1) {
        this.chain.push({ step: { map: fn }, executions: 0 });
        return this as unknown as BatchedChain<D, R1>;
    }

    /** Add a filter operation to the chain. */
    filter(fn: (d: R, idx: number) => boolean) {
        this.chain.push({ step: { filter: fn }, executions: 0 });
        return this;
    }

    forEach(fn: (d: R, idx: number) => Promise<void> | void) {
        this.chain.push({ step: { forEach: fn }, executions: 0 });
        return this;
    }

    /** Execute the chain in batches & asynchronously using the scheduler. */
    execute(input: D[], maxBatchSize = 100): Promise<R[]> {
        return SCHEDULER.scheduleJob({
            ctx: {
                idx: 0, // Current input index to process.
                resultIdx: 0, // Current output index - filter operations can offset this from idx.
                result: new Array<R>(input.length), // Pre-allocated output array.
            },
            run: async ({ idx, resultIdx, result }, rescheduleJob, deadline) => {
                let batchSize = 0;

                // Perform depth-first execution of the chain to minimise memory overhead (no need
                // to store intermediate results in new arrays).
                while (deadline > performance.now() && batchSize < maxBatchSize && idx < input.length) {
                    // Current value for input to the next step.
                    let chainValue: any = input[idx];

                    for (const nextChain of this.chain) {
                        const { step } = nextChain;
                        nextChain.executions++;

                        if (isMap(step)) {
                            chainValue = step.map(chainValue, idx);
                        } else if (isFilter(step)) {
                            if (!step.filter(chainValue, idx)) {
                                chainValue = FILTERED;
                                break;
                            }
                        } else if (isForEach(step)) {
                            const promise = step.forEach(chainValue, idx);
                            if (promise != null && promise instanceof Promise) {
                                await promise;
                            }
                        }
                    }

                    if (chainValue !== FILTERED) {
                        result[resultIdx++] = chainValue;
                    }

                    batchSize++;
                    idx++;
                }

                if (idx < input.length) {
                    // Input not fully consumed, reschedule this job to continue later.
                    rescheduleJob({ ctx: { idx, resultIdx, result } });
                } else {
                    // Trim result length to actual length of output.
                    result.length = resultIdx;
                }

                return result;
            },
        });
    }
}
