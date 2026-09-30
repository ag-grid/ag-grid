import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

/** Returns col-ids of the centre header cells, ordered by aria-colindex. */
async function getHeaderColIds(page: import('playwright/test').Page) {
    return page.evaluate(() => {
        const cells = document.querySelectorAll('.ag-header-row .ag-header-cell');
        return Array.from(cells)
            .sort(
                (a, b) =>
                    parseInt(a.getAttribute('aria-colindex') || '0') - parseInt(b.getAttribute('aria-colindex') || '0')
            )
            .map((c) => c.getAttribute('col-id'));
    });
}

test.agExample(import.meta, () => {
    test.eachFramework(
        'changes apply immediately, and Reset restores the column definitions',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            const ageHeader = agIdFor.headerCell('age');
            const goldHeader = agIdFor.headerCell('gold');
            const ageCheckbox = agIdFor.columnSelectListItemCheckbox('Age Column');
            const goldCheckbox = agIdFor.columnSelectListItemCheckbox('Gold Column');

            await expect(ageHeader).toBeVisible();
            await expect(goldHeader).toBeHidden();

            // With no Apply button, changes in the tool panel are applied straight away.
            await ageCheckbox.click();
            await goldCheckbox.click();
            await expect(ageHeader).toBeHidden();
            await expect(goldHeader).toBeVisible();

            // Reset restores the visibility declared in the column definitions.
            await page.getByRole('button', { name: 'Reset' }).click();
            await expect(ageHeader).toBeVisible();
            await expect(goldHeader).toBeHidden();
            await expect(ageCheckbox).toBeChecked();
            await expect(goldCheckbox).not.toBeChecked();
        }
    );

    test.eachFramework('custom buttons apply their column layouts', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const initialColIds = ['ag-Grid-AutoColumn', 'athlete', 'age', 'country', 'year', 'sport', 'total'];
        const medalColIds = ['ag-Grid-AutoColumn', 'total', 'gold', 'silver', 'bronze'];
        const swimmingGroup = agIdFor.autoGroupCell('row-group-sport-Swimming');
        const unitedStatesGroup = agIdFor.autoGroupCell('row-group-country-United States');

        await expect.poll(() => getHeaderColIds(page)).toEqual(initialColIds);

        await page.getByRole('button', { name: 'By Sport' }).click();
        await expect.poll(() => getHeaderColIds(page)).toEqual(medalColIds);
        await expect(swimmingGroup).toContainText('Swimming', { useInnerText: true });

        // Switching layout replaces the Sport grouping rather than adding to it.
        await page.getByRole('button', { name: 'By Country' }).click();
        await expect.poll(() => getHeaderColIds(page)).toEqual(medalColIds);
        await expect(unitedStatesGroup).toContainText('United States', { useInnerText: true });
        await expect(swimmingGroup).toHaveCount(0);

        await page.getByRole('button', { name: 'Reset' }).click();
        await expect.poll(() => getHeaderColIds(page)).toEqual(initialColIds);
    });
});
