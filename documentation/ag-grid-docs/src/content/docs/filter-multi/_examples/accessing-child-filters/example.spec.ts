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
});
