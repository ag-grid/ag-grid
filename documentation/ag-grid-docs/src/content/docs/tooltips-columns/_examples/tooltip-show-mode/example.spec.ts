import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Locator, Page } from 'playwright/test';

async function expectTruncated(source: Locator, truncated: boolean): Promise<void> {
    await expect
        .poll(() =>
            source.evaluate((element) => {
                const text = element.querySelector<HTMLElement>('.ag-cell-value') ?? element;
                return text.scrollWidth > text.clientWidth;
            })
        )
        .toBe(truncated);
}

async function expectTooltip(page: Page, source: Locator, text?: string): Promise<void> {
    const tooltip = page.locator('.ag-tooltip');
    await source.hover();
    if (text) {
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText(text);
    } else {
        // Observe past tooltipShowDelay (500ms); no visible event signals a suppressed tooltip.
        await page.waitForTimeout(900);
        await expect(tooltip).toHaveCount(0);
    }
    await page.mouse.move(0, 0);
    await expect(tooltip).toHaveCount(0);
}

test.agExample(import.meta, () => {
    test.eachFramework('auto supplies unconfigured tooltips only for truncated text', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const countryHeader = agIdFor.headerCell('country').locator('.ag-header-cell-text');
        await expectTruncated(countryHeader, true);
        await expectTooltip(page, countryHeader, 'Country of Athlete');

        const countryCell = agIdFor.cell('4', 'country');
        await expect(countryCell).toContainText('Russia');
        await expectTruncated(countryCell, false);
        await expectTooltip(page, countryCell);
    });

    test.eachFramework(
        'auto requires truncation for configured tooltips matching the default value',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const athleteHeader = agIdFor.headerCell('athlete').locator('.ag-header-cell-text');
            await expectTruncated(athleteHeader, false);
            await expectTooltip(page, athleteHeader);

            const athleteCell = agIdFor.cell('3', 'athlete');
            await expect(athleteCell).toContainText('Natalie Coughlin');
            await expectTruncated(athleteCell, true);
            await expectTooltip(page, athleteCell, 'Natalie Coughlin');
        }
    );

    test.eachFramework(
        'auto shows different configured tooltips even when the text fits',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const sportCell = agIdFor.cell('0', 'sport');
            await expect(sportCell).toContainText('Swimming');
            await expectTruncated(sportCell, false);
            await expectTooltip(page, sportCell, 'Sport: Swimming');

            const sportHeader = agIdFor.headerCell('sport').locator('.ag-header-cell-text');
            await expectTruncated(sportHeader, false);
            await expectTooltip(page, sportHeader, 'Sport played by the athlete');
        }
    );
});
