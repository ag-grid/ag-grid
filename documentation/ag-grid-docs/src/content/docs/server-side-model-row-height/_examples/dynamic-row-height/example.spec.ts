import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('getRowHeight sizes SSRM rows by group depth', async ({ page }) => {
        await waitForGridContent(page);

        // Locate a group row by its displayed group value — robust to the positional
        // row-ids the SSRM assigns to group rows.
        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        const heightOf = async (locator: ReturnType<typeof groupRow>) => {
            const box = await locator.boundingBox();
            expect(box).not.toBeNull();
            return box!.height;
        };

        // Top level (level 0) is grouped by Country — getRowHeight returns 80px.
        const usRow = groupRow('United States');
        await expect(usRow).toBeVisible();
        const level0Height = await heightOf(usRow);
        expect(level0Height).toBeGreaterThan(77);
        expect(level0Height).toBeLessThan(83);

        // Expanding a country lazy-loads the second group level (Year) — getRowHeight returns 60px.
        // Year group rows are identified by a 4-digit group value (countries never are).
        await usRow.locator('.ag-group-contracted').first().click();
        const yearRow = page
            .locator('.ag-row')
            .filter({ has: page.locator('.ag-group-value', { hasText: /^\d{4}$/ }) })
            .first();
        await expect(yearRow).toBeVisible();
        const level1Height = await heightOf(yearRow);
        expect(level1Height).toBeGreaterThan(57);
        expect(level1Height).toBeLessThan(63);

        // Deeper levels are shorter than shallower ones.
        expect(level0Height).toBeGreaterThan(level1Height);
    });
});
