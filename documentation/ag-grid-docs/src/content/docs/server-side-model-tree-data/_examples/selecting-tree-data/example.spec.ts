import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Group selection cascades to descendants and shows indeterminate state', async ({ page }) => {
        await waitForGridContent(page);

        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Default-open path exposes Mabel Ward (level 1) and her loaded children.
        await expect(groupRow('Mabel Ward')).toBeVisible();
        await expect(groupRow('Bryan Butler')).toBeVisible();

        // Selecting the group cascades selection to all loaded descendants (groupSelects: 'descendants').
        await groupRow('Mabel Ward').locator('.ag-selection-checkbox .ag-checkbox-input').click();
        await expect(groupRow('Mabel Ward')).toHaveClass(/ag-row-selected/);
        await expect(groupRow('Bryan Butler')).toHaveClass(/ag-row-selected/);
        await expect(groupRow('Pauline Nash')).toHaveClass(/ag-row-selected/);

        // Deselecting a single descendant makes the parent partially selected (indeterminate).
        await groupRow('Bryan Butler').locator('.ag-selection-checkbox .ag-checkbox-input').click();
        await expect(groupRow('Bryan Butler')).not.toHaveClass(/ag-row-selected/);
        await expect(groupRow('Mabel Ward').locator('.ag-selection-checkbox .ag-checkbox-input-wrapper')).toHaveClass(
            /ag-indeterminate/
        );
    });
});
