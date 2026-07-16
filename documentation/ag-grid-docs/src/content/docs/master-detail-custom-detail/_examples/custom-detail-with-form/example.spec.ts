import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom detail cell renderer with form', async ({ agIdFor, page }) => {
        // Master row '1' (Mila Smith) is expanded on first data rendered.
        await expect(agIdFor.cell('1', 'name')).toContainText('Mila Smith');

        // The custom detail renders a form (not a grid) populated from the master
        // row's first call record (callId 579, number "(02) 47485405", direction "Out").
        // Some frameworks pre-render every detail row (all but the expanded one are hidden),
        // so scope to the expanded master row '1' detail row explicitly.
        const detail = page.getByTestId('ag-row:row-id=detail_1');
        await expect(detail).toContainText('Call Id:');
        await expect(detail).toContainText('Number:');
        await expect(detail).toContainText('Direction:');

        const inputs = detail.locator('input');
        await expect(inputs).toHaveCount(3);
        await expect(inputs.nth(0)).toHaveValue('579');
        await expect(inputs.nth(1)).toHaveValue('(02) 47485405');
        await expect(inputs.nth(2)).toHaveValue('Out');
    });
});
