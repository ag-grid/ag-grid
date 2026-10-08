import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'changes apply immediately, and Reset restores the column definitions',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            const ageHeader = agIdFor.headerCell('age');
            const goldHeader = agIdFor.headerCell('gold');
            const ageCheckbox = agIdFor.columnSelectListItemCheckbox('Age Column');
            const goldCheckbox = agIdFor.columnSelectListItemCheckbox('Gold Column');

            await expect(ageHeader).toBeVisible();
            await expect(goldHeader).toBeHidden();

            // With no Apply button, changes in the tool panel are applied straight away.
            await ageCheckbox.click();
            await goldCheckbox.click();
            await expect(ageHeader).toBeHidden();
            await expect(goldHeader).toBeVisible();

            // Reset restores the visibility declared in the column definitions.
            await page.getByRole('button', { name: 'Reset' }).click();
            await expect(ageHeader).toBeVisible();
            await expect(goldHeader).toBeHidden();
            await expect(ageCheckbox).toBeChecked();
            await expect(goldCheckbox).not.toBeChecked();
        }
    );
});
