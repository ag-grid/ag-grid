import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Columns are generated from the first server response and kept when sorting',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            // one column per key of the first row returned by the server
            for (const colId of [
                'athlete',
                'age',
                'country',
                'year',
                'date',
                'sport',
                'gold',
                'silver',
                'bronze',
                'total',
            ]) {
                await expect(agIdFor.headerCell(colId)).toBeVisible();
            }
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

            // sorting requests rows again but does not regenerate the columns
            await agIdFor.headerCell('age').click();
            await expect(agIdFor.cell('0', 'age')).toHaveText('15');
            await expect(page.locator('.ag-header-cell')).toHaveCount(10);
        }
    );
});
