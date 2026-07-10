import { clickAllButtons, ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('The single row renders the raw values across every typed column', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The Excel styles only affect the exported file, so the grid shows the raw provided values.
        // rawValue (1) is shared by the provided, number, currency, boolean and string columns.
        await expect(agIdFor.cell('0', 'rawValue')).toContainText('1');
        await expect(agIdFor.cell('0', 'rawValue_1')).toContainText('1');
        await expect(agIdFor.cell('0', 'rawValue_4')).toContainText('1');

        // negativeValue (-10) drives the Negative column.
        await expect(agIdFor.cell('0', 'negativeValue')).toContainText('-10');

        // dateValue is displayed as the raw ISO string.
        await expect(agIdFor.cell('0', 'dateValue')).toContainText('2009-04-20');
    });

    test.eachFramework('Exporting to Excel keeps the grid rendered', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Click the "Export to Excel" button that the page documents.
        await clickAllButtons(page);

        await expect(agIdFor.cell('0', 'negativeValue')).toContainText('-10');
    });
});
