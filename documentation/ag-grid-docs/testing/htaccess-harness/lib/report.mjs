// The rules that decide the harness's verdict, kept apart from its I/O so they can be tested on
// their own (report.test.mjs): how a row's failures are classified against its known-fail marker,
// and which coverage gaps fail the run.

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

/**
 * Coverage gaps that fail the run. `declared` lists every `# @category` a file declares (whether or
 * not any row follows it), `minRows` each file's `@min-rows`, `executed` the rows that ran, and
 * `siteSkipped` the rows deliberately not run because their site was switched off (SKIP_CHARTS=1,
 * SKIP_STUDIO=1, or a site outside the --env topology). A declared category that executed no rows is
 * an error unless every one of its rows was such a site skip.
 */
export function coverageErrors({ declared, minRows, executed, siteSkipped }) {
    const errors = [];
    const count = (rows, file, category) =>
        rows.filter((row) => row.file === file && (category === undefined || row.category === category)).length;
    for (const [file, min] of Object.entries(minRows)) {
        const ran = count(executed, file);
        if (min && ran < min && !count(siteSkipped, file)) {
            errors.push(`${file}: ${ran} rows executed, @min-rows ${min}`);
        }
    }
    for (const { file, category, line } of declared) {
        if (!count(executed, file, category) && !count(siteSkipped, file, category)) {
            errors.push(`${file}:${line}: category ${category} executed no rows`);
        }
    }
    return errors;
}
