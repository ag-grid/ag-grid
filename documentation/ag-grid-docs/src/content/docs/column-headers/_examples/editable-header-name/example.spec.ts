import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renames a column header from the column menu', async ({ agIdFor, page }) => {
        const athlete = agIdFor.headerCell('athlete');
        await expect(athlete).toContainText('Athlete');

        // Open the column menu and choose "Edit Column Name"
        await athlete.hover();
        await athlete.locator('.ag-header-cell-menu-button').click();
        await page.getByText('Edit Column Name', { exact: true }).click();

        // Editor shows the current name; replace it and commit with Enter
        const input = page.locator('.ag-column-header-edit-popup-editor input');
        await expect(input).toHaveValue('Athlete');
        await input.fill('Competitor');
        await input.press('Enter');

        await expect(athlete).toContainText('Competitor');
    });

    test.eachFramework('does not offer editing for non-editable columns', async ({ agIdFor, page }) => {
        const sport = agIdFor.headerCell('sport');
        await sport.hover();
        await sport.locator('.ag-header-cell-menu-button').click();
        await expect(page.getByText('Edit Column Name', { exact: true })).toHaveCount(0);
    });
});
