import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

const usa = 'row-group-country-United States';
const usaSportPrefix = 'row-group-country-United States-sport-';

test.agExample(import.meta, () => {
    test.eachFramework("groupSelects 'self' selects only the group, not its descendants", async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        // Default mode is 'self'. Expand the United States group to reveal its sport sub-groups.
        await agIdFor.autoGroupContracted(usa).first().click();
        const firstSport = page.locator(`.ag-row[row-id^="${usaSportPrefix}"]`).first();
        await expect(firstSport).toBeVisible();

        // Select the country group via its selection-column checkbox.
        await agIdFor.selectionColumnCheckbox(usa).first().click();

        // The group row is selected but the descendant sub-group is not.
        await expect(agIdFor.rowNode(usa).first()).toHaveClass(/ag-row-selected/);
        await expect(firstSport).not.toHaveClass(/ag-row-selected/);
    });

    test.eachFramework(
        "groupSelects 'descendants' selects the group and all descendants",
        async ({ page, agIdFor }) => {
            await waitForGridContent(page);

            // Switch the group-selection mode to 'descendants' via the dropdown.
            await page.locator('#input-group-selection-mode').selectOption('descendants');

            // Expand the United States group to reveal (and later assert on) its descendants.
            await agIdFor.autoGroupContracted(usa).first().click();
            const firstSport = page.locator(`.ag-row[row-id^="${usaSportPrefix}"]`).first();
            await expect(firstSport).toBeVisible();

            // Selecting the country group now cascades selection to its descendant sub-groups.
            await agIdFor.selectionColumnCheckbox(usa).first().click();
            await expect(agIdFor.rowNode(usa).first()).toHaveClass(/ag-row-selected/);
            await expect(firstSport).toHaveClass(/ag-row-selected/);
        }
    );
});
