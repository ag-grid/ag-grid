module.exports = {
    QUIET_PERIOD_MS: 50,
    BATCH_LIMIT: 50,
    PROJECT_ECHO_LIMIT: 3,
    NX_ARGS: ['--output-style', 'compact'],
    BUILD_QUEUE_EMPTY_FILE: 'node_modules/.cache/ag-build-queue.empty',
    WATCH_STATUS_FILE: 'node_modules/.cache/ag-watch-status.json',
    MAX_BUILD_HISTORY: 10,
};
