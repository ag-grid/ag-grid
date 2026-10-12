import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Dynamically added/removed Set Filter values do not receive a data-testid, so locate items by their label text.
    const filterItem = (page: any, label: string) => {
        const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return page
            .locator('.ag-filter-toolpanel .ag-set-filter-list .ag-set-filter-item')
            .filter({ has: page.locator('.ag-checkbox-label', { hasText: new RegExp(`^${escaped}$`) }) });
    };
    const filterItemCheckbox = (page: any, label: string) => filterItem(page, label).locator('input[type="checkbox"]');
    const itemAt = (page: any, position: number) =>
        page.locator(`.ag-filter-toolpanel .ag-virtual-list-item[aria-posinset="${position}"] .ag-checkbox-label`);
    const sideButton = (page: any, label: string) =>
        page.locator('.ag-side-button', { hasText: new RegExp(`^\\s*${label}\\s*$`) });
    const click = (page: any, name: string) => page.getByRole('button', { name }).click();
    // The grid's row count, less its header and floating filter rows.
    const expectRowCount = (page: any, count: number) =>
        expect(page.locator('[role="grid"][aria-rowcount]')).toHaveAttribute('aria-rowcount', String(count + 2));

    test.eachFramework('countries that leave the data keep their place and selected state', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await click(page, 'Select Algeria and Argentina');
        await expectRowCount(page, 53);

        // 2004 has no Afghanistan, Algeria or Armenia rows: each keeps its place, Algeria still selected.
        await click(page, 'Show 2004');
        await expect(itemAt(page, 2)).toHaveText('Afghanistan (not in rows)');
        await expect(itemAt(page, 3)).toHaveText('Algeria (not in rows)');
        await expect(itemAt(page, 4)).toHaveText('Argentina');
        await expect(itemAt(page, 5)).toHaveText('Armenia (not in rows)');
        await expect(filterItem(page, 'Algeria (not in rows)')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItemCheckbox(page, 'Algeria (not in rows)')).toBeChecked();
        await expect(filterItem(page, 'Afghanistan (not in rows)')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItemCheckbox(page, 'Afghanistan (not in rows)')).not.toBeChecked();
        await expect(filterItem(page, 'Argentina')).not.toHaveClass(/ag-set-filter-item-missing/);
        await expectRowCount(page, 49);
        await expect(page.locator('.ag-floating-filter input')).toHaveValue('(2) Algeria,Argentina');
        await sideButton(page, 'Filter Summaries').click();
        await expect(page.locator('.ag-filter-card-summary')).toHaveText('is (Algeria, Argentina)');
        await sideButton(page, 'Filters').click();

        // Back to 2008: Algeria's rows pass again.
        await click(page, 'Show 2008');
        await expect(itemAt(page, 3)).toHaveText('Algeria');
        await expect(filterItemCheckbox(page, 'Algeria')).toBeChecked();
        await expectRowCount(page, 53);
    });

    test.eachFramework(
        'Clear Preserved Values drops countries not in the data, and from the model',
        async ({ page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            await click(page, 'Select Algeria and Argentina');
            await click(page, 'Show 2004');
            await expect(filterItem(page, 'Algeria (not in rows)')).toHaveCount(1);
            await click(page, 'Clear Preserved Values');
            await expect(itemAt(page, 2)).toHaveText('Argentina');
            await expect(filterItem(page, 'Afghanistan (not in rows)')).toHaveCount(0);
            await expect(filterItem(page, 'Algeria (not in rows)')).toHaveCount(0);
            await expect(filterItem(page, 'Armenia (not in rows)')).toHaveCount(0);

            // Had Algeria stayed in the model, its rows would pass again once they return.
            await click(page, 'Show 2008');
            await expect(filterItemCheckbox(page, 'Algeria')).not.toBeChecked();
            await expectRowCount(page, 51);
        }
    );
});
