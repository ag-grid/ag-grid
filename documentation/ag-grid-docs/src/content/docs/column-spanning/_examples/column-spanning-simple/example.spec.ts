import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Row 0 is Michael Phelps / United States: country colSpan === 4, so the
    // country cell covers country, year, date and sport in the scrollable region.
    test.eachFramework('United States rows span four columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');

        // The spanned-over columns render no cell for this row.
        await expect(agIdFor.cell('0', 'year')).not.toBeVisible();
        await expect(agIdFor.cell('0', 'date')).not.toBeVisible();
        await expect(agIdFor.cell('0', 'sport')).not.toBeVisible();
    });

    // Row 4 is Aleksey Nemov / Russia: country colSpan === 2, so only year is covered.
    test.eachFramework('Russia rows span two columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('4', 'country')).toContainText('Russia');
        await expect(agIdFor.cell('4', 'year')).not.toBeVisible();
        // date is beyond the two-column span, so it still renders.
        await expect(agIdFor.cell('4', 'date')).toContainText('01/10/2000');
    });

    // Row 5 is Alicia Coutts / Australia: colSpan === 1, so every cell renders.
    test.eachFramework('Other countries do not span', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('5', 'country')).toContainText('Australia');
        await expect(agIdFor.cell('5', 'year')).toContainText('2012');
        await expect(agIdFor.cell('5', 'sport')).toContainText('Swimming');
    });

    // Sorting reorders rows while spanning continues to track each row's data.
    test.eachFramework('Sorting by age reorders the spanned rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const phelps = agIdFor.rowNode('0');
        await expect(phelps).toHaveAttribute('row-index', '0');

        await agIdFor.headerCell('age').click();
        // Youngest athletes float to the top, so row 0 (age 23) is no longer first.
        await expect(phelps).not.toHaveAttribute('row-index', '0');
    });
});
