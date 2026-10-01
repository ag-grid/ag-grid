import { expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Locator, Page } from 'playwright/test';

async function width(locator: Locator): Promise<number> {
    return (await locator.boundingBox())?.width ?? 0;
}

function columnWidth(page: Page, colId: string): Promise<number> {
    return width(page.locator(`.ag-header-cell[col-id="${colId}"]`).first());
}

/** Settle the width animation so measurements are stable. */
async function waitForWidths(page: Page): Promise<void> {
    await expect(page.locator('.ag-animate-autosize')).toHaveCount(0);
}

async function loadNextValues(page: Page): Promise<void> {
    await page.locator('button.next-values-button').click();
    await waitForGridContent(page);
    await waitForWidths(page);
}

async function waitForChangeFrom(previous: number, sample: () => Promise<number>): Promise<number> {
    await expect(async () => {
        expect(await sample()).not.toBe(previous);
    }).toPass();
    return sample();
}

async function dragResize(page: Page, colId: string, byPixels: number): Promise<void> {
    const handle = page.locator(`.ag-header-cell[col-id="${colId}"] .ag-header-cell-resize`).first();
    const box = (await handle.boundingBox())!;
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width / 2, y);
    await page.mouse.down();
    await page.mouse.move(box.x + byPixels, y, { steps: 10 });
    await page.mouse.up();
    await waitForWidths(page);
}

test.agExample(import.meta, () => {
    test.eachFramework('each new set of values re-fits the eligible columns', async ({ page }) => {
        await waitForGridContent(page);
        await waitForWidths(page);

        const seen: number[] = [await columnWidth(page, 'sport')];
        for (let click = 0; click < 3; click++) {
            const previous = seen[seen.length - 1];
            await loadNextValues(page);
            seen.push(await waitForChangeFrom(previous, () => columnWidth(page, 'sport')));
        }

        expect(new Set(seen).size, `"Sport" repeated a width across clicks: ${seen.join(', ')}`).toBe(seen.length);
    });

    test.eachFramework('the `suppressAutoSize` column keeps its starting width', async ({ page }) => {
        await waitForGridContent(page);
        await waitForWidths(page);

        expect(await columnWidth(page, 'athlete')).toBe(150);

        await loadNextValues(page);

        expect(await columnWidth(page, 'athlete')).toBe(150);
    });

    test.eachFramework('a user resize takes ownership, and resetting the state hands it back', async ({ page }) => {
        await waitForGridContent(page);
        await waitForWidths(page);

        await dragResize(page, 'sport', 260);
        const ownedWidth = await columnWidth(page, 'sport');
        expect(ownedWidth).toBeGreaterThan(0);

        const countryBefore = await columnWidth(page, 'country');
        await loadNextValues(page);
        const countryFirst = await waitForChangeFrom(countryBefore, () => columnWidth(page, 'country'));
        expect(await columnWidth(page, 'sport')).toBe(ownedWidth);

        await loadNextValues(page);
        await waitForChangeFrom(countryFirst, () => columnWidth(page, 'country'));
        expect(await columnWidth(page, 'sport')).toBe(ownedWidth);

        await page.locator('button.release-widths-button').click();
        await waitForWidths(page);

        await loadNextValues(page);
        const releasedFirst = await waitForChangeFrom(ownedWidth, () => columnWidth(page, 'sport'));
        await loadNextValues(page);
        const releasedSecond = await waitForChangeFrom(releasedFirst, () => columnWidth(page, 'sport'));

        expect(
            releasedSecond,
            `"Sport" held one width across two data changes after the reset (${releasedFirst}), so it is still owned`
        ).not.toBe(releasedFirst);
    });
});
