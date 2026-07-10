import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Locator } from 'playwright/test';

async function getWidth(locator: Locator): Promise<number> {
    return (await locator.boundingBox())?.width ?? 0;
}

test.agExample(import.meta, () => {
    test.eachFramework('Shift resizing takes width from the adjacent column', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // colResizeDefault: 'shift' means a plain drag steals width from the neighbouring
        // column, so the combined width of the two columns stays constant.
        const athleteBefore = await getWidth(agIdFor.headerCell('athlete'));
        const ageBefore = await getWidth(agIdFor.headerCell('age'));

        // Drag the athlete resize handle to the right, widening athlete.
        const handle = page.locator('.ag-header-cell[col-id="athlete"] .ag-header-cell-resize').first();
        const hb = (await handle.boundingBox())!;
        await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
        await page.mouse.down();
        await page.mouse.move(hb.x + 80, hb.y + hb.height / 2, { steps: 10 });
        await page.mouse.up();

        const athleteAfter = await getWidth(agIdFor.headerCell('athlete'));
        const ageAfter = await getWidth(agIdFor.headerCell('age'));

        // athlete grew, age shrank by the same amount, so the pair's total is unchanged.
        expect(athleteAfter).toBeGreaterThan(athleteBefore);
        expect(ageAfter).toBeLessThan(ageBefore);
        expect(athleteAfter + ageAfter).toBeCloseTo(athleteBefore + ageBefore, 0);
    });
});
