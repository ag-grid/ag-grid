import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Columns: 'name' (field), 'person.country' (field + dot notation), and an anonymous
    // valueGetter column (Total Medals = gold + silver + bronze) which is assigned colId '0'.
    test.eachFramework('field and dot-notation field map the row data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Row 0: { name: 'Michael Phelps', person: { country: 'United States' }, medals: 8/0/0 }
        await expect(agIdFor.cell('0', 'name')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'person.country')).toContainText('United States');

        // Row 4: dot notation resolves a different nested country.
        await expect(agIdFor.cell('4', 'person.country')).toContainText('Russia');
    });

    test.eachFramework('valueGetter sums the three medal totals', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Row 0: 8 + 0 + 0 = 8
        await expect(agIdFor.cell('0', '0')).toContainText('8');
        // Row 3: Natalie Coughlin 1 + 2 + 3 = 6
        await expect(agIdFor.cell('3', '0')).toContainText('6');
        // Row 4: Aleksey Nemov 2 + 1 + 3 = 6
        await expect(agIdFor.cell('4', '0')).toContainText('6');
    });
});
