import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Nested master / detail renders with auto detail row height', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // Level 1 (master grid) shows its own columns.
        await expect(agIdFor.cell('0', 'a1')).toContainText('level 1 - 111');
        await expect(agIdFor.cell('0', 'b1')).toContainText('level 1 - 222');

        // groupDefaultExpanded=1 auto-expands the master row, so the Level 2 detail grid is shown.
        const level2 = page
            .locator('.ag-details-row')
            .filter({ has: page.locator('[col-id="a2"]', { hasText: 'level 2 - 333' }) })
            .first();
        await expect(level2).toBeVisible();
        await expect(level2.locator('.ag-root-wrapper').first()).toBeVisible();
        await expect(level2.locator('[col-id="b2"]', { hasText: 'level 2 - 444' }).first()).toBeVisible();

        // The Level 2 detail grid is itself a master grid; its row auto-expands to reveal the Level 3 detail grid.
        const level3 = page
            .locator('.ag-details-row')
            .filter({ has: page.locator('[col-id="a3"]', { hasText: 'level 3 - 5551' }) })
            .first();
        await expect(level3).toBeVisible();
        await expect(level3.locator('.ag-root-wrapper').first()).toBeVisible();

        // With detailRowAutoHeight=true the Level 3 grid grows to fit all its rows, so every one of the
        // six Level 3 rows is visible without needing to scroll the detail grid.
        for (let i = 1; i <= 6; i++) {
            await expect(level3.locator('[col-id="a3"]', { hasText: `level 3 - 555${i}` }).first()).toBeVisible();
            await expect(level3.locator('[col-id="b3"]', { hasText: `level 3 - 666${i}` }).first()).toBeVisible();
        }

        // Both master rows are expanded, so there are four detail rows in total:
        // one Level 2 detail grid per master row, each containing one nested Level 3 detail grid.
        const detailRows = page.locator('.ag-details-row');
        await expect(detailRows).toHaveCount(4);

        // Collapsing the first master row removes its whole nested structure (its Level 2 grid and the Level 3 child).
        await agIdFor.groupExpanded('0', 'a1').click();
        await expect(detailRows).toHaveCount(2);

        // Re-expanding the master row brings its nested detail grids back.
        await agIdFor.groupContracted('0', 'a1').click();
        await expect(detailRows).toHaveCount(4);
    });
});
