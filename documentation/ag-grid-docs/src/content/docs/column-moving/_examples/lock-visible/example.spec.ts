import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

/** Locates a column's checkbox in the columns tool panel by its label text. */
function toolPanelCheckbox(page: import('playwright/test').Page, label: string) {
    return page
        .locator('.ag-column-select-column')
        .filter({ has: page.locator('.ag-column-select-column-label', { hasText: new RegExp(`^${label}$`) }) })
        .locator('.ag-checkbox-input')
        .first();
}

test.agExample(import.meta, () => {
    test.eachFramework('grid renders with locked-visible columns and hidden total', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');

        // The total column is hidden via colDef and stays hidden.
        await expect(agIdFor.headerCell('total')).toBeHidden();
    });

    test.eachFramework('non-locked column can be hidden from the tool panel', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        // Open the columns tool panel.
        await page.locator('.ag-side-button').first().click();

        await expect(agIdFor.headerCell('sport')).toBeVisible();

        // sport is not lockVisible, so unchecking it hides the column.
        await toolPanelCheckbox(page, 'Sport').click();
        await expect(agIdFor.headerCell('sport')).toBeHidden();

        // Re-checking shows it again.
        await toolPanelCheckbox(page, 'Sport').click();
        await expect(agIdFor.headerCell('sport')).toBeVisible();
    });

    test.eachFramework('locked-visible column cannot be hidden from the tool panel', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        await page.locator('.ag-side-button').first().click();

        await expect(agIdFor.headerCell('age')).toBeVisible();

        // age is lockVisible: its tool panel checkbox is disabled so it cannot be hidden via the UI.
        await expect(toolPanelCheckbox(page, 'Age')).toBeDisabled();
        // A non-locked column (Sport) remains toggleable.
        await expect(toolPanelCheckbox(page, 'Sport')).toBeEnabled();
        await expect(agIdFor.headerCell('age')).toBeVisible();
    });
});
