import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        const rowGroupsArea = agIdFor.columnDropArea('panel', 'Row Groups');
        const countryPill = rowGroupsArea.locator('.ag-column-drop-cell').filter({ hasText: 'Country' }).first();
        const yearPill = rowGroupsArea.locator('.ag-column-drop-cell').filter({ hasText: 'Year' }).first();
        const suppressSortCheckbox = page.locator('#rowGroupPanelSuppressSort');

        // The pill's sort direction is exposed via its aria-label
        // (e.g. "Country, ascending. Press ENTER to sort. Press DELETE to remove").
        const countryLabel = async () => (await countryPill.getAttribute('aria-label')) ?? '';
        const yearLabel = async () => (await yearPill.getAttribute('aria-label')) ?? '';

        // Sort is enabled by default — clicking the Country pill cycles Country's sort
        // and the direction appears in the aria-label.
        const countryLabelBefore = await countryLabel();
        await countryPill.click();
        const countryLabelAfter = await countryLabel();
        expect(countryLabelAfter).not.toBe(countryLabelBefore);

        // Enable `rowGroupPanelSuppressSort`; clicking a pill must now be a no-op.
        await suppressSortCheckbox.check();
        const yearLabelBefore = await yearLabel();
        await yearPill.click();
        const yearLabelAfter = await yearLabel();
        expect(yearLabelAfter).toBe(yearLabelBefore);
    });
});
