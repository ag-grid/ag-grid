import { expect, test } from '@playwright/test';

test('reactive rowdata', async ({ page }) => {
    test.setTimeout(5_000);

    await page.goto('/ag-14134');

    await expect(page.getByLabel('cell-value')).toHaveText('name 1-Mission: name 1-true');
    await expect(page.getByLabel('selection-check')).toHaveText('');

    await page.getByLabel('Press Space to toggle row selection (unchecked)').click();

    await expect(page.getByLabel('cell-value')).toHaveText('name 1-Mission: name 1-true');
    await expect(page.getByLabel('selection-check')).toHaveText('true-true');
});
