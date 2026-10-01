// The rules that decide the harness's verdict, kept apart from its I/O so they can be tested on
// their own (report.test.mjs): how a row's failures are classified against its known-fail marker.

/**
 * A row's result: 'pass', 'fail', 'known' (failed only on the assertions its known-fail names) or
 * 'unexpected' (a named assertion passed, so the marker must be narrowed or dropped).
 *
 * `fails` are `{ key, message }`, keyed by the assertion that failed: `status`, `location`, an
 * assertion key such as `cc` or `h:ETag`, or `error` for a transport error. A failure the marker
 * does not name stays fatal, so a known-fail row cannot hide a new regression, and an error can
 * never be named.
 */
export function classifyRow(row, fails) {
    if (!row.knownFail) {
        return fails.length ? { kind: 'fail', fails } : { kind: 'pass' };
    }
    const named = row.knownFail.assertions;
    const unnamed = fails.filter((fail) => !named.includes(fail.key));
    if (unnamed.length) {
        return { kind: 'fail', fails: unnamed };
    }
    const passing = named.filter((key) => !fails.some((fail) => fail.key === key));
    if (passing.length) {
        return { kind: 'unexpected', passing };
    }
    return { kind: 'known', fails };
}
