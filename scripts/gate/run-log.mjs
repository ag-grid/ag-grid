// Shared run capture for the repo's gate scripts. Every local run gets an id and streams its console output
// to tmp/_<name>-output/<id>/ as it happens, so a red run can be read back rather than re-run - a full suite
// costs minutes. CI skips all of this, having its own log and artefact collection.
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import { constants } from 'node:os';
import path from 'node:path';
import { stripVTControlCharacters } from 'node:util';

const ESC = String.fromCharCode(27);

export const stripAnsi = stripVTControlCharacters;

const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// `YYYY-MM-DD HH:MM:SS` in local time, which is what a person reading a status file wants: offset the clock so
// `toISOString` renders local rather than UTC.
const stamp = (date) => new Date(date - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 19).replace('T', ' ');

// How long `--async` waits (in 10ms steps) for the spawned child to appear in `ps`. Generous against a slow
// interpreter start, since the cost is only paid on a child that never starts at all.
const CLAIM_TRIES = 200;

// A pid is not an identity - the OS reuses them - so a run records which incarnation was its own. Empty for
// a pid that is gone, which is what makes a recorded pid verifiable at all.
function pidStart(pid) {
    try {
        const out = execFileSync('ps', ['-p', String(pid), '-o', 'lstart='], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        });
        return out.trim().replace(/\s+/g, ' ');
    } catch {
        return '';
    }
}

