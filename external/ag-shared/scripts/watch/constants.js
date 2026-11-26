module.exports = {
    QUIET_PERIOD_MS: 50,
    BATCH_LIMIT: 50,
    PROJECT_ECHO_LIMIT: 3,
    NX_ARGS: ['--output-style', 'static'],
    BUILD_QUEUE_EMPTY_FILE: 'node_modules/.cache/ag-build-queue.empty',
    WATCH_STATUS_FILE: 'node_modules/.cache/ag-watch-status.json',
    MAX_BUILD_HISTORY: 10,
    // How long a pre-empted background build may take to exit before the watch warns that it is waiting.
    PREEMPT_EXIT_TIMEOUT_MS: 3000,
};
