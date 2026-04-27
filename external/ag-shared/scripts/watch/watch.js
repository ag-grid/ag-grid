/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Watch nx dev environments in a queue
 *
 * Use `nx` to watch projects, batch up the changes, and update `BUILD_QUEUE_EMPTY_FILE`
 * once the changes settle down. This ensures multiple updates triggered in parallel get
 * batched up into one update event. Watching `BUILD_QUEUE_EMPTY_FILE` in another process
 * can be used to trigger further updates eg, website refresh.
 *
 * Usage: node ./watch [charts|grid|studio]
 */
const { spawn, spawnSync } = require('child_process');
const fsp = require('node:fs/promises');
const fs = require('node:fs');
const path = require('path');
const {
    QUIET_PERIOD_MS,
    BATCH_LIMIT,
    PROJECT_ECHO_LIMIT,
    NX_ARGS,
    BUILD_QUEUE_EMPTY_FILE,
    WATCH_STATUS_FILE,
    MAX_BUILD_HISTORY,
} = require('./constants');
const chartsConfig = require('./chartsWatch.config');
const gridConfig = require('./gridWatch.config');
const studioConfig = require('./studioWatch.config');

const RED = '\x1b[;31m';
const GREEN = '\x1b[;32m';
const YELLOW = '\x1b[;33m';
const GRAY = '\x1b[90m';
const RESET = '\x1b[m';

// Status constants
const STATUS = {
    STARTING: 'STARTING',
    RUNNING: 'RUNNING',
    BUILDING: 'BUILDING',
    IDLE: 'IDLE',
    STOPPED: 'STOPPED',
};

// Status tracking state
let statusData = {
    status: STATUS.STARTING,
    pid: process.pid,
    timestamp: new Date().toISOString(),
    library: null,
    currentBuild: null,
    recentBuilds: [],
    targetHistory: {},
};

// Global config reference (set in main)
let globalConfig = null;

function info(msg, ...args) {
    console.log(`*** ${GRAY}${msg}${RESET}`, ...args);
}
function success(msg, ...args) {
    console.log(`*** ${GREEN}${msg}${RESET}`, ...args);
}
function warning(msg, ...args) {
    console.log(`*** ${YELLOW}${msg}${RESET}`, ...args);
}
function error(msg, ...args) {
    console.log(`*** ${RED}${msg}${RESET}`, ...args);
}

function formatTime(timeDifference) {
    if (timeDifference < 1000) {
        return `${timeDifference.toFixed(2)}ms`;
    } else if (timeDifference < 60000) {
        return `${(timeDifference / 1000).toFixed(2)}s`;
    } else {
        const minutes = Math.floor(timeDifference / 60000);
        const seconds = ((timeDifference % 60000) / 1000).toFixed(2);
        return `${minutes}min ${seconds}s`;
    }
}

async function writeStatusFile(status, details = {}) {
    statusData.status = status;
    statusData.timestamp = new Date().toISOString();

    if (details.currentBuild) {
        statusData.currentBuild = details.currentBuild;
    } else if (status !== STATUS.BUILDING) {
        statusData.currentBuild = null;
    }

    try {
        const dirPath = path.dirname(WATCH_STATUS_FILE);
        await fsp.mkdir(dirPath, { recursive: true });
        await fsp.writeFile(WATCH_STATUS_FILE, JSON.stringify(statusData, null, 2));
    } catch (err) {
        warning(`Failed to write status file: ${err.message}`);
    }
}

async function removeStatusFile() {
    try {
        await fsp.unlink(WATCH_STATUS_FILE);
    } catch (err) {
        if (err.code !== 'ENOENT') {
            warning(`Failed to remove status file: ${err.message}`);
        }
    }
}

