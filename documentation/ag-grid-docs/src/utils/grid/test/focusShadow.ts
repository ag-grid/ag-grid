/**
 * Focus shadow audit: finds focusable elements whose outset `box-shadow` focus indicator is clipped by an
 * ancestor with `overflow: hidden/scroll/auto/clip`.
 *
 * A manually run development utility, not part of any gate. It is off unless `AG_FOCUS_AUDIT` is set, so an
 * ordinary run - CI included - behaves exactly as it would without this file. To run it:
 *
 *     ./docs-e2e.sh --focus-audit
 *
 * That flag sets `AG_FOCUS_AUDIT` and pins the run to one framework, which covers every example once; focus
 * styling has no framework-specific code. The usual filters still narrow it:
 *
 *     ./docs-e2e.sh "tool-panel-filters-new" --focus-audit
 *
 * Each example is audited twice: once as loaded, then again after its test body has driven the grid into the
 * state that example demonstrates. Focusing every element perturbs the grid, so while auditing, an example's
 * own assertions and console output are silenced - the body is only a driver for reaching those states, and
 * the sole reportable failure is a clipped focus shadow.
 *
 * {@link ./focusShadow.browser.ts} holds everything that runs in the page; see it for what counts as clipped.
 */
import type { Page } from '@playwright/test';

import { type FocusShadowIssue, auditFocusShadows } from './focusShadow.browser';

/** Whether to audit, and so whether the example's own failures are the audit's doing and get silenced. */
export const focusAuditEnabled = !!process.env.AG_FOCUS_AUDIT;

/** Findings from the loaded-state pass, held so that pass cannot stop the test body from running. */
let heldIssues: string[] = [];

const describeIssue = (issue: FocusShadowIssue): string =>
    `Focus shadow clipped: an outset shadow of ${issue.boxShadow} is cut off by an ancestor with` +
    ` overflow ${issue.overflow}.\n    shadow on ${issue.shadowOn}\n    clipped by ${issue.clippedBy}`;

async function audit(page: Page): Promise<string[]> {
    // Chromium only matches :focus-visible for programmatic focus once the page has seen keyboard input, and
    // without that match no focus style applies at all and nothing would ever be found.
    await page.keyboard.press('Tab');
    return (await page.evaluate(auditFocusShadows)).map(describeIssue);
}

/** Audits the example as loaded, holding what it finds until {@link reportFocusShadows}. */
export async function recordFocusShadows(page: Page): Promise<void> {
    heldIssues = focusAuditEnabled ? await audit(page) : [];
}

/**
 * Audits the driven example and fails the test with everything either pass found. Thrown rather than
 * asserted: `expect(...).toEqual([])` would print a deep-equality diff of every finding on top of the
 * message, repeating both ancestor chains per issue.
 */
export async function reportFocusShadows(page: Page): Promise<void> {
    if (!focusAuditEnabled) {
        return;
    }
    const issues = [...heldIssues, ...(await audit(page))];
    heldIssues = [];
    if (issues.length > 0) {
        throw new Error(`Focus shadow issues:\n\n - ${issues.join('\n\n - ')}\n\n${page.url()}`);
    }
}
