import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Long wrapped header names size the header row automatically', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Long header names are shown in full (wrapped onto multiple lines).
        await expect(agIdFor.headerCell('athlete')).toContainText('The full Name of the athlete');

        // Data still renders beneath the tall headers.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');

        // autoHeaderHeight grows the header row beyond a single line.
        const headerBox = await page.locator('.ag-header').boundingBox();
        expect(headerBox!.height).toBeGreaterThan(48);
    });

    test.eachFramework('Narrowing a column grows the header height', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const header = page.locator('.ag-header');
        const heightBefore = (await header.boundingBox())!.height;

        // Drag the athlete resize handle left so its long name wraps onto more lines.
        const handle = page.locator('.ag-header-cell[col-id="athlete"] .ag-header-cell-resize').first();
        const hb = (await handle.boundingBox())!;
        await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
        await page.mouse.down();
        await page.mouse.move(hb.x - 120, hb.y + hb.height / 2, { steps: 10 });
        await page.mouse.up();

        const heightAfter = (await header.boundingBox())!.height;
        expect(heightAfter).toBeGreaterThan(heightBefore);
    });
});