function updateBuildHistory(target, config, projects, status, startTime, endTime, error = null) {
    const duration = endTime - startTime;
    const buildEntry = {
        target,
        config,
        projects: Array.from(projects),
        status,
        startTime: new Date(Date.now() - (performance.now() - startTime)).toISOString(),
        endTime: new Date(Date.now() - (performance.now() - endTime)).toISOString(),
        duration,
    };

    if (error) {
        buildEntry.error = error;
    }

    // Add to recent builds (keep only MAX_BUILD_HISTORY entries)
    statusData.recentBuilds.unshift(buildEntry);
    if (statusData.recentBuilds.length > MAX_BUILD_HISTORY) {
        statusData.recentBuilds = statusData.recentBuilds.slice(0, MAX_BUILD_HISTORY);
    }

    // Update target history
    if (!statusData.targetHistory[target]) {
        statusData.targetHistory[target] = {
            lastStatus: status,
            lastTimestamp: buildEntry.endTime,
            successCount: 0,
            failureCount: 0,
        };
    }

    const targetHistory = statusData.targetHistory[target];
    targetHistory.lastStatus = status;
    targetHistory.lastTimestamp = buildEntry.endTime;

    if (status === 'completed') {
        targetHistory.successCount++;
    } else if (status === 'failed') {
        targetHistory.failureCount++;
    }
}

function createTimeManager() {
    const startTimes = {};
    const completeTimeEntries = [];

    function getTimeString(label, time) {
        return `${label}: ${formatTime(time)}`;
    }

    return {
        start(label) {
            if (startTimes[label]) {
                warning(`Time '${label}' already started`);
                return;
            }
            startTimes[label] = performance.now();
        },
        stop(label) {
            const time = startTimes[label];
            if (time) {
                completeTimeEntries.push([label, performance.now() - time]);
                delete startTimes[label];
            } else {
                warning(`Time '${label}' not started`);
            }
        },
        hasStarted(label) {
            return Boolean(startTimes[label]);
        },
        clear() {
            Object.keys(startTimes).forEach((key) => delete startTimes[key]);
            completeTimeEntries.length = 0;
        },
        getCompleteTimeEntries() {
            return [...completeTimeEntries];
        },
        timeString(labelToFind) {
            const entry = completeTimeEntries.findLast(([label]) => label === labelToFind);

            if (!entry) {
                warning(`'${labelToFind}' not found`);
                return;
            }

            const [label, time] = entry;
            return getTimeString(label, time);
        },
        toString() {
            return completeTimeEntries
                .map(([label, time]) => {
                    return getTimeString(label, time);
                })
                .join('\n');
        },
    };
}

const spawnedChildren = new Set();
const timeManager = createTimeManager();

function spawnNxWatch(outputCb) {
    let exitResolve, exitReject;
    const exitPromise = new Promise((resolve, reject) => {
        exitResolve = resolve;
        exitReject = reject;
    });

    const nxWatch = spawn('nx', [...NX_ARGS, ...'watch --all -- echo ${NX_PROJECT_NAME}'.split(' ')], {
        env: process.env,
    });
    spawnedChildren.add(nxWatch);
    nxWatch.on('error', (e) => {
        console.error(e);
        exitReject(e);
    });
    nxWatch.on('exit', () => {
        spawnedChildren.delete(nxWatch);
        exitResolve();
    });
    nxWatch.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const project of lines) {
            if (project.trim().length === 0) continue;

            outputCb(project);
        }
    });

    return exitPromise;
}

function spawnNxRun(targets, config, projects) {
    let exitResolve, exitReject;
    const exitPromise = new Promise((resolve, reject) => {
        exitResolve = resolve;
        exitReject = reject;
    });

    let nxRunArgs;
    if (targets.length === 1 && projects.length === 1) {
        const configSuffix = config != null ? `:${config}` : '';
        nxRunArgs = [...NX_ARGS, 'run', `${projects[0]}:${targets[0]}${configSuffix}`];
    } else {
        nxRunArgs = [...NX_ARGS, 'run-many', '-t', ...targets];
        if (config != null) {
            nxRunArgs.push('-c', config);
        }
        nxRunArgs.push('-p', ...projects);
    }

    success(`Executing: nx ${nxRunArgs.join(' ')}`);
    const nxRun = spawn(`nx`, nxRunArgs, { stdio: 'inherit', env: process.env });
    spawnedChildren.add(nxRun);
    nxRun.on('error', (e) => {
        console.error(e);
        exitReject(e);
    });
    nxRun.on('exit', (code) => {
        spawnedChildren.delete(nxRun);
        if (code === 0) {
            exitResolve();
        } else {
            exitReject();
        }
    });

    return exitPromise;
}

