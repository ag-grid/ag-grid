// Entry point for the repo's gate scripts: `node scripts/gate/main.mjs <gate> [args...]`.
//
// ./behave.sh, ./checks.sh, ./benches.sh and ./docs-e2e.sh are one-line shims onto this, so the run capture,
// the `--async`/`--wait`/`--kill` dispatch and the argument parsing are written once rather than once per
// gate. Each gate module contributes only what is its own: the command it runs, its flags, and its help.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { isCI, parseArgs } from './args.mjs';
import { RunLog, preventIdleSleep, spawnAwait } from './run-log.mjs';

// Vite 8 (which Vitest 4 nests) warns, once per config it loads, that these configs are not loadable by the
// `configLoader: 'native'` it plans to default to. Clearing it for real needs `.mts` + `import.meta.dirname`,
// which packages/*/tsconfig.spec.json cannot type-check under `module: commonjs`. Revisit when Vite flips.
process.env.VITE_CONFIG_NATIVE_IGNORE_WARNING = 'true';

const GATES = ['behave', 'bench', 'checks', 'docs-e2e'];

const mainPath = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(mainPath), '../..');
const bin = (name) => path.join(rootDir, 'node_modules/.bin', name);

process.exitCode = await main();

async function main() {
    const [gateName, ...argv] = process.argv.slice(2);
    if (!GATES.includes(gateName)) {
        console.error(`Unknown gate '${gateName ?? ''}' (expected one of: ${GATES.join(', ')})`);
        return 1;
    }
    const gate = (await import(`./gates/${gateName}.mjs`)).default;

    // A pass-through to another tool has to win before anything here reads argv.
    const passedThrough = await gate.preParse?.({ argv, rootDir, bin });
    if (passedThrough !== undefined) {
        return passedThrough;
    }

    // Ahead of parseArgs, whose `apply` callbacks can reject a missing operand: `--projects --help` would
    // otherwise exit 1 on the flag the caller was asking about.
    const wantsHelp = argv.includes('-h') || argv.includes('--help');
    const state = parseArgs(wantsHelp ? [] : argv, gate.flags ?? {});
    const { async: runAsync, statusId, killId, waitId, waitTimeout = 0, quiet, noLog, runId } = state.capture;

    // Some modes hand the terminal to the runner and never end on their own (watch, --ui, --debug), so there
    // is nothing to capture and nothing to wait for: the log would grow with every re-run and the status would
    // stay `running` forever. A gate returns the mode's name to refuse `--async` in those words, or just
    // `true` to let the generic "the run log is off" answer stand.
    const endless = gate.endless?.(state);
    const capture = noLog || isCI || endless ? 'off' : quiet || gate.capture === 'file' ? 'file' : 'stream';

    const runLog = new RunLog({
        name: gate.name,
        rootDir,
        id: runId,
        capture,
        // A gate that prints its own verdict would otherwise print the same lines twice.
        report: gate.report ?? Boolean(quiet),
        failRe: gate.failRe,
        summaryRe: gate.summaryRe,
    });
    const context = { rootDir, bin, runLog, state, argv };

    if (wantsHelp) {
        // The runner's own flag list first, this script's additions last, so the wrapper-specific part is what
        // is still on screen next to the prompt. Never captured: help is not a run.
        if (gate.helpCommand) {
            await spawnAwait(bin(gate.helpCommand[0]), gate.helpCommand.slice(1), { cwd: rootDir, stdio: 'inherit' });
            console.log();
        }
        console.log(gate.usage.trim());
        return 0;
    }

    // Before the detach below, not inside `plan`: a detached child's console is /dev/null, so a rejection
    // raised there is lost entirely and leaves a run recorded as started that never wrote a line.
    const rejection = gate.reject?.(state);
    if (rejection !== undefined) {
        console.error(`${gate.script}: ${rejection}`);
        return 2;
    }

    // Reports on or stops an existing run instead of starting one. Every gate needs the same three branches,
    // and duplicating them is how their spellings drifted apart.
    if (waitId) {
        return runLog.wait(waitId, waitTimeout);
    }
    if (statusId) {
        return runLog.status(statusId);
    }
    if (killId) {
        return runLog.kill(killId);
    }
    if (runAsync) {
        if (typeof endless === 'string') {
            console.error(`${gate.script}: --async cannot combine with ${endless}.`);
            return 2;
        }
        if (!runLog.enabled) {
            console.error('--async needs the run log, which is off (CI, --no-log, or an interactive mode)');
            return 1;
        }
        return runLog.detach({ script: gate.script, mainPath, argv });
    }

    // A plan is the command to run plus any of `exec`'s options (cwd, env, file, colour), or an exit code for
    // a gate that has decided the run must not happen at all.
    const plan = await gate.plan(context);
    if (plan.exitCode !== undefined) {
        return plan.exitCode;
    }
    runLog.start(`./${gate.script} ${argv.join(' ')}`);
    preventIdleSleep();
    // Setup the run must own rather than precede: inside `plan` its output misses the log the script promises,
    // and its failure would return past `finish`, leaving the status `running` for a run that is already over.
    const setup = await gate.beforeRun?.(context);
    if (setup) {
        return runLog.finish(setup);
    }
    const code = await runLog.exec(plan.command, plan.args, plan);
    return runLog.finish((await gate.afterRun?.(context, code)) ?? code);
}
