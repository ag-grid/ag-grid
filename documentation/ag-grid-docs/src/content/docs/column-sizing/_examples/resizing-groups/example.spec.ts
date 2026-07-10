import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Locator, Page } from 'playwright/test';

async function getWidth(locator: Locator): Promise<number> {
    return (await locator.boundingBox())?.width ?? 0;
}

// Drag the resize handle of a group header to the right by `dx` pixels.
async function dragGroupHeader(page: Page, groupName: string, dx: number): Promise<void> {
    const groupCell = page.locator('.ag-header-group-cell').filter({ hasText: groupName }).first();
    const handle = groupCell.locator('.ag-header-cell-resize').first();
    const hb = (await handle.boundingBox())!;
    await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
    await page.mouse.down();
    await page.mouse.move(hb.x + dx, hb.y + hb.height / 2, { steps: 10 });
    await page.mouse.up();
}

test.agExample(import.meta, () => {
    test.eachFramework('Resizing a group distributes width to all resizable columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // 'Everything Resizes' group: athlete, age and country are all resizable.
        const athleteBefore = await getWidth(agIdFor.headerCell('athlete'));
        const ageBefore = await getWidth(agIdFor.headerCell('age'));
        const countryBefore = await getWidth(agIdFor.headerCell('country'));

        await dragGroupHeader(page, 'Everything Resizes', 150);

        // The extra room is shared equally among all three columns, so each one grows.
        expect(await getWidth(agIdFor.headerCell('athlete'))).toBeGreaterThan(athleteBefore);
        expect(await getWidth(agIdFor.headerCell('age'))).toBeGreaterThan(ageBefore);
        expect(await getWidth(agIdFor.headerCell('country'))).toBeGreaterThan(countryBefore);
    });

    test.eachFramework('Resizing a group only grows its resizable columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // 'Only Year Resizes' group: only year is resizable; date and sport have resizable: false.
        const yearBefore = await getWidth(agIdFor.headerCell('year'));
        const dateBefore = await getWidth(agIdFor.headerCell('date'));
        const sportBefore = await getWidth(agIdFor.headerCell('sport'));

        await dragGroupHeader(page, 'Only Year Resizes', 120);

        expect(await getWidth(agIdFor.headerCell('year'))).toBeGreaterThan(yearBefore);
        expect(await getWidth(agIdFor.headerCell('date'))).toBe(dateBefore);
        expect(await getWidth(agIdFor.headerCell('sport'))).toBe(sportBefore);
    });
});