let timeout;
function scheduleBuild(dueMs = QUIET_PERIOD_MS) {
    if (buildBuffer.length > 0) {
        if (!timeManager.hasStarted('Total build time')) {
            timeManager.start('Total build time');
        }

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => build(), dueMs);
    }
}

let gitDir;
function getGitDir() {
    if (!gitDir) {
        const result = spawnSync(`git rev-parse --git-dir`);
        if (result.status !== 0) {
            return '.git';
        }
        gitDir = result.stdout.toString().trim();
    }
    return gitDir;
}

function isNxDaemonDisabled() {
    const disabledPath = path.join('.nx', 'workspace-data', 'd', 'disabled');
    try {
        if (fs.existsSync(disabledPath)) {
            const content = fs.readFileSync(disabledPath, 'utf-8').trim();
            return content === 'true';
        }
    } catch {
        // If we can't read the file, assume daemon is not disabled
    }
    return false;
}

function isBuildBlocked() {
    return (
        fs.existsSync(path.join(getGitDir(), 'index.lock')) ||
        fs.existsSync(path.join(getGitDir(), 'rebase-merge')) ||
        fs.existsSync(path.join(getGitDir(), 'rebase-apply')) ||
        fs.existsSync(path.join(getGitDir(), 'MERGE_MSG'))
    );
}

let buildBuffer = [];
let firstEventTime = null;
function processWatchOutput({ project: rawProject, getProjectBuildTargets }) {
    if (rawProject === '') return;

    if (buildBuffer.length === 0) {
        firstEventTime = performance.now();
    }

    for (const [project, targets, config] of getProjectBuildTargets(rawProject)) {
        for (const target of targets) {
            buildBuffer.push([project, config, target]);
        }
    }

    scheduleBuild();
}

function countReloadTargets() {
    if (!globalConfig || !globalConfig.devServerReloadTargets) {
        return 0;
    }

    const reloadableTargets = new Set(globalConfig.devServerReloadTargets);

    let count = 0;
    for (const [, , target] of buildBuffer) {
        if (reloadableTargets.has(target)) {
            count++;
        }
    }

    return count;
}

