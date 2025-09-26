import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.reactFunctionalTs('Example', async ({ page, agIdFor }) => {
        // set the viewport size to ensure that vertical scrollbars are present
        await page.setViewportSize({ width: 800, height: 300 });

        // focus the first cell
        await expect(agIdFor.cell('0', 'make')).toBeVisible();

        // click the Destroy button
        await page.getByRole('button', { name: 'Destroy' }).click();

        // test needs to wait for a second to allow the cleanup to complete
        await page.waitForTimeout(500);
    });

    test.reactFunctionalTs_Dev('Example DEV', async ({ page, agIdFor }) => {
        // set the viewport size to ensure that vertical scrollbars are present
        await page.setViewportSize({ width: 800, height: 300 });

        await expect(agIdFor.cell('0', 'make')).toBeVisible();

        // click the Destroy button
        await page.getByRole('button', { name: 'Destroy' }).click();

        // test needs to wait for a second to allow the cleanup to complete
        await page.waitForTimeout(500);
    });
});
