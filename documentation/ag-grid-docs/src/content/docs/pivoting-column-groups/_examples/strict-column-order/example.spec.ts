import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Wait until pivot groups for both `before` and `after` values are rendered and `before` sits to the
    // LEFT of `after`. Header group cells are absolutely positioned, so visual order is read from their
    // `left` offset. Returns once the ordering holds; times out (failing the test) if it never does.
    const waitForLeftToRightOrder = (page: import('@playwright/test').Page, before: number, after: number) =>
        page.waitForFunction(
            ([b, a]) => {
                const parsed = Array.from(
                    document.querySelectorAll('.ag-header-group-cell[col-id^="pivotGroup_pivotValue_"]')
                )
                    .map((e) => {
                        const match = e.getAttribute('col-id')!.match(/^pivotGroup_pivotValue_(\d+)_0$/);
                        return { value: match ? Number(match[1]) : NaN, left: e.getBoundingClientRect().left };
                    })
                    .filter((p) => !Number.isNaN(p.value));
                const beforeEntry = parsed.find((p) => p.value === b);
                const afterEntry = parsed.find((p) => p.value === a);
                if (!beforeEntry || !afterEntry) {
                    return false;
                }
                return beforeEntry.left < afterEntry.left;
            },
            [before, after] as [number, number],
            { timeout: 15000 }
        );

    test.eachFramework(
        'enableStrictPivotColumnOrder re-sorts generated pivot columns instead of appending them',
        async ({ page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // The data set changes every second, appending rows in the source order 6,1,3,2,5,4. Each unique
            // pivotValue produces a pivot column group.
            const pivotGroups = page.locator('.ag-header-group-cell[col-id^="pivotGroup_pivotValue_"]');
            await expect(pivotGroups.first()).toBeVisible();

            // Default (enableStrictPivotColumnOrder = false): columns are APPENDED in first-appearance order,
            // so value 6 (appended before value 1) renders to the left of value 1.
            const checkbox = page.locator('#enableStrictPivotColumnOrder');
            await expect(checkbox).not.toBeChecked();
            await waitForLeftToRightOrder(page, 6, 1);

            // Enabling the option re-sorts all generated columns alphanumerically, so value 1 now renders to
            // the left of value 6 - the opposite of the append order, proving the re-sort actually happens.
            await checkbox.click();
            await expect(checkbox).toBeChecked();
            await waitForLeftToRightOrder(page, 1, 6);
        }
    );
});