let buildRunning = false;
async function build() {
    if (buildRunning) return;

    if (isNxDaemonDisabled()) {
        warning('Nx daemon is disabled, build paused; will retry in 10 seconds.');
        scheduleBuild(10_000);
        return;
    }

    if (isBuildBlocked()) {
        warning('Git operation in progress, build paused; will retry in 10 seconds.');
        scheduleBuild(10_000);
        return;
    }

    buildRunning = true;

    const beforeReloadableCount = countReloadTargets();
    const reloadableSet = globalConfig?.devServerReloadTargets ? new Set(globalConfig.devServerReloadTargets) : new Set();
    const [, config, firstTarget] = buildBuffer.at(0);
    const firstIsReloadable = reloadableSet.has(firstTarget);

    // Collect items for this batch. Reloadable batches match on (config, reloadable)
    // as before. Non-reloadable batches collect ALL remaining non-reloadable items
    // regardless of config, then run each config group in parallel — saving one Nx
    // spawn (~1s) per extra config group.
    const newBuildBuffer = [];
    const configGroups = new Map(); // config -> { projects: Set, targets: Set }
    for (const next of buildBuffer) {
        const nextIsReloadable = reloadableSet.has(next[2]);
        const configMatch = firstIsReloadable ? next[1] === config : true;
        if (configGroups.size < BATCH_LIMIT && configMatch && nextIsReloadable === firstIsReloadable) {
            const groupKey = next[1];
            if (!configGroups.has(groupKey)) {
                configGroups.set(groupKey, { projects: new Set(), targets: new Set() });
            }
            const group = configGroups.get(groupKey);
            group.projects.add(next[0]);
            group.targets.add(next[2]);
        } else {
            newBuildBuffer.push(next);
        }
    }
    buildBuffer = newBuildBuffer;
    const afterReloadableCount = countReloadTargets();

    // Build a combined message and targets list for logging/status
    const allProjects = new Set();
    const allTargets = new Set();
    for (const { projects, targets } of configGroups.values()) {
        for (const p of projects) allProjects.add(p);
        for (const t of targets) allTargets.add(t);
    }
    const targetsArr = [...allTargets];
    let targetMsg = [...allProjects].slice(0, PROJECT_ECHO_LIMIT).join(' ');
    if (allProjects.size > PROJECT_ECHO_LIMIT) {
        targetMsg += ` (+${allProjects.size - PROJECT_ECHO_LIMIT} targets)`;
    }

    // Update status to BUILDING
    await writeStatusFile(STATUS.BUILDING, {
        currentBuild: {
            targets: targetsArr,
            config: configGroups.size === 1 ? config : null,
            projects: Array.from(allProjects),
            queueLength: buildBuffer.length,
        },
    });

    const buildStartTime = performance.now();
    try {
        timeManager.start(`${targetMsg} build`);
        success(`Starting build for: ${targetMsg}`);

        // Run config groups in parallel (single group = same as before,
        // multiple groups = parallel nx spawns saving sequential overhead)
        const groupEntries = [...configGroups.entries()];
        if (groupEntries.length === 1) {
            const [groupConfig, { targets, projects }] = groupEntries[0];
            await spawnNxRun([...targets], groupConfig, [...projects]);
        } else {
            await Promise.all(
                groupEntries.map(([groupConfig, { targets, projects }]) =>
                    spawnNxRun([...targets], groupConfig, [...projects])
                )
            );
        }

        success(`Completed build for: ${targetMsg}`);
        success(`Build queue has ${buildBuffer.length} remaining.`);
        timeManager.stop(`${targetMsg} build`);
        info(timeManager.timeString(`${targetMsg} build`));

        // Update build history with success
        updateBuildHistory(targetsArr.join(','), config, allProjects, 'completed', buildStartTime, performance.now());

        if (beforeReloadableCount > 0 && afterReloadableCount === 0) {
            const elapsed = formatTime(performance.now() - firstEventTime);
            success(`Reloading dev server... (${elapsed} since first change)`);
            await touchBuildQueueEmptyFile();
        }

        if (buildBuffer.length === 0) {
            timeManager.stop('Total build time');
            info('Last build buffer times...');
            timeManager
                .toString()
                .split('\n')
                .forEach((str) => info(str));
            timeManager.clear();
            firstEventTime = null;

            // Update status to IDLE when queue is empty
            await writeStatusFile(STATUS.IDLE);
        }
    } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e ?? 'Unknown error');
        error(`Build failed for: ${targetMsg}: ${errorMsg}`);

        // Update build history with failure
        updateBuildHistory(targetsArr.join(','), config, allProjects, 'failed', buildStartTime, performance.now(), errorMsg);

        // Update status if queue is empty
        if (buildBuffer.length === 0) {
            await writeStatusFile(STATUS.IDLE);
        }
    } finally {
        buildRunning = false;
        scheduleBuild();
    }
}

async function touchBuildQueueEmptyFile() {
    try {
        const time = new Date();
        await fsp.utimes(BUILD_QUEUE_EMPTY_FILE, time, time);
    } catch (err) {
        if ('ENOENT' !== err.code) {
            throw err;
        }

        const dirPath = path.dirname(BUILD_QUEUE_EMPTY_FILE);
        await fsp.mkdir(dirPath, { recursive: true });
        const fh = await fsp.open(BUILD_QUEUE_EMPTY_FILE, 'a');
        await fh.close();
    }
}

