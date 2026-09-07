/**
 * Aggregation of the CSP violations captured by the page-verification suite, shared between
 * the spec that records them and the Playwright reporter that writes the report consumed by
 * CI. Depends on nothing outside Node built-ins: the post-deploy workflow runs the suite from
 * a standalone Playwright install with none of the site's dependencies present.
 */

/** Test annotation carrying one `CspViolationRecord`, JSON-encoded. */
export const CSP_VIOLATION_ANNOTATION = 'csp-violation';
/** Test annotation carrying one `CspHashHint`, JSON-encoded. */
export const CSP_HASH_HINT_ANNOTATION = 'csp-hash-hint';

export type CspDisposition = 'enforce' | 'report';

/** A single `securitypolicyviolation` event, as forwarded out of the browser. */
export interface CspViolationRecord {
    directive: string;
    blockedUri: string;
    disposition: CspDisposition;
    sourceFile?: string;
    pageUrl: string;
}

/**
 * The hash the browser suggests for a blocked inline script or style. Only the console message
 * carries it - the violation event does not - so it is captured separately and joined back on.
 * A page can carry an enforced and a report-only policy at once, each rejecting the same inline
 * content, so the disposition is part of what identifies which violation a hash answers.
 */
export interface CspHashHint {
    hash: string;
    family: string;
    disposition: CspDisposition;
    pageUrl: string;
}

export interface AggregatedCspViolation {
    /** Stable identity used to tell an unchanged violation set from a changed one. */
    key: string;
    directive: string;
    blockedUri: string;
    disposition: CspDisposition;
    suggestedHashes: string[];
    sourceFiles: string[];
    pages: string[];
    tests: string[];
    /**
     * Set when the violation matches an `AcceptedCspViolation`: the reason the policy is left
     * as it is. The violation stays in the report so a change in what the script does is still
     * visible; CI just stops raising it as something to fix.
     */
    accepted?: string;
}

/**
 * A violation the policy knowingly produces and will not be changed to fix. Kept as a rule
 * rather than a filter so the decision travels with the report, and matched narrowly: a
 * blocked eval from a given third-party script is accepted; anything else that script is
 * blocked from doing is not, and nor is the same eval from a script this does not name.
 */
export interface AcceptedCspViolation {
    directive: string;
    blockedUri: string;
    /** Every source file of the aggregated violation must start with this. */
    sourceFilePrefix: string;
    /** Why the policy stays as it is. Surfaces in the report as `accepted`. */
    reason: string;
}

export interface CspViolationReport {
    baseUrl?: string;
    violations: AggregatedCspViolation[];
}

/** `script-src-elem` and `script-src` are one family: the console message names only the latter. */
export const cspDirectiveFamily = (directive: string): string => directive.split('-')[0];

const toPagePath = (url: string): string => {
    try {
        return new URL(url).pathname;
    } catch {
        return url;
    }
};

const sorted = (values: Iterable<string>): string[] => [...new Set(values)].sort();

/**
 * Chrome reports a blocked inline script as e.g. "... a hash ('sha256-abc=') ... is required to
 * enable inline execution", naming the directive it checked against. Messages for other
 * violations (a blocked origin, a blocked frame) carry no hash and yield nothing here.
 *
 * The directive is quoted two ways depending on the wording the browser picks ("...directive
 * 'script-src ...'" vs "...directive: \"script-src ...\""), so accept either.
 */
export function parseCspHashHint(consoleText: string, pageUrl: string): CspHashHint | undefined {
    const hash = /a hash \('((?:sha256|sha384|sha512)-[^']+)'\)/.exec(consoleText)?.[1];
    const directive = /directive:?\s*['"]([\w-]+)/.exec(consoleText)?.[1];
    if (!hash || !directive) {
        return undefined;
    }
    const disposition: CspDisposition = /report[ -]only/i.test(consoleText) ? 'report' : 'enforce';
    return { hash, family: cspDirectiveFamily(directive), disposition, pageUrl };
}

/**
 * A hash only ever answers a blocked inline script or style, and only the one the same page
 * reported under the same policy: an external origin blocked by the same directive is a
 * different fix, and a report-only policy's hash does not authorise anything.
 */
function hashesFor(record: CspViolationRecord, hints: CspHashHint[]): string[] {
    if (record.blockedUri !== 'inline') {
        return [];
    }
    const pagePath = toPagePath(record.pageUrl);
    return sorted(
        hints
            .filter(
                (hint) =>
                    hint.disposition === record.disposition &&
                    hint.family === cspDirectiveFamily(record.directive) &&
                    toPagePath(hint.pageUrl) === pagePath
            )
            .map((hint) => hint.hash)
    );
}

/**
 * A rule accepts an aggregated violation only when every source file matches. A group is keyed
 * without its source, so an unrelated script hitting the same directive and URI lands in the
 * same group; that must resurface the group rather than be waved through with the known one.
 * A violation with no source file at all cannot be attributed and so is never accepted.
 */
function acceptanceReason(
    violation: Pick<AggregatedCspViolation, 'directive' | 'blockedUri' | 'sourceFiles'>,
    accepted: AcceptedCspViolation[]
): string | undefined {
    if (violation.sourceFiles.length === 0) {
        return undefined;
    }
    return accepted.find(
        (rule) =>
            rule.directive === violation.directive &&
            rule.blockedUri === violation.blockedUri &&
            violation.sourceFiles.every((file) => file.startsWith(rule.sourceFilePrefix))
    )?.reason;
}

export function aggregateCspViolations(
    records: { record: CspViolationRecord; testTitle: string }[],
    hints: CspHashHint[],
    accepted: AcceptedCspViolation[] = []
): AggregatedCspViolation[] {
    const groups = new Map<string, { violation: AggregatedCspViolation; pagePaths: Set<string> }>();

    for (const { record, testTitle } of records) {
        // Grouping on the suggested hash keeps two different blocked inline scripts apart: they
        // share a directive and report the same `inline` blocked URI, so grouping without it
        // would merge them and make fixing one look like the pair being replaced by a new one.
        const suggestedHashes = hashesFor(record, hints);
        const groupKey = [record.disposition, record.directive, record.blockedUri, ...suggestedHashes].join('|');
        let group = groups.get(groupKey);
        if (!group) {
            group = {
                violation: {
                    key: groupKey,
                    directive: record.directive,
                    blockedUri: record.blockedUri,
                    disposition: record.disposition,
                    suggestedHashes,
                    sourceFiles: [],
                    pages: [],
                    tests: [],
                },
                pagePaths: new Set(),
            };
            groups.set(groupKey, group);
        }
        group.pagePaths.add(toPagePath(record.pageUrl));
        group.violation.tests.push(testTitle);
        if (record.sourceFile) {
            group.violation.sourceFiles.push(record.sourceFile);
        }
    }

    const violations = [...groups.values()].map(({ violation, pagePaths }) => {
        const aggregated: AggregatedCspViolation = {
            ...violation,
            sourceFiles: sorted(violation.sourceFiles),
            pages: sorted(pagePaths),
            tests: sorted(violation.tests),
        };
        const reason = acceptanceReason(aggregated, accepted);
        return reason === undefined ? aggregated : { ...aggregated, accepted: reason };
    });

    return violations.sort(
        (a, b) =>
            Number(a.disposition === 'report') - Number(b.disposition === 'report') ||
            a.directive.localeCompare(b.directive) ||
            a.blockedUri.localeCompare(b.blockedUri)
    );
}
