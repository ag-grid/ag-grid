import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom detail keyboard navigation', async ({ agIdFor, page }) => {
        // Master row '1' (Mila Smith) is expanded on first data rendered.
        await expect(agIdFor.cell('1', 'name')).toContainText('Mila Smith');

        // The custom detail renders a form populated from the master row's first call record
        // (callId 579, number "(02) 47485405", direction "Out").
        const detail = page.locator('.ag-full-width-row');
        const inputs = detail.locator('input');
        await expect(inputs).toHaveCount(3);
        await expect(inputs.nth(0)).toHaveValue('579');
        await expect(inputs.nth(1)).toHaveValue('(02) 47485405');
        await expect(inputs.nth(2)).toHaveValue('Out');

        // Focusing a cell in the master row then Tabbing forward moves focus into the custom
        // detail panel, landing on the first input (per the focus handler in the cell renderer).
        await agIdFor.cell('1', 'minutes').click();
        await page.keyboard.press('Tab');

        const activeValue = await page.evaluate(
            () => (document.activeElement as HTMLInputElement | null)?.value ?? null
        );
        expect(activeValue).toBe('579');
    });
});
