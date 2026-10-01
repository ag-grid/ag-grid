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
 * SKIP_STUDIO=1, or a site outside the --env topology). A file must execute its `@min-rows` less its
 * site-skipped rows, and a declared category that executed no rows is an error unless every one of
 * its rows was such a site skip.
 */
export function coverageErrors({ declared, minRows, executed, siteSkipped }) {
    const errors = [];
    const count = (rows, file, category) =>
        rows.filter((row) => row.file === file && (category === undefined || row.category === category)).length;
    for (const [file, min] of Object.entries(minRows)) {
        // A skipped site lowers the minimum by its own rows only, so the rows of the sites that
        // did run are still held to it (a file such as generated-markdown.tsv mixes all three).
        const ran = count(executed, file);
        const skipped = count(siteSkipped, file);
        if (min && ran < min - skipped) {
            const less = skipped ? ` less ${skipped} site-skipped` : '';
            errors.push(`${file}: ${ran} rows executed, @min-rows ${min}${less}`);
        }
    }
    for (const { file, category, line } of declared) {
        if (!count(executed, file, category) && !count(siteSkipped, file, category)) {
            errors.push(`${file}:${line}: category ${category} executed no rows`);
        }
    }
    return errors;
}

/**
 * Every expectation file the harness must load. Coverage requirements (@min-rows, @category) live
 * inside the files they protect, so a deleted or renamed file would take its requirements with it;
 * this list is kept apart from them so that loss fails the run instead of shrinking it.
 */
export const EXPECTATION_FILES = [
    'curated.tsv',
    'edge.tsv',
    'generated-charts-archive.tsv',
    'generated-charts.tsv',
    'generated-grid-archive.tsv',
    'generated-grid.tsv',
    'generated-markdown.tsv',
    'generated-studio-archive.tsv',
    'generated-studio.tsv',
];

/** Errors for required expectation files that are missing, and for files in the directory that aren't on the list. */
export function expectationFileErrors(present) {
    const missing = EXPECTATION_FILES.filter((f) => !present.includes(f)).map(
        (f) => `${f}: required expectation file is missing`
    );
    const unknown = present
        .filter((f) => !EXPECTATION_FILES.includes(f))
        .map((f) => `${f}: not a known expectation file (add it to EXPECTATION_FILES, or remove it)`);
    return [...missing, ...unknown];
}
