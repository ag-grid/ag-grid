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
 */
export interface CspHashHint {
    hash: string;
    family: string;
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
    return { hash, family: cspDirectiveFamily(directive), pageUrl };
}

export function aggregateCspViolations(
    records: { record: CspViolationRecord; testTitle: string }[],
    hints: CspHashHint[]
): AggregatedCspViolation[] {
    const groups = new Map<string, { violation: AggregatedCspViolation; pagePaths: Set<string> }>();

    for (const { record, testTitle } of records) {
        const groupKey = `${record.disposition}|${record.directive}|${record.blockedUri}`;
        let group = groups.get(groupKey);
        if (!group) {
            group = {
                violation: {
                    key: groupKey,
                    directive: record.directive,
                    blockedUri: record.blockedUri,
                    disposition: record.disposition,
                    suggestedHashes: [],
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
        // A hash only ever answers a blocked inline script or style, and only on the page that
        // reported it - an external origin blocked by the same directive is a different fix.
        const hashes =
            violation.blockedUri === 'inline'
                ? hints
                      .filter(
                          (hint) =>
                              hint.family === cspDirectiveFamily(violation.directive) &&
                              pagePaths.has(toPagePath(hint.pageUrl))
                      )
                      .map((hint) => hint.hash)
                : [];
        const suggestedHashes = sorted(hashes);
        return {
            ...violation,
            key: suggestedHashes.length ? `${violation.key}|${suggestedHashes.join(',')}` : violation.key,
            suggestedHashes,
            sourceFiles: sorted(violation.sourceFiles),
            pages: sorted(pagePaths),
            tests: sorted(violation.tests),
        };
    });

    return violations.sort(
        (a, b) =>
            Number(a.disposition === 'report') - Number(b.disposition === 'report') ||
            a.directive.localeCompare(b.directive) ||
            a.blockedUri.localeCompare(b.blockedUri)
    );
}
