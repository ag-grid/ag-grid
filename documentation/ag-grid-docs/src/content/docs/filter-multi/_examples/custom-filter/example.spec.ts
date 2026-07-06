import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom Year floating filter filters to years after 2010', async ({ page, agIdFor }) => {
        // Row 0 is a 2008 winner, row 2 is a 2012 winner.
        await expect(agIdFor.cell('0', 'year')).toContainText('2008');
        await expect(agIdFor.cell('2', 'year')).toContainText('2012');

        // the floating filter renders two radios inside its wrapper: All (0), After 2010 (1)
        const afterRadio = page.locator('.year-filter input[type="radio"]').nth(1);
        await expect(afterRadio).toBeVisible();
        await afterRadio.check();

        // doesFilterPass keeps only year > 2010: the 2008 row is removed, the 2012 row remains.
        await expect(agIdFor.cell('0', 'year')).not.toBeVisible();
        await expect(agIdFor.cell('2', 'year')).toContainText('2012');
    });
});