// Every descendant of `root`, from one `ps` snapshot: the runner plus its workers are its children, so
// walking the ppid tree stops `--kill` reaching any other instance.
function processTree(root) {
    let out;
    try {
        out = execFileSync('ps', ['-Ao', 'pid=,ppid='], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    } catch {
        return [root];
    }
    const children = new Map();
    for (const line of out.split('\n')) {
        const match = line.match(/^\s*(\d+)\s+(\d+)\s*$/);
        if (match) {
            const siblings = children.get(Number(match[2]));
            if (siblings) {
                siblings.push(Number(match[1]));
            } else {
                children.set(Number(match[2]), [Number(match[1])]);
            }
        }
    }
    // Breadth-first over the growing array, so a grandchild is reached without recursion.
    const found = [root];
    for (let i = 0; i < found.length; i++) {
        found.push(...(children.get(found[i]) ?? []));
    }
    return found;
}

// Bash reports a signalled child as 128+n, and callers (and CI) compare exit codes, so say the same thing.
const exitCodeOf = (code, signal) => code ?? 128 + (constants.signals[signal] ?? 0);

/**
 * Holds off idle sleep while this process lives, so a run costing minutes is not throttled part way through.
 * A `-w` sidecar rather than a `caffeinate <command>` wrapper, so it needs no cleanup and stays out of the
 * runner's process tree - leaving exit codes, Ctrl-C and `--kill` exactly as they would be without it.
 */
export function preventIdleSleep() {
    const child = spawn('caffeinate', ['-i', '-w', String(process.pid)], { detached: true, stdio: 'ignore' });
    child.on('error', () => {}); // absent anywhere but macOS, which is the normal case rather than a problem
    child.unref();
}

/**
 * Runs a command with all of its output going to one file and none to the console. One fd for both streams,
 * so they interleave by write order exactly as a shell's `>file 2>&1` does. `colour` is for a file that will
 * be printed to a console after all; a file that is only ever read back keeps the escapes out.
 */
async function execToFile(command, args, { file, colour = false, env = process.env, ...options }) {
    const fd = fs.openSync(file, 'a');
    try {
        return await spawnAwait(command, args, {
            ...options,
            env: colour ? env : { ...env, NO_COLOR: '1' },
            stdio: ['inherit', fd, fd],
        });
    } finally {
        fs.closeSync(fd);
    }
}

/**
 * Runs a command to completion, resolving to the exit code a shell would report for it. `onStdout` is handed the
 * stream as well as the chunk, so a slow consumer can pause it.
 */
export function spawnAwait(command, args, { onStdout, ...options } = {}) {
    return new Promise((resolve) => {
        const child = spawn(command, args, options);
        if (onStdout && child.stdout) {
            child.stdout.setEncoding('utf8');
            child.stdout.on('data', (chunk) => onStdout(chunk, child.stdout));
        }
        // 127 is what a shell reports for a command it could not run at all.
        child.on('error', (error) => {
            console.error(`cannot run ${command}: ${error.message}`);
            resolve(127);
        });
        child.on('close', (code, signal) => resolve(exitCodeOf(code, signal)));
    });
}

// What a status file says, in the words the console used before it became JSON.
function describeStatus(status) {
    switch (status.state) {
        case 'running':
            return `running ${status.pid}`;
        case 'exit':
            return `exit ${status.code} ${status.at} ${status.elapsed}s`;
        case 'killed':
            return `killed ${status.at}`;
        case 'died':
            return `died (pid ${status.pid} is gone or has been reused)`;
        default:
            return status.state;
    }
}

export class RunLog {
    /**
     * `capture` is 'stream' (the console keeps the runner's colours, the file gets them stripped), 'file'
     * (the console gets nothing, so the gate can report only what matters) or 'off'. `report` closes a run
     * that showed the console nothing with the part a human still needs.
     */
    constructor({ name, rootDir, id, capture = 'stream', report = false, failRe, summaryRe }) {
        this.name = name;
        this.rootDir = rootDir;
        this.capture = capture;
        this.report = report;
        this.failRe = failRe;
        this.summaryRe = summaryRe;
        this.root = path.join(rootDir, 'tmp', `_${name}-output`);
        // The id doubles as a sort key and as a hint of when the run happened; the pid keeps concurrent runs apart.
        this.id = id || `${stamp(new Date()).replace(/[-:]/g, '').replace(' ', '-')}-${process.pid}`;
        this.dir = path.join(this.root, this.id);
        this.file = path.join(this.dir, 'output.log');
        // Set by the parent for the child of `--async`, which owns its own process group; `--kill` needs it.
        this.detached = process.env.AG_GATE_DETACHED === '1';
        this.started = 0;
    }

    get enabled() {
        return this.capture !== 'off';
    }

    get resultJson() {
        return path.join(this.dir, 'result.json');
    }

    relative(target) {
        return path.relative(this.rootDir, target);
    }

    // Prints the id first, so it is on screen even if the run is killed. Written synchronously throughout:
    // `--async-status` from another terminal, and `--async`'s own child, can read this directory a
    // millisecond after this returns, and must not find it half-made.
    start(commandLine) {
        if (!this.enabled) {
            return;
        }
        fs.mkdirSync(this.dir, { recursive: true });
        // Replaced by rename, which is atomic: remove-then-symlink lets a second run starting at the same
        // moment create the link in the gap and the loser throw EEXIST before its runner ever starts.
        const pending = path.join(this.root, `.latest-${process.pid}`);
        fs.rmSync(pending, { force: true }); // private to this pid, so this cannot race - only a reused pid's leftover
        fs.symlinkSync(this.id, pending);
        fs.renameSync(pending, path.join(this.root, 'latest'));
        this.prune();
        fs.writeFileSync(path.join(this.dir, 'command'), `${commandLine}\n`);
        fs.writeFileSync(this.file, '');
        this.writeStatus({
            state: 'running',
            pid: process.pid,
            pidStart: pidStart(process.pid),
            detached: this.detached,
        });
        this.started = Date.now();
        console.log(
            `▶ ${this.name} log (full stdout+stderr, read it instead of re-running): ${this.relative(this.file)}`
        );
    }

    // Drops runs over a week old, without waiting for it: the cleanup must never sit between the caller and
    // the run starting. `isDirectory` leaves the `latest` symlink alone.
    prune() {
        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
        fs.promises
            .readdir(this.root, { withFileTypes: true })
            .then((entries) =>
                Promise.all(
                    entries
                        .filter((entry) => entry.isDirectory())
                        .map(async (entry) => {
                            const dir = path.join(this.root, entry.name);
                            if ((await fs.promises.stat(dir)).mtimeMs < cutoff) {
                                await fs.promises.rm(dir, { recursive: true, force: true });
                            }
                        })
                )
            )
            .catch(() => {});
    }

    writeStatus(status, dir = this.dir) {
        try {
            // Rename, as `latest` above: a truncate-and-rewrite is read half-written by another terminal's
            // `--wait`, whose parse failure reads as terminal and reports a passing run failed.
            const pending = path.join(dir, `.status-${process.pid}`);
            fs.writeFileSync(pending, `${JSON.stringify(status)}\n`);
            fs.renameSync(pending, path.join(dir, 'status'));
        } catch {
            // A run whose status cannot be recorded still has its log, which is the part worth keeping.
        }
    }

    // Reclassifies `running` when that pid is gone or has been reused by something else - otherwise a stale
    // file makes `--wait` (whose default timeout is "forever") never return.
    readStatus(dir) {
        let status;
        try {
            status = JSON.parse(fs.readFileSync(path.join(dir, 'status'), 'utf8'));
        } catch {
            return { state: 'unknown' };
        }
        if (status.state === 'running' && status.pidStart !== pidStart(status.pid)) {
            return { ...status, state: 'died' };
        }
        return status;
    }

    // A line the gate itself produces rather than the command it wraps. Goes to the log as well as the
    // console, so a captured or detached run - whose stdout is a file or /dev/null - keeps it too.
    echo(message, stream = console.log) {
        if (!this.report) {
            stream(message);
        }
        this.append(message);
    }

    // Log only: a verdict the gate has already printed itself, which a later reader would not otherwise see.
    append(message) {
        if (this.enabled) {
            fs.appendFileSync(this.file, `${message}\n`);
        }
    }

    lines(file) {
        let text;
        try {
            text = fs.readFileSync(file, 'utf8');
        } catch {
            return [];
        }
        // A streamed log was stripped as it was written, so stripping it again would scan tens of MB to match
        // nothing; a captured one still carries the odd escape (Nx emits a few even under NO_COLOR).
        return (text.includes(ESC) ? stripAnsi(text) : text).split('\n');
    }

    // The two things worth repeating out of a log: what the runner concluded, and every line it failed on.
    // One pass: on a wholesale failure this file is the biggest thing the gate touches.
    digest(file = this.file) {
        const summary = [];
        const failures = [];
        for (const line of this.lines(file)) {
            if (this.summaryRe?.test(line)) {
                summary.push(line);
            }
            if (this.failRe?.test(line)) {
                failures.push(line);
            }
        }
        return { summary, failures };
    }

    /**
     * Runs the command, capturing it as `capture` asks. Resolves to the exit code a shell would report.
     * `file` sends the output to a file of the gate's choosing rather than the run log's - which is how a
     * gate whose output is never watched live keeps a log to read back even when capture is off.
     */
    async exec(command, args, { cwd = this.rootDir, env = process.env, file, colour } = {}) {
        const target = file ?? (this.capture === 'file' ? this.file : undefined);
        if (target) {
            return execToFile(command, args, { cwd, env, file: target, colour });
        }
        if (!this.enabled) {
            return spawnAwait(command, args, { cwd, env, stdio: 'inherit' });
        }
        // The log is always stripped - even a run with colour off carries the odd hardcoded escape (Vite's
        // CJS warning). A pipe is not a terminal and runners drop colour when they see one, so when the
        // console IS a terminal, ask for colour back explicitly: a person watching must not lose it.
        const wantsColour = !env.NO_COLOR && process.stdout.isTTY;
        return this.#stripTee(command, args, { cwd, env: wantsColour ? { FORCE_COLOR: '1', ...env } : env });
    }

    /**
     * Console keeps the runner's colours, the log gets them stripped - which a plain `tee` cannot do, both
     * its branches being the same bytes. stderr is merged by the shell rather than piped separately, so the
     * log's interleaving is the runner's write order and not the event loop's.
     */
    async #stripTee(command, args, options) {
        const log = fs.createWriteStream(this.file, { flags: 'a' });
        // The json reporter announces itself with a bare absolute path; print the run-relative one instead.
        const jsonReport = new RegExp(`^JSON report written to ${escapeRe(this.rootDir)}/(\\S+)\\s*$`);
        let pending = '';
        // Whole lines only, so a line can be rewritten and stripped before either copy sees it; a trailing
        // partial waits for its newline, and is flushed as it stands when the stream ends.
        const write = (text, source) => {
            pending += text;
            const end = source ? pending.lastIndexOf('\n') + 1 : pending.length;
            if (!end) {
                return;
            }
            const lines = pending.slice(0, end).split('\n');
            pending = pending.slice(end);
            const terminated = lines.at(-1) === '';
            if (terminated) {
                lines.pop();
            }
            const shown = lines.map((line) => line.replace(jsonReport, `▶ ${this.name} json report: $1`)).join('\n');
            const suffix = terminated ? '\n' : '';
            process.stdout.write(shown + suffix);
            // Stop reading while the log is behind, so a wholesale failure's diffs cannot queue in memory: the
            // runner blocks on its own stdout, which is the backpressure a shell pipeline would have given.
            if (!log.write(stripAnsi(shown) + suffix) && source) {
                source.pause();
                log.once('drain', () => source.resume());
            }
        };
        const code = await spawnAwait('sh', ['-c', 'exec "$@" 2>&1', 'sh', command, ...args], {
            ...options,
            stdio: ['inherit', 'pipe', 'inherit'],
            onStdout: write,
        });
        // No `source`: the stream is done, so whatever is left is a line that will never get its newline.
        write('');
        await new Promise((resolve) => log.end(resolve));
        return code;
    }

    // Records the outcome next to the log so `--wait` (and a later reader) can tell a finished run from a
    // killed one, and closes a captured run with the part a human still needs.
    finish(code) {
        if (!this.enabled) {
            return code;
        }
        const elapsed = Math.round((Date.now() - this.started) / 1000);
        this.writeStatus({ state: 'exit', code, at: stamp(new Date()), elapsed });
        const tty = process.env.AG_GATE_TTY;
        if (!this.report && !tty) {
            return code;
        }
        const { summary, failures } = this.digest();
        if (this.report) {
            for (const line of [...summary, ...failures]) {
                console.log(line);
            }
            console.log(`▶ ${this.name} exit ${code} after ${elapsed}s → ${this.relative(this.file)}`);
        }
        // A detached run's own output went to /dev/null, so it reports back to the terminal it was launched
        // from - the shell there has long since returned to a prompt. Skipped when there was no terminal (an
        // agent, a cron, a pipe), and best-effort: the terminal may have closed in the meantime.
        if (tty) {
            const verdict = code === 0 ? 'passed' : `FAILED (exit ${code})`;
            try {
                fs.appendFileSync(
                    tty,
                    [
                        '',
                        `▶ ${this.name} ${this.id} finished: ${verdict} after ${elapsed}s`,
                        ...summary,
                        ...failures,
                        `▶ ${this.relative(this.file)}`,
                        '',
                    ].join('\n')
                );
            } catch {
                // The terminal has closed; the log holds everything this was repeating.
            }
        }
        return code;
    }

    /**
     * Detaches the run: the child does the work and owns the log, the parent only reports where to look. The
     * child is handed the id its parent already printed, so both halves name the same directory, and the
     * parent overwrites the status with the CHILD's pid before returning, since its own is about to be gone.
     */
    async detach({ script, mainPath, argv }) {
        this.start(`${script} ${argv.join(' ')}`);
        const relaunch = argv.filter((arg) => arg !== '--async');
        const child = spawn(process.execPath, [mainPath, this.name, ...relaunch, '--run-id', this.id], {
            cwd: this.rootDir,
            detached: true,
            stdio: 'ignore',
            env: {
                ...process.env,
                AG_GATE_DETACHED: '1',
                // The child's stdout is discarded, so pass it the terminal to report back to when it finishes.
                AG_GATE_TTY: process.stdout.isTTY ? ttyPath() : '',
            },
        });
        child.unref();
        let started = '';
        for (let tries = 0; tries < CLAIM_TRIES && !started; tries++) {
            started = pidStart(child.pid);
            if (!started) {
                await sleep(10);
            }
        }
        // Never appearing in `ps` means the child is already gone, and recording that is right: it is a dead
        // pid, which is exactly what a reader should report. Only this process's own claim is replaced: the
        // child records its own pid as it starts and its exit code when it ends, and a short or cached run
        // gets there first - overwriting that would report a finished run as `died`.
        if (this.readStatus(this.dir).pid === process.pid) {
            this.writeStatus(
                started
                    ? { state: 'running', pid: child.pid, pidStart: started, detached: true }
                    : { state: 'died', pid: child.pid }
            );
        }
        console.log(`${this.name} running in the background; check it with ./${script} --wait ${this.id}`);
        return 0;
    }

    // The newest run still going, or undefined. Ids are timestamped, so the greatest id is the newest -
    // compared explicitly, because `readdir` order is the filesystem's, not chronological, and with two
    // runs going the wrong one would be waited on or killed. `isDirectory` leaves the `latest` symlink out.
    #runningId() {
        let found;
        let entries = [];
        try {
            entries = fs.readdirSync(this.root, { withFileTypes: true });
        } catch {
            return undefined;
        }
        for (const entry of entries) {
            const name = entry.name;
            if (
                entry.isDirectory() &&
                (found === undefined || name > found) &&
                this.readStatus(path.join(this.root, name)).state === 'running'
            ) {
                found = name;
            }
        }
        return found;
    }

    // Accepts a bare id, `auto`, `latest`, or any path containing one - the header line prints a path, so
    // that is what a caller usually has to hand (`tmp/_behave-output/<id>/output.log`, or the absolute form).
    //
    // `auto` is what a caller who named no id gets, and it means the run still going - however it was
    // started, `--async` or a plain background call. `latest` is the newest run *started*, so a short run
    // finishing after a long one began would hand back the wrong one and report it passed. Falls back to
    // `latest` when nothing is running, which is then the only run left to mean.
    resolveId(raw) {
        if (raw === 'auto') {
            return this.#runningId() ?? 'latest';
        }
        if (fs.existsSync(path.join(this.root, raw))) {
            return raw;
        }
        const fromPath = raw.match(new RegExp(`/_${escapeRe(this.name)}-output/([^/]+)`));
        return fromPath?.[1] ?? raw.match(/\d{8}-\d{6}-\d+/)?.[0] ?? raw;
    }

    // Resolves an id to its directory, or reports that there is no such run.
    #locate(rawId) {
        const id = this.resolveId(rawId);
        const dir = path.join(this.root, id);
        if (!fs.existsSync(dir)) {
            console.error(`No ${this.name} run '${id}' under ${this.relative(this.root)}`);
            return {};
        }
        return { id, dir };
    }

    // What a finished run amounts to: where to read it, its own summary lines, and any failures.
    #reportRun(id, dir, status) {
        const rel = this.relative(dir);
        console.log(`▶ ${this.name} ${id}: ${describeStatus(status)}`);
        console.log(`▶ ${this.name} log (full stdout+stderr): ${rel}/output.log`);
        if (fs.existsSync(path.join(dir, 'result.json'))) {
            console.log(`▶ ${this.name} json report: ${rel}/result.json`);
        }
        const { summary, failures } = this.digest(path.join(dir, 'output.log'));
        for (const line of [...summary, ...failures]) {
            console.log(line);
        }
        return status.state === 'exit' && status.code === 0 ? 0 : 1;
    }

    /** The status of a run right now, with no waiting: 0 passed, 1 failed, 3 still running. */
    status(rawId) {
        const { id, dir } = this.#locate(rawId);
        if (!id) {
            return 1;
        }
        const status = this.readStatus(dir);
        if (status.state === 'running') {
            console.log(`▶ ${this.name} ${id} still running (pid ${status.pid})`);
            return 3;
        }
        return this.#reportRun(id, dir, status);
    }

    /**
     * Waits for another run to finish. Returns 3 while it is still going, so a caller can tell "not done
     * yet" from "finished and failed" - blocking the terminal on a suite is what this exists to avoid.
     */
    async wait(rawId, timeout = 0) {
        const { id, dir } = this.#locate(rawId);
        if (!id) {
            return 1;
        }
        for (let waited = 0; ; ) {
            // Anything but `running` is terminal, and a run that died without recording it reads as terminal too.
            const status = this.readStatus(dir);
            if (status.state !== 'running') {
                return this.#reportRun(id, dir, status);
            }
            if (timeout > 0 && waited >= timeout) {
                console.log(`▶ ${this.name} ${id} still running after ${waited}s (${describeStatus(status)})`);
                return 3;
            }
            // Never sleep past the deadline: a caller's timeout is what it is willing to block for, so a
            // fixed interval would make `--wait <id> 1` cost two seconds.
            const step = timeout > 0 ? Math.min(2, timeout - waited) : 2;
            await sleep(step * 1000);
            waited += step;
        }
    }

    /** Kills a run and only that run, leaving any other instance of the same gate alone. */
    async kill(rawId) {
        const { id, dir } = this.#locate(rawId);
        if (!id) {
            return 1;
        }
        // The reader has already rejected a pid the OS has reused, so a stale file cannot kill a stranger.
        const status = this.readStatus(dir);
        if (status.state !== 'running') {
            if (status.state === 'died') {
                this.writeStatus(status, dir);
            }
            console.log(`▶ ${this.name} ${id} is not running (${describeStatus(status)})`);
            return 1;
        }
        const pids = processTree(status.pid);
        // A detached run leads its own process group, so the group IS "the run and everything it spawned",
        // including anything that has since reparented. A foreground run shares the caller's group, where
        // only the descendants may be signalled - group-killing there would take the caller's shell with it.
        const targets = status.detached ? [-status.pid, ...pids] : pids;
        for (const signal of ['SIGTERM', 'SIGKILL']) {
            for (const target of targets) {
                try {
                    process.kill(target, signal);
                } catch {
                    // Already gone, which is the outcome being asked for.
                }
            }
            if (signal === 'SIGTERM') {
                await sleep(1000);
            }
        }
        this.writeStatus({ state: 'killed', at: stamp(new Date()) }, dir);
        console.log(`▶ ${this.name} ${id} killed (${pids.length} processes)`);
        return 0;
    }
}

// The terminal a detached run should report back to, for the `--async` handover.
function ttyPath() {
    try {
        return execFileSync('tty', { encoding: 'utf8', stdio: ['inherit', 'pipe', 'ignore'] }).trim();
    } catch {
        return '';
    }
}
