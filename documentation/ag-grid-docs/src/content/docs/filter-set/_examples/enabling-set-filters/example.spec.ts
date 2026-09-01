import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grid renders the Olympic winners data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First row of olympic-winners.json is Michael Phelps, United States, 8 golds.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
    });

    test.eachFramework('Set Filter on Country filters the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Open the Country Set Filter from its floating filter button.
        await agIdFor.floatingFilterButton('country').click();
        const setFilter = page.locator('.ag-set-filter');
        await expect(setFilter).toBeVisible();

        const itemCheckbox = (label: string) =>
            setFilter.locator('.ag-set-filter-item').filter({ hasText: label }).first().locator('.ag-checkbox-input');

        // Deselect everything, then narrow the (virtual-scrolled) list to
        // United States via the mini filter and select just that value.
        await itemCheckbox('(Select All)').click();
        await setFilter.locator('input').first().fill('United States');
        const usCheckbox = itemCheckbox('United States');
        await expect(usCheckbox).toBeVisible();
        await usCheckbox.click();

        // Close the filter popup so the grid is interactable again.
        await page.keyboard.press('Escape');

        // The grid now shows only United States rows.
        const countryCells = page.locator('.ag-row [col-id="country"][role="gridcell"]');
        await expect(countryCells.first()).toContainText('United States');
        await expect(countryCells.filter({ hasNotText: 'United States' })).toHaveCount(0);
    });
    // AG-18364: same regression, on the Set Filter popup (AC2). Its width is driven by the mini
    // filter input's gutters exactly as the Text Filter's is, so it must not track
    // `--ag-icon-size` either. The `.ag-set-filter-list { min-width: max(200px, 100%) }` floor
    // sits below the resulting width, so it does not mask the assertion.
    test.eachFramework('Set Filter popup width does not track the icon gutters', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const popup = page.locator('.ag-menu:not(.ag-tabs) .ag-filter').first();

        const openAndMeasure = async (): Promise<number> => {
            await agIdFor.floatingFilterButton('country').click();
            await expect(popup).toBeVisible();
            const box = await popup.boundingBox();
            expect(box).not.toBeNull();
            const width = box!.width;
            await page.keyboard.press('Escape');
            await expect(popup).toBeHidden();
            return width;
        };

        const baseline = await openAndMeasure();

        // Theme-coupled tolerance window - see the sibling assertion in the provided-filters spec.
        expect(baseline).toBeGreaterThan(190);
        expect(baseline).toBeLessThan(230);

        await page.addStyleTag({ content: '.ag-root-wrapper { --ag-icon-size: 40px; }' });

        const perturbed = await openAndMeasure();
        expect(Math.abs(perturbed - baseline)).toBeLessThanOrEqual(1);
    });
});
