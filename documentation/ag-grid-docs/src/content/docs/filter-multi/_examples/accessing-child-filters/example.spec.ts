import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Print button reads the child Set Filter search text', async ({ page, agIdFor }) => {
        const consoleMessages: string[] = [];
        page.on('console', (msg) => consoleMessages.push(msg.text()));

        const filterButton = agIdFor.headerFilterButton('athlete');
        await expect(filterButton).toBeVisible();
        await filterButton.click();

        const miniFilter = agIdFor.setFilterInstanceMiniFilterInput({ source: 'column-filter' });
        await expect(miniFilter).toBeVisible();
        await miniFilter.fill('Michael');

        await page.getByRole('button', { name: 'Print Set Filter search text' }).click();

        // getChildFilterInstance(1) returns the Set Filter; getMiniFilter() returns the typed text.
        // Retry until the console message arrives over CDP.
        await expect(() => {
            expect(consoleMessages.some((m) => m.includes('Michael'))).toBeTruthy();
        }).toPass();
    });

    test.eachFramework('Buttons sit on the Multi Filter and apply every child', async ({ page, agIdFor }) => {
        await agIdFor.headerFilterButton('athlete').click();
        const filterMenu = page.locator('.ag-filter-menu');
        const applyButton = filterMenu.getByRole('button', { name: 'Apply', exact: true });

        // One Apply and one Clear for the whole Multi Filter, not one per child filter.
        await expect(applyButton).toHaveCount(1);
        await expect(filterMenu.getByRole('button', { name: 'Clear', exact: true })).toHaveCount(1);

        // Typing in a child does not filter until Apply is clicked.
        await filterMenu.locator('input[type="text"]').first().fill('Aaron Armstrong');
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await applyButton.click();
        await expect(agIdFor.cell('8041', 'athlete')).toContainText('Aaron Armstrong');
        await expect(page.locator('.ag-row')).toHaveCount(1);
    });
});
