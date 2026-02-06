export interface ProgressState {
    completed: number;
    failed: number;
    total: number;
    inProgressTasks: string[];
    lastLoggedPercentage: number;
}

export interface ProgressTrackerOptions {
    isTTY: boolean;
    maxInProgressToShow: number;
}

export function shortenTaskName(taskName: string): string {
    // Extract meaningful parts from task name
    // Common patterns:
    // - ag-charts-website-<section>_<page>_<example>_main.ts:generate-example
    // - ag-documentation-<project>-<parts>:<target>

    // Try to extract last 2-3 meaningful segments before file extension or target
    const withoutTarget = taskName.split(':')[0]; // Remove :target suffix
    const parts = withoutTarget.split(/[-_]/); // Split on - or _

    // Take last 2-3 parts before file extension
    const meaningfulParts = parts.filter((p) => p !== 'main' && !p.match(/\.(ts|js)$/)).slice(-3);

    const shortened = meaningfulParts.join('_');

    // Truncate if still too long
    return shortened.length > 30 ? shortened.substring(0, 27) + '...' : shortened;
}

export function createProgressState(total: number): ProgressState {
    return {
        completed: 0,
        failed: 0,
        total,
        inProgressTasks: [],
        lastLoggedPercentage: 0,
    };
}

export function updateProgress(state: ProgressState, success: boolean, inProgressTasks: string[]): void {
    state.completed++;
    if (!success) {
        state.failed++;
    }
    state.inProgressTasks = inProgressTasks;
}

export function setInProgressTasks(state: ProgressState, inProgressTasks: string[]): void {
    state.inProgressTasks = inProgressTasks;
}

export function displayProgress(
    state: ProgressState,
    options: ProgressTrackerOptions,
    isFirstTask: boolean,
    lastTaskSuccess: boolean
): void {
    const percentage = Math.round((state.completed / state.total) * 100);
    const failedMsg = state.failed > 0 ? ` - ${state.failed} failed` : '';
    const queued = state.total - state.completed;
    const progressMsg = `Progress: ${state.completed}/${state.total} (${percentage}%)${failedMsg} | Queued: ${queued}`;

    const inProgressMsg =
        state.inProgressTasks.length > 0
            ? `In progress: [${state.inProgressTasks.map(shortenTaskName).slice(0, options.maxInProgressToShow).join(', ')}]`
            : '';

    if (options.isTTY) {
        // Clear previous lines (progress + in-progress)
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        if (!isFirstTask) {
            // Move up and clear the previous in-progress line
            process.stdout.moveCursor(0, -1);
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
        }

        // Write progress line
        process.stdout.write(progressMsg + '\n');

        // Write in-progress tasks line (truncate if needed)
        if (inProgressMsg) {
            const maxWidth = (process.stdout.columns || 80) - 10;
            const truncated =
                inProgressMsg.length > maxWidth ? inProgressMsg.substring(0, maxWidth - 3) + '...' : inProgressMsg;
            process.stdout.write(truncated);
        }
    } else {
        // Non-TTY: Log every 10% or on failure to avoid spam
        const shouldLog =
            percentage >= state.lastLoggedPercentage + 10 || !lastTaskSuccess || state.completed === state.total;

        if (shouldLog) {
            console.info(progressMsg);
            if (inProgressMsg) console.info(inProgressMsg);
            state.lastLoggedPercentage = percentage;
        }
    }
}

export function finishProgress(options: ProgressTrackerOptions): void {
    if (options.isTTY) {
        process.stdout.write('\n');
    }
}
