import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Displays company and url columns with hyperlink values', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Rows are in original data order.
        await expect(agIdFor.cell('0', 'company')).toContainText('Google');
        await expect(agIdFor.cell('0', 'url')).toContainText('https://www.google.com');
        await expect(agIdFor.cell('1', 'company')).toContainText('Adobe');
        await expect(agIdFor.cell('1', 'url')).toContainText('https://www.adobe.com');

        // The url column carries the hyperlink cellClass referenced by the Excel style.
        await expect(agIdFor.cell('0', 'url')).toHaveClass(/hyperlinks/);
    });

    test.eachFramework('Sorting the company column reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Adobe is the alphabetical minimum, so it floats to the top when sorting ascending.
        const adobeRow = agIdFor.rowNode('1');
        await agIdFor.headerCell('company').click();
        await waitForRowAnimations(page);
        await expect(adobeRow).toHaveAttribute('row-index', '0');

        await agIdFor.headerCell('company').click();
        await waitForRowAnimations(page);
        await expect(adobeRow).not.toHaveAttribute('row-index', '0');
    });
});
