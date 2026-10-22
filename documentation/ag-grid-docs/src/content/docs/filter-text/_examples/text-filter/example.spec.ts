import { expect, test } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

// Drags the open column filter's right-hand resizer and checks the popup widened by the same amount.
async function expectFilterPopupWidensFromRightEdge(page: Page): Promise<void> {
    const popup = page.locator('.ag-menu').first();
    await expect(popup).toBeVisible();
    const resizer = popup.locator('.ag-resizer-right');

    const gridBox = (await page.locator('.ag-root-wrapper').first().boundingBox())!;
    const popupBox = (await popup.boundingBox())!;
    const resizerBox = (await resizer.boundingBox())!;

    // The popup can only widen up to the grid's right edge, so the drag must stay inside it.
    const distance = Math.min(80, Math.floor(gridBox.x + gridBox.width - (popupBox.x + popupBox.width)) - 10);
    expect(distance).toBeGreaterThanOrEqual(40);

    const x = resizerBox.x + resizerBox.width / 2;
    const y = resizerBox.y + resizerBox.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + distance, y, { steps: 10 });
    await page.mouse.up();

    await expect(async () => {
        const width = (await popup.boundingBox())!.width;
        // Allow for sub-pixel rounding of the drag; a capped popup would fall short by far more.
        expect(Math.abs(width - (popupBox.width + distance))).toBeLessThan(5);
    }).toPass();
}

test.agExample(import.meta, () => {
    test.eachFramework('Default text filter narrows rows with a contains match', async ({ page, agIdFor }) => {
        // Unfiltered, the first row is Michael Phelps.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // Open the athlete column filter and apply a contains match (the default option).
        await agIdFor.headerFilterButton('athlete').click();
        const filterInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await expect(filterInput).toBeVisible();
        await filterInput.fill('Fischer');

        // The filter applies automatically; the first displayed athlete now contains "Fischer".
        const firstAthlete = page.locator('[row-index="0"] [col-id="athlete"]').first();
        await expect(firstAthlete).toContainText('Fischer');
    });

    test.eachFramework('Column filter popup widens when its right-hand edge is dragged', async ({ page, agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await agIdFor.headerFilterButton('country').click();
        await expectFilterPopupWidensFromRightEdge(page);
    });

    test.eachFramework(
        'Column filter popup widens when the grid is offset from the left of the viewport',
        async ({ page, agIdFor }) => {
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

            // Offset the grid from the viewport's left edge, as on a wide page with the grid in a side column.
            await page.evaluate(() => {
                document.body.style.boxSizing = 'border-box';
                document.body.style.paddingLeft = '400px';
            });
            await expect(async () => {
                expect((await page.locator('.ag-root-wrapper').first().boundingBox())!.x).toBeGreaterThanOrEqual(400);
            }).toPass();

            await agIdFor.headerFilterButton('country').click();
            await expectFilterPopupWidensFromRightEdge(page);
        }
    );
});
