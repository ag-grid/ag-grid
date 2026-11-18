/**
 * The known link problems the build tolerates, so that adding a rule to the link checker fails the
 * build on the links written after it rather than on every link written before.
 *
 * A problem is identified by its rule and the offending href, not by the page it was found on:
 * a bad link in a shared component appears on every page, and renaming a page should not invalidate
 * the list. The cost is that a second page repeating an already-listed link is not caught.
 */

export interface LinkFinding {
    /** The rule that was broken, eg `missing-page`. */
    rule: string;
    /** What the rule was broken by: the href, or the link it resolves to. */
    subject: string;
    message: string;
    /** Names the finding in the JUnit report. Defaults to the finding's baseline key. */
    reportKey?: string;
}

/** The shape of the baseline file: the subjects tolerated under each rule. */
export type BaselineFile = Record<string, string[]>;

export const findingKey = ({ rule, subject }: Pick<LinkFinding, 'rule' | 'subject'>): string => `${rule} ${subject}`;

export function parseBaseline(text: string): Set<string> {
    const file = JSON.parse(text) as BaselineFile;
    return new Set(
        Object.entries(file).flatMap(([rule, subjects]) => subjects.map((subject) => findingKey({ rule, subject })))
    );
}

/** The baseline file's contents for `findings`: sorted, so that regenerating it makes a minimal diff. */
export function serialiseBaseline(findings: Pick<LinkFinding, 'rule' | 'subject'>[]): string {
    const file: BaselineFile = {};
    for (const { rule, subject } of findings) {
        (file[rule] ??= []).push(subject);
    }
    const sorted = Object.fromEntries(
        Object.keys(file)
            .sort()
            .map((rule) => [rule, [...new Set(file[rule])].sort()])
    );
    return `${JSON.stringify(sorted, null, 4)}\n`;
}

export interface BaselinePartition<T extends LinkFinding> {
    /** Not in the baseline: these fail the build. */
    fresh: T[];
    /** In the baseline: tolerated. */
    known: T[];
    /** Baseline entries that no longer occur: fixed, so they can come off the list. */
    stale: string[];
}

export function partitionByBaseline<T extends LinkFinding>(findings: T[], baseline: Set<string>): BaselinePartition<T> {
    const seen = new Set(findings.map(findingKey));
    return {
        fresh: findings.filter((finding) => !baseline.has(findingKey(finding))),
        known: findings.filter((finding) => baseline.has(findingKey(finding))),
        stale: [...baseline].filter((key) => !seen.has(key)).sort(),
    };
}
