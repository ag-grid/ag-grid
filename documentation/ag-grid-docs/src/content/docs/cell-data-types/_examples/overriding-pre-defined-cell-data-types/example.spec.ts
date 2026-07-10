import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Overridden date formats render in dd/MM/yyyy', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
        // 'dateString' overridden to keep the source dd/MM/yyyy format rather than ISO.
        await expect(agIdFor.cell('0', 'date')).toContainText('24/08/2008');
        // 'dateTimeString' overridden to dd/MM/yyyy HH:mm:ss; the date portion is deterministic.
        await expect(agIdFor.cell('0', 'dateTimeWithSpace')).toContainText('24/08/2008');
    });

    test.eachFramework('Text filter narrows the rows', async ({ agIdFor, page }) => {
        // Natalie Coughlin (row 3) is present before filtering.
        await expect(page.getByText('Natalie Coughlin').first()).toBeVisible();

        await agIdFor.floatingFilter('athlete').locator('input').fill('Michael Phelps');

        await expect(page.getByText('Natalie Coughlin')).toHaveCount(0);
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
    });
});
