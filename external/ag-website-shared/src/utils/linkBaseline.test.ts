import { describe, expect, it } from 'vitest';

import { type LinkFinding, findingKey, parseBaseline, partitionByBaseline, serialiseBaseline } from './linkBaseline';

const finding = (rule: string, subject: string): LinkFinding => ({ rule, subject, message: `${rule}: ${subject}` });

describe('linkBaseline', () => {
    it('round-trips through the file format', () => {
        const findings = [finding('missing-page', '/b/'), finding('utm-parameters', '/c/?utm_source=x')];
        const baseline = parseBaseline(serialiseBaseline(findings));
        expect([...baseline].sort()).toEqual(findings.map(findingKey).sort());
    });

    it('writes a stable, sorted file with each subject once', () => {
        const text = serialiseBaseline([
            finding('utm-parameters', '/z/?utm_source=x'),
            finding('missing-page', '/b/'),
            finding('missing-page', '/a/'),
            finding('missing-page', '/b/'),
        ]);
        expect(text).toBe(`{
    "missing-page": [
        "/a/",
        "/b/"
    ],
    "utm-parameters": [
        "/z/?utm_source=x"
    ]
}
`);
    });

    it('keeps a subject that contains a space under its own rule', () => {
        const baseline = parseBaseline(serialiseBaseline([finding('missing-page', '/a b/')]));
        expect(baseline).toEqual(new Set(['missing-page /a b/']));
    });

    describe('partitionByBaseline', () => {
        const baseline = parseBaseline(
            serialiseBaseline([finding('missing-page', '/known/'), finding('missing-page', '/fixed/')])
        );

        it('fails only what the baseline does not list', () => {
            const { fresh, known } = partitionByBaseline(
                [finding('missing-page', '/known/'), finding('missing-page', '/new/')],
                baseline
            );
            expect(known.map((f) => f.subject)).toEqual(['/known/']);
            expect(fresh.map((f) => f.subject)).toEqual(['/new/']);
        });

        it('matches the rule as well as the href', () => {
            const { fresh } = partitionByBaseline([finding('redirecting-link', '/known/')], baseline);
            expect(fresh).toHaveLength(1);
        });

        it('reports baseline entries that no longer occur', () => {
            const { stale } = partitionByBaseline([finding('missing-page', '/known/')], baseline);
            expect(stale).toEqual(['missing-page /fixed/']);
        });

        it('passes everything against an empty baseline', () => {
            const { fresh, known, stale } = partitionByBaseline([finding('missing-page', '/a/')], new Set());
            expect([fresh.length, known.length, stale.length]).toEqual([1, 0, 0]);
        });
    });
});
