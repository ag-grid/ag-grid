import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Floating Filter reflects the applied child Text Filter', async ({ page, agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // The Multi Filter floating filter is read-only; its button opens the full filter menu.
        const floatingButton = agIdFor.floatingFilterButton('athlete');
        await expect(floatingButton).toBeVisible();
        await floatingButton.click();

        const textInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await expect(textInput).toBeVisible();
        await textInput.fill('Michael Phelps');

        // Rows 0, 1, 2 are the three Michael Phelps entries; row 3 is filtered out.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('2', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('3', 'athlete')).not.toBeVisible();
    });
});
