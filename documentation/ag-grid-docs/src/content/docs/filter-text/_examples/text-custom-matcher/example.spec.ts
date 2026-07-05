import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('textMatcher resolves the "usa" alias to United States', async ({ page, agIdFor }) => {
        await agIdFor.headerFilterButton('country').click();
        const filterInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await expect(filterInput).toBeVisible();
        await filterInput.fill('usa');

        await expect(page.locator('[row-index="0"] [col-id="country"]').first()).toContainText('United States');
    });

    test.eachFramework('textMatcher resolves the "holland" alias to Netherlands', async ({ page, agIdFor }) => {
        await agIdFor.headerFilterButton('country').click();
        const filterInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await expect(filterInput).toBeVisible();
        await filterInput.fill('holland');

        await expect(page.locator('[row-index="0"] [col-id="country"]').first()).toContainText('Netherlands');
    });
});
