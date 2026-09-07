import { describe, expect, it } from 'vitest';

import type { AcceptedCspViolation, CspHashHint, CspViolationRecord } from './cspViolationReport';
import { aggregateCspViolations, cspDirectiveFamily, parseCspHashHint } from './cspViolationReport';

// Abbreviated from real Chromium output; the full policy string is inlined by the browser and
// carries its own 'sha256-...' entries, which must not be mistaken for the suggested hash.
const INLINE_SCRIPT_BLOCKED =
    "Executing inline script violates the following Content Security Policy directive 'script-src 'self' " +
    "blob: https://plausible.io 'sha256-BrDhGE1lwa85arfXcrBxSo+n37uVSX5CAROXnIM6Q+g=''. Either the " +
    "'unsafe-inline' keyword, a hash ('sha256-ogkEMWdvvBUuNnFAsG8ceWwymW4NoLtrf4wkYCkjQlI='), or a nonce " +
    "('nonce-...') is required to enable inline execution. The action has been blocked.";

const INLINE_STYLE_BLOCKED =
    'Refused to apply inline style because it violates the following Content Security Policy directive: ' +
    "\"style-src 'self'\". Either the 'unsafe-inline' keyword, a hash " +
    "('sha256-KzFLXA5t2S8vLLQZ9AGxlY2CFqUEQ0Vv0nQPBRRRRR8='), or a nonce ('nonce-...') is required to " +
    'enable inline execution.';

const SCRIPT_ORIGIN_BLOCKED =
    "Refused to load the script 'https://example.invalid/blocked.js' because it violates the following " +
    'Content Security Policy directive: "script-src-elem \'self\'".';

const REPORT_ONLY_INLINE_SCRIPT_BLOCKED = `[Report Only] ${INLINE_SCRIPT_BLOCKED}`;

const PAGE = 'https://studio-staging.ag-grid.com/';
const DOCS_PAGE = 'https://studio-staging.ag-grid.com/react/data/';

const inlineScriptRecord: CspViolationRecord = {
    directive: 'script-src-elem',
    blockedUri: 'inline',
    disposition: 'enforce',
    sourceFile: PAGE,
    pageUrl: PAGE,
};

describe('cspDirectiveFamily', () => {
    it('collapses the granular script directives onto one family', () => {
        expect(cspDirectiveFamily('script-src-elem')).toBe('script');
        expect(cspDirectiveFamily('script-src')).toBe('script');
        expect(cspDirectiveFamily('style-src')).toBe('style');
    });
});

describe('parseCspHashHint', () => {
    it('takes the suggested hash, not one already present in the policy', () => {
        expect(parseCspHashHint(INLINE_SCRIPT_BLOCKED, PAGE)).toEqual({
            hash: 'sha256-ogkEMWdvvBUuNnFAsG8ceWwymW4NoLtrf4wkYCkjQlI=',
            family: 'script',
            disposition: 'enforce',
            pageUrl: PAGE,
        });
    });

    it('reads the alternative wording the browser uses for inline styles', () => {
        expect(parseCspHashHint(INLINE_STYLE_BLOCKED, PAGE)).toEqual({
            hash: 'sha256-KzFLXA5t2S8vLLQZ9AGxlY2CFqUEQ0Vv0nQPBRRRRR8=',
            family: 'style',
            disposition: 'enforce',
            pageUrl: PAGE,
        });
    });

    it('yields nothing for a violation a hash cannot answer', () => {
        expect(parseCspHashHint(SCRIPT_ORIGIN_BLOCKED, PAGE)).toBeUndefined();
    });

    it('marks a hash the report-only policy asked for', () => {
        expect(parseCspHashHint(REPORT_ONLY_INLINE_SCRIPT_BLOCKED, PAGE)?.disposition).toBe('report');
    });
});

