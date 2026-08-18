// Argument parsing shared by the gate scripts. Each gate declares the flags it consumes; everything else is
// forwarded verbatim to the runner it wraps.
//
// The run-capture flags at the bottom are identical across all four gates, and used to be parsed once per
// gate - six flags, four implementations, which is how their spellings drifted apart.

/** What follows a flag. Every flag accepts both `--flag value` and `--flag=value` spellings. */
export const NONE = 'none'; // nothing
export const INLINE = 'inline'; // an optional `=value`, or one of `spec.operands` as the next argument
export const VALUE = 'value'; // a required operand, any shape
export const NUMBER = 'number'; // a required whole number
export const ID = 'id'; // an optional run id, defaulting to `latest`

const wholeNumber = /^\d+$/;

/** Presence, not truthiness, matching how the vitest config reads it: `CI=` empty is CI to vitest, so the
 *  gate and the run it wraps must not disagree about which timeouts and reporters are in play. */
export const isCI = process.env.CI != null;

function fail(message) {
    console.error(message);
    process.exit(1);
}

/**
 * Splits argv into the flags a gate understands and the arguments it forwards. `flags` maps each accepted
 * spelling to `{ takes, apply, hint }`; `apply(state, value)` records it. Unknown arguments are forwarded.
 *
 * `state.capture` collects the run-capture flags, which the driver in main.mjs reads rather than the gate.
 */
export function parseArgs(argv, flags) {
    const state = { forward: [], capture: {} };
    for (let index = 0; index < argv.length; index++) {
        const arg = argv[index];
        const split = arg.indexOf('=');
        const name = split < 0 ? arg : arg.slice(0, split);
        const inline = split < 0 ? undefined : arg.slice(split + 1);
        const spec = flags[name] ?? captureFlags[name];
        if (!spec) {
            state.forward.push(arg);
            continue;
        }
        const next = argv[index + 1];
        switch (spec.takes) {
            case INLINE: {
                // `spec.operands` lists the words that may also follow with a space. Without it the space
                // spelling reaches the runner as a file filter, which for `--update-grid-rows dry` means a
                // full snapshot rewrite - the opposite of what was asked for.
                const operand = inline === undefined && spec.operands?.includes(next);
                spec.apply(state, operand ? next : inline);
                index += operand ? 1 : 0;
                break;
            }
            case VALUE:
            case NUMBER: {
                const value = inline ?? next;
                // An empty `=` counts as absent: `--projects=` would otherwise widen the gate to every project.
                const absent = !value || (inline === undefined && value.startsWith('-'));
                // A number says "missing or invalid" either way: to a caller who typed a word, the difference
                // between an absent value and an unusable one is not worth two messages.
                if (spec.takes === NUMBER) {
                    if (absent || !wholeNumber.test(value)) {
                        fail(`Missing or invalid value for ${name} (expected ${spec.hint})`);
                    }
                } else if (absent) {
                    fail(`Missing value for ${name}${spec.hint ? ` (${spec.hint})` : ''}`);
                }
                spec.apply(state, value);
                index += inline === undefined ? 1 : 0;
                break;
            }
            case ID: {
                // An operand that may be absent, consumed only when it is actually there: a value taken for a
                // missing one would eat the following flag instead. A bare number is the timeout rather than
                // an id, since `--wait 30` reads as "wait 30s for the newest run" and no id is all digits.
                const numeric = spec.timeout && wholeNumber.test(next ?? '');
                const present = inline === undefined && next && !next.startsWith('-') && !numeric;
                // `auto`, not `latest`: no id means "the run I mean", which is the one still going. See
                // `resolveId` - `latest` is only the newest run *started*. An empty `--wait=` means `auto`
                // too: kept as `''` it reads as absent downstream and starts a fresh multi-minute gate.
                spec.apply(state, inline || (present ? next : 'auto'));
                index += present ? 1 : 0;
                // `--wait <id> [secs]` alone takes a second operand, and only when it is a number - a bare
                // `--wait` reads its id as `auto`, so a number after it would otherwise reach the runner.
                if (spec.timeout && wholeNumber.test(argv[index + 1] ?? '')) {
                    state.capture.waitTimeout = Number(argv[++index]);
                }
                break;
            }
            default:
                // A value on a flag that takes none is a typo with consequences: `--async=true` would enable
                // async and then survive into the relaunched argv, detaching a child per generation.
                if (inline !== undefined) {
                    fail(`${name} takes no value (got '${arg}')`);
                }
                spec.apply(state);
        }
    }
    return state;
}

/**
 * The help for those flags, written here beside them: spelled out per gate, the four copies drifted into four
 * descriptions of the same behaviour. `runner` names what `--no-log` gives its colours back to.
 */
export function captureUsage({ runner, quiet = true, width = 30 }) {
    // One space minimum, so a flag wider than the column still separates from its text.
    const row = (flag, ...lines) => {
        const head = `  ${flag}`;
        const gap = ' '.repeat(Math.max(1, width - head.length));
        return [head + gap + lines[0], ...lines.slice(1).map((line) => ' '.repeat(width) + line)];
    };
    return [
        ...row(
            '--async',
            'Start detached and return at once; when it finishes it prints its result',
            'back to this terminal. An agent gets nothing from that, so an agent should',
            'background the call itself, or poll --async-status.'
        ),
        ...row(
            '--async-status [id]',
            'Has it finished? Reports without waiting: exit 0 passed, 1 failed, 3 still',
            'running. Takes an id or any path containing one, so the log path printed',
            'above can be pasted straight back.'
        ),
        ...row('--wait [id] [secs]', 'The same report, but waiting up to `secs` for the run to finish.'),
        ...row(
            '--kill [id]',
            'Stop a run and every process it spawned. Other runs are left alone.',
            '',
            'All three default to whichever run is still going - however it was',
            'started, --async or a plain background call - and fall back to the newest',
            'when nothing is. So `--wait` alone is "wait for the run", and since an id',
            'is never all digits, `--wait 300` is that with a 300s cap.'
        ),
        ...(quiet ? row('--quiet', 'Console gets the paths, the summary and the failures; the log gets all.') : []),
        ...row('--no-log', `No log file, and ${runner} keeps its colours.`),
    ].join('\n');
}

// The flags every gate shares, and the reason this module exists.
const captureFlags = {
    '--async': { takes: NONE, apply: (state) => (state.capture.async = true) },
    '--async-status': { takes: ID, apply: (state, id) => (state.capture.statusId = id) },
    '--kill': { takes: ID, apply: (state, id) => (state.capture.killId = id) },
    '--wait': { takes: ID, timeout: true, apply: (state, id) => (state.capture.waitId = id) },
    '--quiet': { takes: NONE, apply: (state) => (state.capture.quiet = true) },
    '--no-log': { takes: NONE, apply: (state) => (state.capture.noLog = true) },
    // Internal: the detached child of --async is handed the id its parent already printed.
    '--run-id': { takes: VALUE, apply: (state, id) => (state.capture.runId = id) },
};
