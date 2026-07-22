import {
    ensureGridReady,
    expect,
    expectRowIdAtIndex,
    test,
    waitForGridContent,
    waitForRowAnimations,
} from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Flat columns and data render', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First and last columns (athlete, total) are highlighted in the exported table.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'gold')).toContainText('1');
        await expect(agIdFor.cell('0', 'total')).toContainText('6');
    });

    test.eachFramework('Sorting by age reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Dara Torres holds the unique maximum age (33) at data index 7, so only a descending sort
        // of the age column floats her row to the top.
        await expectRowIdAtIndex(page, 0, '7', { not: true });

        await agIdFor.headerCell('age').click();
        await waitForRowAnimations(page);
        await expectRowIdAtIndex(page, 0, '7', { not: true });

        await agIdFor.headerCell('age').click();
        await waitForRowAnimations(page);
        await expectRowIdAtIndex(page, 0, '7');
    });
});
