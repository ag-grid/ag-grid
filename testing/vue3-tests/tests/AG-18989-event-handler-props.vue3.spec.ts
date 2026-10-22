import { expect, test } from '@playwright/test';

test('an event handler prop replaced or removed after mount takes effect', async ({ page }) => {
    await page.goto('/ag-18989');
    const callsA = page.getByTestId('calls-a');
    const callsB = page.getByTestId('calls-b');
    const apiCalls = page.getByTestId('api-calls');
    const updateRows = async () => {
        const apiCallsBefore = Number(await apiCalls.textContent());
        await page.getByRole('button', { name: 'Update rows' }).click();
        await expect(apiCalls).toHaveText(String(apiCallsBefore + 1));
    };
    await expect(page.locator('[col-id="price"].ag-cell').first()).toHaveText('1');

    await updateRows();
    const callsAWhileBound = await callsA.textContent();

    await page.getByRole('button', { name: 'Replace handler' }).click();
    await updateRows();
    await expect(callsB).toHaveText('1');
    await expect(callsA).toHaveText(callsAWhileBound!);

    await page.getByRole('button', { name: 'Remove handler' }).click();
    await updateRows();
    await expect(callsB).toHaveText('1');
    await expect(callsA).toHaveText(callsAWhileBound!);
});
