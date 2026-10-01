import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Built-in toolbar items render', async ({ page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');
        await expect(toolbar).toBeVisible();

        await expect(toolbar.locator(':scope > .ag-toolbar-input')).toHaveCount(2);
        await expect(toolbar.locator(':scope > .ag-toolbar-button-wrapper')).toHaveCount(2);
    });

    test.eachFramework('Typing into quick filter reduces displayed rows', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await page.locator('.ag-toolbar-input-field').first().fill('Michael Phelps');

        // The first 3 rows in the dataset are all Michael Phelps entries
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('2', 'athlete')).toContainText('Michael Phelps');

        // No other rows should be visible
        await expect(agIdFor.rowNode('3')).not.toBeVisible();
    });

    test.eachFramework('Export menu includes PDF Export', async ({ page }) => {
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Export' }).click();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'PDF Export' })).toBeVisible();
    });

    test.eachFramework('Typing into the find input highlights matching cells', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // agFindToolbarItem renders its own input, separate from the quick filter: it highlights
        // matches in place rather than removing rows.
        const findInput = page.locator('.ag-toolbar-find input');
        await findInput.fill('Phelps');

        await expect(page.locator('mark.ag-find-match').first()).toBeVisible();
        await expect(page.locator('.ag-toolbar-find-match-count')).toHaveText(/^\s*0\/\d+\s*$/);

        // Unlike the quick filter, the non-matching rows are still displayed.
        await expect(agIdFor.cell('3', 'athlete')).toContainText('Natalie Coughlin');
    });

    test.eachFramework('Export menu lists all three configured export items', async ({ page }) => {
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Export' }).click();

        // toolbarItemParams.menuItems is ['csvExport', 'excelExport', 'pdfExport'].
        const menu = page.locator('.ag-menu');
        await expect(menu.locator('.ag-menu-option-text', { hasText: 'CSV Export' })).toBeVisible();
        await expect(menu.locator('.ag-menu-option-text', { hasText: 'Excel Export' })).toBeVisible();
        await expect(menu.locator('.ag-menu-option-text', { hasText: 'PDF Export' })).toBeVisible();
        await expect(menu.locator('.ag-menu-option')).toHaveCount(3);
    });

    test.eachFramework('Right-aligned items sit after the left-aligned inputs', async ({ page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');
        const quickFilterBox = (await toolbar.locator(':scope > .ag-toolbar-input').first().boundingBox())!;
        const findBox = (await toolbar.locator(':scope > .ag-toolbar-input').nth(1).boundingBox())!;
        const fitBox = (await page.getByRole('button', { name: 'Fit Columns To Grid' }).boundingBox())!;
        const exportBox = (await page.getByRole('button', { name: 'Export' }).boundingBox())!;
        const toolbarBox = (await toolbar.boundingBox())!;

        // Both action items set alignment: 'right', so they start beyond the default
        // left-aligned quick filter and find inputs, in item order.
        expect(fitBox.x).toBeGreaterThan(quickFilterBox.x + quickFilterBox.width);
        expect(fitBox.x).toBeGreaterThan(findBox.x + findBox.width);
        expect(exportBox.x).toBeGreaterThan(fitBox.x);

        // ...and they are pushed over to the right-hand end of the toolbar.
        expect(exportBox.x + exportBox.width).toBeGreaterThan(toolbarBox.x + toolbarBox.width / 2);
    });
});
