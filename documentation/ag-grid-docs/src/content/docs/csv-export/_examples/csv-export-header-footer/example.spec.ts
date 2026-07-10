import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('CsvCell[][] prependContent is escaped', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('#prependContent').selectOption('array');
        await page.getByText('Show CSV export content text').click();

        const csv = await page.locator('#csvResult').inputValue();
        // Custom content is escaped: internal quotes are doubled, commas kept inside the quoted cell.
        expect(csv).toContain('"Here is a comma, and a some ""quotes""."');
        expect(csv).toContain('"this cell:","","is empty because the first cell has mergeAcross=1"');
        // Grid data still follows the prepended content.
        expect(csv).toContain('"Make","Model","Price"');
        expect(csv).toContain('"Toyota","Celica","35000"');
    });

    test.eachFramework('string prependContent is inserted verbatim', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('#prependContent').selectOption('string');
        await page.getByText('Show CSV export content text').click();

        const csv = await page.locator('#csvResult').inputValue();
        // Legacy string content is not escaped, so its quotes are single.
        expect(csv).toContain('Here is a comma, and a some "quotes". You can see them using the');
        expect(csv).not.toContain('""quotes""');
        expect(csv).toContain('"Make","Model","Price"');
    });
});
