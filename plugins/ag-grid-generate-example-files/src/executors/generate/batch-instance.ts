import type { ExecutorContext } from '@nx/devkit';
import type { BatchExecutorTaskResult } from 'ag-shared/plugin-utils';

import type { ExecutorOptions } from './executor';
import generateFiles from './executor';
import type { GridOptionsType } from './generator/types';

export type Message = {
    taskName: string;
    options: ExecutorOptions;
    gridOptionsTypes: Record<string, GridOptionsType>;
};

export default async function processor(msg: Message) {
    const { options, taskName, gridOptionsTypes } = msg;

    let result: BatchExecutorTaskResult;
    try {
        await generateFiles(options, {} as ExecutorContext, gridOptionsTypes);
        result = { task: taskName, result: { success: true, terminalOutput: '' } };
    } catch (e) {
        result = { task: taskName, result: { success: false, terminalOutput: `${e}` } };
    }

    return result;
}
