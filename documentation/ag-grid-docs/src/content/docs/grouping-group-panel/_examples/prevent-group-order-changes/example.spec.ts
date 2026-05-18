import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        const rowGroupsArea = agIdFor.columnDropArea('panel', 'Row Groups');
        const pills = rowGroupsArea.locator('.ag-column-drop-cell');

        // Both initial row group columns show as pills.
        await expect(pills).toHaveCount(2);
        await expect(rowGroupsArea.getByText('Country', { exact: true })).toBeVisible();
        await expect(rowGroupsArea.getByText('Year', { exact: true })).toBeVisible();

        // `groupLockGroupColumns: -1` locks every pill — the remove (X) button must not
        // be shown, and the drag handle carries the readonly class so the pill cannot be
        // dragged out of the panel.
        const removeButtons = pills.locator('.ag-column-drop-cell-button');
        const count = await removeButtons.count();
        for (let i = 0; i < count; i++) {
            await expect(removeButtons.nth(i)).toBeHidden();
        }

        const dragHandles = pills.locator('.ag-column-drop-cell-drag-handle');
        await expect(dragHandles.first()).toHaveClass(/ag-column-select-column-readonly/);
        await expect(dragHandles.last()).toHaveClass(/ag-column-select-column-readonly/);
    });
});