describe('aggregateCspViolations', () => {
    it('collapses repeats of one violation and lists the pages and tests that hit it', () => {
        const evalRecord: CspViolationRecord = {
            directive: 'script-src',
            blockedUri: 'eval',
            disposition: 'enforce',
            sourceFile: 'https://app.enzuzo.com/scripts/cookiebar/abc',
            pageUrl: PAGE,
        };

        const violations = aggregateCspViolations(
            [
                { record: evalRecord, testTitle: 'homepage loads' },
                { record: evalRecord, testTitle: 'homepage loads' },
                { record: { ...evalRecord, pageUrl: DOCS_PAGE }, testTitle: 'docs data overview loads' },
            ],
            []
        );

        expect(violations).toEqual([
            {
                key: 'enforce|script-src|eval',
                directive: 'script-src',
                blockedUri: 'eval',
                disposition: 'enforce',
                suggestedHashes: [],
                sourceFiles: ['https://app.enzuzo.com/scripts/cookiebar/abc'],
                pages: ['/', '/react/data/'],
                tests: ['docs data overview loads', 'homepage loads'],
            },
        ]);
    });

    it('attaches a suggested hash to the inline violation on the page that reported it', () => {
        const hint = parseCspHashHint(INLINE_SCRIPT_BLOCKED, PAGE) as CspHashHint;

        const violations = aggregateCspViolations(
            [{ record: inlineScriptRecord, testTitle: 'homepage loads' }],
            [hint, { hash: 'sha256-elsewhere=', family: 'script', disposition: 'enforce', pageUrl: DOCS_PAGE }]
        );

        expect(violations[0].suggestedHashes).toEqual(['sha256-ogkEMWdvvBUuNnFAsG8ceWwymW4NoLtrf4wkYCkjQlI=']);
        expect(violations[0].key).toBe(
            'enforce|script-src-elem|inline|sha256-ogkEMWdvvBUuNnFAsG8ceWwymW4NoLtrf4wkYCkjQlI='
        );
    });

    it('leaves a blocked origin without a hash even when the same page reported one', () => {
        const violations = aggregateCspViolations(
            [
                {
                    record: { ...inlineScriptRecord, blockedUri: 'https://example.invalid/blocked.js' },
                    testTitle: 'homepage loads',
                },
            ],
            [parseCspHashHint(INLINE_SCRIPT_BLOCKED, PAGE) as CspHashHint]
        );

        expect(violations[0].suggestedHashes).toEqual([]);
        expect(violations[0].key).toBe('enforce|script-src-elem|https://example.invalid/blocked.js');
    });

    it('ignores a hash reported for a different directive family', () => {
        const violations = aggregateCspViolations(
            [{ record: inlineScriptRecord, testTitle: 'homepage loads' }],
            [parseCspHashHint(INLINE_STYLE_BLOCKED, PAGE) as CspHashHint]
        );

        expect(violations[0].suggestedHashes).toEqual([]);
    });

    it('keys enforced and report-only separately, and orders enforced first', () => {
        const violations = aggregateCspViolations(
            [
                { record: { ...inlineScriptRecord, disposition: 'report' }, testTitle: 'homepage loads' },
                { record: inlineScriptRecord, testTitle: 'homepage loads' },
            ],
            []
        );

        expect(violations.map((violation) => violation.key)).toEqual([
            'enforce|script-src-elem|inline',
            'report|script-src-elem|inline',
        ]);
    });

    it("keeps a report-only policy's hash off the enforced violation", () => {
        const violations = aggregateCspViolations(
            [{ record: inlineScriptRecord, testTitle: 'homepage loads' }],
            [parseCspHashHint(REPORT_ONLY_INLINE_SCRIPT_BLOCKED, PAGE) as CspHashHint]
        );

        expect(violations[0].suggestedHashes).toEqual([]);
        expect(violations[0].key).toBe('enforce|script-src-elem|inline');
    });

    it('keeps two inline scripts blocked under one directive apart', () => {
        const otherPage = 'https://studio-staging.ag-grid.com/react/ai/';
        const hints: CspHashHint[] = [
            { hash: 'sha256-first=', family: 'script', disposition: 'enforce', pageUrl: PAGE },
            { hash: 'sha256-second=', family: 'script', disposition: 'enforce', pageUrl: otherPage },
        ];

        const violations = aggregateCspViolations(
            [
                { record: inlineScriptRecord, testTitle: 'homepage loads' },
                { record: { ...inlineScriptRecord, pageUrl: otherPage }, testTitle: 'ai page loads' },
            ],
            hints
        );

        expect(violations.map((violation) => [violation.key, violation.pages])).toEqual([
            ['enforce|script-src-elem|inline|sha256-first=', ['/']],
            ['enforce|script-src-elem|inline|sha256-second=', ['/react/ai/']],
        ]);
    });

    describe('accepted violations', () => {
        const evalRecord: CspViolationRecord = {
            directive: 'script-src',
            blockedUri: 'eval',
            disposition: 'enforce',
            sourceFile: 'https://vendor.invalid/scripts/banner/abc',
            pageUrl: PAGE,
        };
        const rule: AcceptedCspViolation = {
            directive: 'script-src',
            blockedUri: 'eval',
            sourceFilePrefix: 'https://vendor.invalid/scripts/banner/',
            reason: 'redundant fallback',
        };

        it('marks a matching violation with the reason and leaves it in the report', () => {
            const violations = aggregateCspViolations(
                [{ record: evalRecord, testTitle: 'homepage loads' }],
                [],
                [rule]
            );

            expect(violations).toHaveLength(1);
            expect(violations[0].accepted).toBe('redundant fallback');
            expect(violations[0].key).toBe('enforce|script-src|eval');
        });

        it('leaves the field off a violation no rule matches', () => {
            const violations = aggregateCspViolations([{ record: evalRecord, testTitle: 'homepage loads' }], [], []);

            expect(violations[0]).not.toHaveProperty('accepted');
        });

        it('does not accept the same eval from a script the rule does not name', () => {
            const violations = aggregateCspViolations(
                [
                    { record: evalRecord, testTitle: 'homepage loads' },
                    {
                        record: { ...evalRecord, sourceFile: 'https://other.invalid/app.js', pageUrl: DOCS_PAGE },
                        testTitle: 'docs data overview loads',
                    },
                ],
                [],
                [rule]
            );

            // One group (the key carries no source), and the stranger keeps it visible.
            expect(violations).toHaveLength(1);
            expect(violations[0]).not.toHaveProperty('accepted');
        });

        it('does not accept a different thing the named script is blocked from doing', () => {
            const violations = aggregateCspViolations(
                [
                    {
                        record: { ...evalRecord, directive: 'connect-src', blockedUri: 'https://vendor.invalid/api' },
                        testTitle: 'homepage loads',
                    },
                ],
                [],
                [rule]
            );

            expect(violations[0]).not.toHaveProperty('accepted');
        });

        it('never accepts a violation with no source file to attribute it to', () => {
            const violations = aggregateCspViolations(
                [{ record: { ...evalRecord, sourceFile: undefined }, testTitle: 'homepage loads' }],
                [],
                [rule]
            );

            expect(violations[0]).not.toHaveProperty('accepted');
        });
    });

    it('gathers one blocked script into a single entry across the pages that serve it', () => {
        const otherPage = 'https://studio-staging.ag-grid.com/react/ai/';
        const hints: CspHashHint[] = [
            { hash: 'sha256-gtm=', family: 'script', disposition: 'enforce', pageUrl: PAGE },
            { hash: 'sha256-gtm=', family: 'script', disposition: 'enforce', pageUrl: otherPage },
        ];

        const violations = aggregateCspViolations(
            [
                { record: inlineScriptRecord, testTitle: 'homepage loads' },
                { record: { ...inlineScriptRecord, pageUrl: otherPage }, testTitle: 'ai page loads' },
            ],
            hints
        );

        expect(violations).toHaveLength(1);
        expect(violations[0].pages).toEqual(['/', '/react/ai/']);
        expect(violations[0].suggestedHashes).toEqual(['sha256-gtm=']);
    });
});
