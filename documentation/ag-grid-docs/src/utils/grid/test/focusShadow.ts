/**
 * Node half of the focus shadow audit. Drives {@link auditFocusShadows} once per example and fails the example
 * with what it found; see that function for what is being checked.
 *
 * Runs from the universal example teardown, so every example spec contributes without being configured.
 */
import { type Page, test } from '@playwright/test';

import { type FocusShadowIssue, auditFocusShadows } from './focusShadow.browser';

/**
 * Focus styling has no framework-specific code, so one framework's run covers every example. Tests are named
 * after the framework they run, which is the only place the running framework is available in the teardown.
 */
const AUDITED_FRAMEWORK = 'reactFunctionalTs';

export function describeIssue(issue: FocusShadowIssue): string {
    return (
        `Focus shadow clipped: an outset shadow of ${issue.boxShadow} is cut off by an ancestor with` +
        ` overflow ${issue.overflow}.\n    shadow on ${issue.shadowOn}\n    clipped by ${issue.clippedBy}`
    );
}

/** Audits the example currently loaded in `page`, on the audited framework only. */
export async function checkFocusShadows(page: Page): Promise<FocusShadowIssue[]> {
    if (process.env.AG_SKIP_FOCUS_AUDIT || !test.info().title.startsWith(AUDITED_FRAMEWORK)) {
        return [];
    }

    // Chromium only matches :focus-visible for programmatic focus once the page has seen keyboard input, and
    // without that match no focus style applies at all and nothing would ever be found.
    await page.keyboard.press('Tab');
    return page.evaluate(auditFocusShadows);
}

/**
 * Fails the example that surfaced the issues. Thrown rather than asserted: `expect(...).toEqual([])` would
 * print a deep-equality diff of every finding on top of the message, repeating both ancestor chains per issue.
 */
export function reportFocusIssues(issues: FocusShadowIssue[], page: Page): void {
    if (issues.length === 0) {
        return;
    }
    throw new Error(`Focus shadow issues:\n\n - ${issues.map(describeIssue).join('\n\n - ')}\n\n${page.url()}`);
}
