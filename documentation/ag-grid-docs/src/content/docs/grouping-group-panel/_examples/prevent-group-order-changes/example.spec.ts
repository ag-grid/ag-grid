import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        const rowGroupsArea = agIdFor.columnDropArea('panel', 'Row Groups');
        const pills = rowGroupsArea.locator('.ag-column-drop-cell');

        // Both initial row group columns show as pills.
        await expect(pills).toHaveCount(2);
        await expect(rowGroupsArea.getByText('Country', { exact: true })).toBeVisible();
        await expect(rowGroupsArea.getByText('Year', { exact: true })).toBeVisible();

        // `groupLockGroupColumns: -1` locks every pill, so the remove (X) button is not shown.
        const removeButtons = pills.locator('.ag-column-drop-cell-button');
        const count = await removeButtons.count();
        for (let i = 0; i < count; i++) {
            await expect(removeButtons.nth(i)).toBeHidden();
        }

        // The drag handles carry the readonly class so the pills cannot be dragged out of the
        // panel, and are dimmed to show as disabled even though no tool panel is loaded.
        const dragHandles = pills.locator('.ag-column-drop-cell-drag-handle');
        const handleCount = await dragHandles.count();
        for (let i = 0; i < handleCount; i++) {
            const handle = dragHandles.nth(i);
            await expect(handle).toHaveClass(/ag-column-select-column-readonly/);
            await expect(handle).toHaveCSS('opacity', '0.5');
            await expect(handle.locator('.ag-icon')).toHaveCSS('opacity', '0.35');
        }
    });
});
