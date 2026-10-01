import { expect, test } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

// TypeScript only - the framework wrappers mount into the document, so they cannot build a grid detached.
test.agExample(import.meta, () => {
    test.typescript('builds a small column window while unmeasurable', async ({ page }) => {
        // Both grids are built before anything can measure them, so poll until they have rendered at all.
        await expect(async () => {
            await page.getByRole('button', { name: 'Measure' }).click();
            expect(await readCount(page, '#hiddenCount')).toBeGreaterThan(0);
            expect(await readCount(page, '#detachedCount')).toBeGreaterThan(0);
        }).toPass();

        // A container with no layout must not build all 400 columns: cost stays proportional to what
        // could be seen, not to the column count.
        expect(await readCount(page, '#hiddenCount')).toBeLessThan(25);
        expect(await readCount(page, '#detachedCount')).toBeLessThan(25);

        // Once it can measure, the grid builds the window the viewport actually covers. The counts are
        // only recomputed on demand, so each poll has to measure again rather than re-read the last value.
        await page.getByRole('button', { name: 'Show grid' }).click();
        await expect(async () => {
            await page.getByRole('button', { name: 'Measure' }).click();
            expect(await readCount(page, '#hiddenCount')).toBeGreaterThan(2);
        }).toPass();
        expect(await readCount(page, '#hiddenCount')).toBeLessThan(25);

        // Hiding it again returns to a small window rather than falling back to every column.
        await page.getByRole('button', { name: 'Hide grid' }).click();
        await expect(async () => {
            await page.getByRole('button', { name: 'Measure' }).click();
            expect(await readCount(page, '#hiddenCount')).toBeLessThan(25);
        }).toPass();
    });
});

async function readCount(page: Page, selector: string) {
    return Number(await page.locator(selector).textContent());
}
