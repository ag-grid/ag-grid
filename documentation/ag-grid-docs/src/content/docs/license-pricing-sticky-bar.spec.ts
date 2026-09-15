import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { blockConsentAndAnalytics } from '@utils/grid/test-utils';

// The pricing page's sticky summary bar pins below the site header, which is itself sticky and
// paints above it. The header is two rows tall wherever its search box has wrapped, so a fixed
// offset leaves the bar partly hidden in that band (CRT-1226). 1200px sits inside it; 1400px is
// the single-row control.
const TWO_ROW_HEADER_WIDTH = 1200;
const ONE_ROW_HEADER_WIDTH = 1400;

// getBoundingClientRect values are fractional, so compare with a sub-pixel tolerance.
const OVERLAP_TOLERANCE_PX = 0.5;

const PAGE_PATH = 'license-pricing/';

/**
 * Park the page where the summary bar is shown: a scroll listener reveals it once the pricing cards
 * have gone above the fold and hides it again at the trial section, so bring the cards' bottom edge
 * just past the listener's threshold. That listener belongs to a `client:load` island, so poll —
 * scrolling once can easily happen before hydration has attached it.
 */
async function scrollToRevealBar(page: Page, bar: Locator) {
    await expect
        .poll(
            async () => {
                // Idempotent: once the cards sit at 150px the next scrollBy is a no-op.
                await page.evaluate(() => {
                    const cards = document.querySelector('[class*="licensesOuter_"]');
                    if (cards) {
                        window.scrollBy({ top: cards.getBoundingClientRect().bottom - 150 });
                    }
                });
                await page.waitForTimeout(100);

                return bar.evaluate((el) => window.getComputedStyle(el).opacity);
            },
            { message: 'the sticky summary bar never faded in', timeout: 10_000 }
        )
        .toBe('1');
}

test.describe('license pricing sticky bar', () => {
    for (const width of [TWO_ROW_HEADER_WIDTH, ONE_ROW_HEADER_WIDTH]) {
        test(`clears the site header at ${width}px`, async ({ page }) => {
            await blockConsentAndAnalytics(page);
            await page.setViewportSize({ width, height: 900 });
            await page.goto(PAGE_PATH);

            const header = page.locator('.site-header');
            await expect(header).toBeVisible();

            // The bar itself is the outermost `fullWidthBar` element; its container and items
            // share the class prefix and are nested inside it.
            const bar = page.locator('[class*="fullWidthBar_"]').first();
            await scrollToRevealBar(page, bar);

            const geometry = await page.evaluate(() => {
                const headerEl = document.querySelector('.site-header')!;
                const barEl = document.querySelector('[class*="fullWidthBar_"]')!;

                return {
                    headerPosition: window.getComputedStyle(headerEl).position,
                    headerBottom: headerEl.getBoundingClientRect().bottom,
                    barTop: barEl.getBoundingClientRect().top,
                };
            });

            // Both widths are above the header's sticky threshold — if that ever stops being
            // true the offset below is measuring something else, so assert it rather than
            // silently passing.
            expect(geometry.headerPosition).toBe('sticky');
            expect(geometry.barTop).toBeGreaterThanOrEqual(geometry.headerBottom - OVERLAP_TOLERANCE_PX);
        });
    }
});
