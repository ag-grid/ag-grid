import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('whenTruncated shows tooltips only for truncated content', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const tooltip = page.locator('.ag-tooltip');

        // Positive: the Country column is only 100px wide, so its "Country of Athlete"
        // header is truncated and a tooltip is shown under tooltipShowMode='whenTruncated'.
        await agIdFor.headerCell('country').hover();
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('Country of Athlete');

        // Move away and let the tooltip hide before the negative case.
        await page.mouse.move(0, 0);
        await expect(tooltip).toHaveCount(0);

        // Negative: whenTruncated must NOT show a tooltip when the content fits. Find a
        // country cell whose text is not truncated (scrollWidth <= clientWidth) and assert
        // no tooltip appears — an always-on grid would show one here and fail the test.
        const countryCells = page.locator('.ag-cell[col-id="country"]');
        const count = await countryCells.count();
        let untruncatedIndex = -1;
        for (let i = 0; i < count; i++) {
            const isTruncated = await countryCells.nth(i).evaluate((el) => {
                const value = (el.querySelector('.ag-cell-value') as HTMLElement) ?? (el as HTMLElement);
                return value.scrollWidth > value.clientWidth + 1;
            });
            if (!isTruncated) {
                untruncatedIndex = i;
                break;
            }
        }
        expect(untruncatedIndex).toBeGreaterThanOrEqual(0);

        await countryCells.nth(untruncatedIndex).hover();
        await page.waitForTimeout(900); // past tooltipShowDelay (500ms)
        await expect(tooltip).toHaveCount(0);
    });
});
