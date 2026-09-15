import { expect, test } from '@utils/grid/test-utils';

/** Each header shows its column's inferred `cellDataType`, so the headers are what the tests read. */
const INFERRED_HEADERS = [
    'Athlete (text)',
    'Age (number)',
    'Date (date)',
    'Date (String) (dateString)',
    'Gold (boolean)',
];

test.agExample(import.meta, () => {
    test.eachFramework('the Client-Side Row Model infers every column type from the row data', async ({ page }) => {
        for (const header of INFERRED_HEADERS) {
            await expect(page.getByText(header, { exact: true })).toBeVisible();
        }
    });

    test.eachFramework('an inferred boolean column renders a checkbox', async ({ agIdFor }) => {
        // hasGold is inferred as 'boolean', which brings the checkbox cell renderer with it
        await expect(agIdFor.cell('0', 'hasGold').locator('input')).toBeChecked();
    });

    test.eachFramework('the Infinite Row Model infers from the first block of rows', async ({ page }) => {
        await page.getByRole('radio', { name: 'Infinite' }).check();

        for (const header of INFERRED_HEADERS) {
            await expect(page.getByText(header, { exact: true })).toBeVisible();
        }
    });

    test.eachFramework('the Viewport Row Model infers from the rows the datasource pushes', async ({ page }) => {
        await page.getByRole('radio', { name: 'Viewport' }).check();

        for (const header of INFERRED_HEADERS) {
            await expect(page.getByText(header, { exact: true })).toBeVisible();
        }
    });

    test.eachFramework(
        'the Server-Side Row Model does not infer from the group rows loaded first',
        async ({ page }) => {
            await page.getByRole('radio', { name: 'Server-Side' }).check();

            // The first block is group rows, which hold no value for the leaf columns, so nothing resolves
            // until a group is expanded and its leaf rows arrive
            await expect(page.getByText('Athlete (not inferred yet)', { exact: true })).toBeVisible();
            await expect(page.getByText('Age (not inferred yet)', { exact: true })).toBeVisible();
            await expect(page.getByText('Gold (not inferred yet)', { exact: true })).toBeVisible();
        }
    );
});
