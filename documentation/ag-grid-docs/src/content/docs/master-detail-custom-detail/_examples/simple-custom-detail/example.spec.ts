import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Simple custom detail cell renderer', async ({ agIdFor, page }) => {
        // Master row '1' (Mila Smith) is expanded on first data rendered.
        await expect(agIdFor.cell('1', 'name')).toContainText('Mila Smith');

        // The custom detail cell renderer shows the "My Custom Detail" message
        // where the default detail grid would normally appear.
        const detail = page.locator('.ag-full-width-row');
        await expect(detail).toContainText('My Custom Detail');

        // Collapsing the master row removes the custom detail.
        await agIdFor.groupExpanded('1', 'name').click();
        await expect(detail).toHaveCount(0);

        // Re-expanding renders the custom detail again.
        await agIdFor.groupContracted('1', 'name').click();
        await expect(page.locator('.ag-full-width-row')).toContainText('My Custom Detail');
    });
});
