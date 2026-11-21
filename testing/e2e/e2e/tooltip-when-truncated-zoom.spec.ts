import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

// Browser zoom cannot be set headlessly, so CSS zoom on the root element stands in for it: below 100% Chromium
// snaps the cells' 1px borders to a whole device pixel there too, which is what shrinks the cell's content box.
const mountZoomedGrid = (page: Page, zoom: number) =>
    mountGrid(page, {
        width: 1000,
        css: `html { zoom: ${zoom}; } .multiline-cell { white-space: normal; line-height: 20px; }
            .ag-cell.bordered-cell { white-space: pre-line; line-height: 20px; border-bottom: 12px solid red; }`,
        options: () => ({
            columnDefs: [
                { field: 'athlete', tooltipField: 'athlete', width: 180 },
                { field: 'country', tooltipField: 'country', width: 100 },
                { field: 'notes', tooltipField: 'notes', width: 200, cellClass: 'multiline-cell' },
                { field: 'wrapped', tooltipField: 'wrapped', width: 200, wrapText: true },
                { field: 'bordered', tooltipField: 'bordered', width: 200, cellClass: 'bordered-cell' },
            ],
            rowData: [
                {
                    athlete: 'Michael Phelps',
                    country: 'United States',
                    notes: 'A long note that wraps onto several lines and is clipped by the height of the row',
                    wrapped: 'Another long note that wraps onto several lines and is clipped by the height of the row',
                    // The second line ends below the padding edge but inside the 12px bottom border.
                    bordered: 'First line\nSecond line',
                },
            ],
            tooltipShowDelay: 0,
            tooltipShowMode: 'whenTruncated',
        }),
    });

const tooltipAfterHover = async (page: Page, target: Locator) => {
    await page.mouse.move(0, 0);
    await target.hover();
    // With no show delay the tooltip is shown on the next tick, so this is ample for the cases asserting none.
    await page.waitForTimeout(300);
    return page.locator('.ag-tooltip');
};

// The previous cell's tooltip can still be in the page while the next one shows, so match each by its text.
const tooltipWithText = async (page: Page, target: Locator, text: RegExp) =>
    (await tooltipAfterHover(page, target)).filter({ hasText: text });

test.describe('tooltipShowMode whenTruncated at fractional zoom', () => {
    for (const zoom of [1, 0.8, 0.67]) {
        test(`shows no tooltip for a cell whose text fits at ${zoom * 100}% zoom`, async ({ page, browserName }) => {
            test.skip(zoom !== 1 && browserName !== 'chromium', 'CSS zoom stands in for browser zoom in Chromium only');
            const { cell } = await mountZoomedGrid(page, zoom);
            await expect(await tooltipAfterHover(page, cell(0, 'athlete'))).toHaveCount(0);
        });

        test(`shows a tooltip for a cell truncated with an ellipsis at ${zoom * 100}% zoom`, async ({ page }) => {
            const { cell } = await mountZoomedGrid(page, zoom);
            await expect(await tooltipAfterHover(page, cell(0, 'country'))).toHaveText('United States');
        });

        test(`shows a tooltip for wrapped text clipped by the row height at ${zoom * 100}% zoom`, async ({ page }) => {
            const { cell } = await mountZoomedGrid(page, zoom);
            await expect(await tooltipWithText(page, cell(0, 'notes'), /^A long note/)).toHaveCount(1);
            await expect(await tooltipWithText(page, cell(0, 'wrapped'), /^Another long note/)).toHaveCount(1);
        });

        test(`shows a tooltip for text clipped inside the bottom border at ${zoom * 100}% zoom`, async ({ page }) => {
            const { cell } = await mountZoomedGrid(page, zoom);
            await expect(await tooltipWithText(page, cell(0, 'bordered'), /^First line\s+Second line$/)).toHaveCount(1);
        });
    }
});
