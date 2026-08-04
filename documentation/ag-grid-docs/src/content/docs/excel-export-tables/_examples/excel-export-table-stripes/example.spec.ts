import {
    clickHeaderToSort,
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

        // First row of small-olympic-winners.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'gold')).toContainText('1');
        await expect(agIdFor.cell('0', 'total')).toContainText('6');
    });

    test.eachFramework('Sorting by age reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Dara Torres holds the unique maximum age (33) at data index 7.
        await expectRowIdAtIndex(page, 0, '7', { not: true });

        // Ascending by age sorts Dara last, so her row virtualises out of the viewport — assert
        // on the always-rendered first row rather than on her row's own element.
        await clickHeaderToSort(agIdFor.headerCell('age'));
        await waitForRowAnimations(page);
        await expectRowIdAtIndex(page, 0, '7', { not: true });

        await clickHeaderToSort(agIdFor.headerCell('age'));
        await waitForRowAnimations(page);
        await expectRowIdAtIndex(page, 0, '7');
    });
});
