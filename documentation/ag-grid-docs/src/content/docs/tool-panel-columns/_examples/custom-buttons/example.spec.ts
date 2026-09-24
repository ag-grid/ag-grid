import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'custom buttons apply a preset layout and reset to the column definitions',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            const toolPanel = page.locator('.ag-column-select');
            await expect(toolPanel).toBeVisible();

            const headerFor = (colId: string) => agIdFor.headerCell(colId);
            const checkboxFor = (label: string) =>
                toolPanel.locator('.ag-column-select-column').filter({ hasText: label }).locator('.ag-checkbox-input');
            const headerX = async (colId: string) => (await headerFor(colId).boundingBox())!.x;

            // Initial state differs from the column definitions: Age and Year hidden,
            // the medal columns shown, and Total moved before Gold.
            await expect(headerFor('age')).toBeHidden();
            await expect(headerFor('year')).toBeHidden();
            for (const colId of ['gold', 'silver', 'bronze', 'total']) {
                await expect(headerFor(colId)).toBeVisible();
            }
            expect(await headerX('total')).toBeLessThan(await headerX('gold'));

            // Reset calls `api.resetColumnState()`, restoring the column definitions.
            await page.getByRole('button', { name: 'Reset' }).click();
            await expect(headerFor('age')).toBeVisible();
            await expect(headerFor('year')).toBeVisible();
            for (const colId of ['gold', 'silver', 'bronze']) {
                await expect(headerFor(colId)).toBeHidden();
            }
            await expect(headerFor('total')).toBeVisible();
            await expect(checkboxFor('Age')).toBeChecked();
            await expect(checkboxFor('Gold')).not.toBeChecked();

            // Sports Stats shows only the medal columns, summed and grouped by sport.
            await page.getByRole('button', { name: 'Sports Stats' }).click();
            await expect(headerFor('ag-Grid-AutoColumn')).toBeVisible();
            for (const colId of ['gold', 'silver', 'bronze']) {
                await expect(headerFor(colId)).toBeVisible();
            }
            for (const colId of ['athlete', 'age', 'country', 'year', 'sport', 'total']) {
                await expect(headerFor(colId)).toBeHidden();
            }
            await expect(headerFor('gold')).toContainText('sum(Gold)');

            // Reset again undoes it.
            await page.getByRole('button', { name: 'Reset' }).click();
            await expect(headerFor('ag-Grid-AutoColumn')).toBeHidden();
            await expect(headerFor('athlete')).toBeVisible();
            await expect(headerFor('gold')).toBeHidden();

            // A custom button does not enable deferred updates, so changes apply straight away.
            await checkboxFor('Gold').click();
            await expect(headerFor('gold')).toBeVisible();
        }
    );
});
