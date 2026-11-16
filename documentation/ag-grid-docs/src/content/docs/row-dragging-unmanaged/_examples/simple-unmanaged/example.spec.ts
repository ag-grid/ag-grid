import type { Locator, Page } from '@playwright/test';
import {
    clickHeaderToSort,
    ensureGridReady,
    expect,
    expectRowIdAtIndex,
    test,
    waitForGridContent,
    waitForRowAnimations,
} from '@utils/grid/test-utils';

/**
 * Drags a row by its drag handle and drops it over the lower part of the target row.
 */
async function dragRow(page: Page, handle: Locator, target: Locator) {
    const handleBox = (await handle.boundingBox())!;
    const targetBox = (await target.boundingBox())!;
    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY + 10, { steps: 5 });
    await page.mouse.move(startX, targetBox.y + targetBox.height * 0.75, { steps: 10 });
    await page.mouse.up();
}

test.agExample(import.meta, () => {
    // rowDragManaged is not set; the example's onRowDragMove handler moves the dragged item in its own
    // store and sets the new row data, so the grid only reorders because the application tells it to.
    test.eachFramework('dragging a row reorders the rows via the application', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // data.ts order, with getRowId = index: 0 Michael Phelps (2008), 1 Michael Phelps (2004),
        // 2 Michael Phelps (2012), 3 Natalie Coughlin (2008), 4 Aleksey Nemov (2000).
        await expect(agIdFor.cell('0', 'year')).toContainText('2008');
        await expect(agIdFor.cell('3', 'athlete')).toContainText('Natalie Coughlin');
        await expectRowIdAtIndex(page, 0, '0');

        await dragRow(page, agIdFor.dragHandle('0', 'athlete'), agIdFor.cell('3', 'country'));
        await waitForRowAnimations(page);

        // Each move over a row shifts the dragged item one place down, ending where Natalie Coughlin was.
        await expectRowIdAtIndex(page, 0, '1');
        await expectRowIdAtIndex(page, 1, '2');
        await expectRowIdAtIndex(page, 2, '3');
        await expectRowIdAtIndex(page, 3, '0');
        await expectRowIdAtIndex(page, 4, '4');
    });

    test.eachFramework('sorting suppresses row dragging until the sort is cleared', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const handle = agIdFor.dragHandle('0', 'athlete');
        await expect(handle).toBeVisible();

        // Ascending sort: onSortChanged sets suppressRowDrag=true, hiding every drag handle.
        await clickHeaderToSort(agIdFor.headerCell('athlete'));
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'ascending');
        await expect(handle).toBeHidden();
        await expect(agIdFor.dragHandle('5', 'athlete')).toBeHidden();

        // Descending is still a sort, so dragging stays suppressed.
        await waitForRowAnimations(page);
        await clickHeaderToSort(agIdFor.headerCell('athlete'));
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'descending');
        await expect(agIdFor.dragHandle('5', 'athlete')).toBeHidden();

        // Third click removes the sort and dragging is allowed again.
        await waitForRowAnimations(page);
        await clickHeaderToSort(agIdFor.headerCell('athlete'));
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'none');
        await expect(handle).toBeVisible();
    });

    test.eachFramework('filtering suppresses row dragging until the filter is cleared', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.dragHandle('0', 'athlete')).toBeVisible();

        // Keep only rows whose country contains "Australia": the first is row 5, Alicia Coutts.
        await agIdFor.headerFilterButton('country').click();
        const filterInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await filterInput.fill('Australia');
        await filterInput.press('Enter');

        await expect(agIdFor.rowNode('0')).toHaveCount(0);
        await expect(agIdFor.cell('5', 'athlete')).toContainText('Alicia Coutts');
        // onFilterChanged sets suppressRowDrag=true.
        await expect(agIdFor.dragHandle('5', 'athlete')).toBeHidden();

        // Clearing the filter re-enables dragging.
        await filterInput.fill('');
        await filterInput.press('Enter');
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.dragHandle('0', 'athlete')).toBeVisible();
        await expect(agIdFor.dragHandle('5', 'athlete')).toBeVisible();
    });
});
