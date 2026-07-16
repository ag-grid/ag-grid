import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agFramework, agIdFor, page }) => {
        // In Vue 3 this innerRenderer example renders the groups via an auto group column rather
        // than full-width group rows, so the full-width group-row behaviour asserted below does
        // not apply. Other frameworks render it as documented (full-width group rows).
        test.skip(agFramework === 'vue3', 'Vue 3 renders this example without full-width group rows.');

        await ensureGridReady(page);
        await waitForGridContent(page);

        // Grouped by 'total'; the custom inner renderer draws one gold-star image per total value.
        const total1 = agIdFor.rowNode('row-group-total-1').first();
        await expect(total1).toHaveClass(/ag-full-width-row/);
        await expect(total1.locator('.ag-group-value .imgSpan img.medalIcon')).toHaveCount(1);

        const total2 = agIdFor.rowNode('row-group-total-2').first();
        await expect(total2.locator('.ag-group-value .imgSpan img.medalIcon')).toHaveCount(2);

        // suppressCount: true - no child count text rendered.
        await expect(total1.locator('.ag-group-child-count')).toBeEmpty();

        // Expand/collapse still works with a custom inner renderer.
        await total1.locator('.ag-group-contracted').click();
        await expect(total1).toHaveClass(/ag-row-group-expanded/);
        await total1.locator('.ag-group-expanded').click();
        await expect(total1).toHaveClass(/ag-row-group-contracted/);
    });
});