const CONSECUTIVE_RESPAWN_THRESHOLD_MS = 500;
async function run(config) {
    const { ignoredProjects, getProjectBuildTargets } = config;

    for (const { file, projects } of config.externalBuildTriggers ?? []) {
        if (!fs.existsSync(file)) continue;

        info(`Watching [${file}] for changes, affecting [${projects.join(' ')}]`);
        fs.watch(file, () => {
            for (const project of projects) {
                processWatchOutput({ project, getProjectBuildTargets });
            }
        });
    }

    let lastRespawn;
    let consecutiveRespawns = 0;
    while (true) {
        // Check if Nx daemon has been disabled before starting watch
        if (isNxDaemonDisabled()) {
            error(`Nx daemon has been disabled!

The watch script requires the Nx daemon to be enabled.

Run these commands to reset the workspace:
  yarn nx reset
  yarn
`);
            await writeStatusFile(STATUS.STOPPED);
            process.exit(1);
        }

        lastRespawn = Date.now();
        success('Starting watch...');

        // Update status to RUNNING
        await writeStatusFile(STATUS.RUNNING);

        await spawnNxWatch((project) => {
            if (ignoredProjects.includes(project)) return;

            processWatchOutput({ project, getProjectBuildTargets });
        });

        if (Date.now() - lastRespawn < CONSECUTIVE_RESPAWN_THRESHOLD_MS) {
            consecutiveRespawns++;
        } else {
            consecutiveRespawns = 0;
        }

        if (consecutiveRespawns > 5) {
            respawnError();
            await writeStatusFile(STATUS.STOPPED);
            return;
        }

        await waitMs(1_000);
    }
}

function respawnError() {
    error(`Repeated respawn detected!

    The Nx Daemon maybe erroring, try restarting it to resolve with either:
    - \`yarn nx daemon --stop\`
    - \`yarn\`

    Or alternatively view its logs at:
    - .nx/cache/d/daemon.log
`);
}

function waitMs(timeMs) {
    let resolveWait;
    setTimeout(() => resolveWait(), timeMs);
    return new Promise((r) => (resolveWait = r));
}

process.on('beforeExit', async () => {
    for (const child of spawnedChildren) {
        child.kill();
    }
    spawnedChildren.clear();

    // Write STOPPED status and clean up
    await writeStatusFile(STATUS.STOPPED);
    await removeStatusFile();
});

// Handle other exit signals
['SIGINT', 'SIGTERM', 'SIGHUP'].forEach((signal) => {
    process.on(signal, async () => {
        // Write STOPPED status before exiting
        await writeStatusFile(STATUS.STOPPED);
        await removeStatusFile();
        process.exit(0);
    });
});

const LIBRARY_CONFIGS = {
    charts: chartsConfig,
    grid: gridConfig,
    studio: studioConfig,
};
const LIBRARY_KEYS = Object.keys(LIBRARY_CONFIGS);

const library = process.argv[2];
if (!LIBRARY_KEYS.includes(library)) {
    const msg = `Invalid library to watch. Options: ${LIBRARY_KEYS.join()}`;
    error(msg);
    throw new Error(msg);
}

// Set library in statusData
statusData.library = library;

// Check if Nx daemon is disabled before starting
if (isNxDaemonDisabled()) {
    error(`Nx daemon is disabled!

The watch script requires the Nx daemon to be enabled.

Run these commands to reset the workspace:
  yarn nx reset
  yarn
`);
    writeStatusFile(STATUS.STOPPED).then(() => process.exit(1));
} else {
    // Reuse the cached project graph in watch mode — the daemon keeps it up to date,
    // so bypassing the IPC round-trip saves ~20-40ms per Nx invocation.
    process.env.NX_FORCE_REUSE_CACHED_GRAPH = 'true';

    // Write initial STARTING status
    writeStatusFile(STATUS.STARTING).then(() => {
        const config = LIBRARY_CONFIGS[library];
        globalConfig = config; // Set global config reference
        run(config);
    });
}
