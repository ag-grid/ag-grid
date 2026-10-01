import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // The checkbox sits inside its <label>, and WebKit turns a direct click on the input into two
    // activations (its own, plus the one the label forwards), leaving the state unchanged. Clicking
    // the label toggles it exactly once on every browser.
    const untickReadOnly = async (page: any) => {
        await page.locator('label', { hasText: 'Functions Read Only' }).click();
        await expect(page.locator('#read-only')).not.toBeChecked();
    };

    test.eachFramework(
        'functionsReadOnly prevents editing group / values / pivot via the GUI',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            // Grid starts read-only (checkbox ticked via onGridReady) and the Columns Tool Panel is present.
            await expect(page.locator('#read-only')).toBeChecked();
            await expect(page.locator('.ag-column-select')).toBeVisible();

            // The group / pivot / values panels display the configured columns.
            const rowGroups = agIdFor.columnDropArea('toolbar', 'Row Groups');
            const values = agIdFor.columnDropArea('toolbar', 'Values');
            const columnLabels = agIdFor.columnDropArea('toolbar', 'Column Labels');
            await expect(rowGroups.locator('.ag-column-drop-cell')).toHaveCount(2); // country, sport
            await expect(values.locator('.ag-column-drop-cell')).toHaveCount(2); // sum(silver), sum(bronze)
            await expect(columnLabels.locator('.ag-column-drop-cell')).toHaveCount(1); // year

            // While read-only, the remove ('cancel') buttons on the pills are hidden — no GUI edits allowed.
            await expect(page.locator('.ag-column-drop-cell-button:visible')).toHaveCount(0);

            // Unticking 'Functions Read Only' re-enables editing: the remove buttons become visible.
            await untickReadOnly(page);
            await expect(rowGroups.locator('.ag-column-drop-cell-button').first()).toBeVisible();
        }
    );

    // The read-only and interactive halves are separate tests on purpose: a right-click raises
    // WebKit's own context menu, which Playwright cannot see or dismiss and which swallows every
    // later click in that page. A fresh page per half keeps the toggle clickable.
    const athleteRowIn = (page: any) => page.locator('.ag-column-select-column', { hasText: 'Athlete' });
    // While read-only the row carries 'ag-column-select-column-readonly' (pointer-events: none), so
    // the hit target is the enclosing virtual list item rather than the column row itself.
    const athleteListItemIn = (page: any) =>
        page.locator('.ag-column-select-virtual-list-item', { hasText: 'Athlete' });

    test.eachFramework(
        'functionsReadOnly hides the rowGroup / value / pivot context menu items',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);
            await expect(page.locator('#read-only')).toBeChecked();
            await expect(athleteRowIn(page)).toHaveClass(/ag-column-select-column-readonly/);

            // The state-changing items are dropped and (in pivot mode) 'Scroll into View' is not
            // applicable either, so right-clicking shows no menu at all.
            await athleteListItemIn(page).click({ button: 'right' });
            await expect(agIdFor.menuOption('Group by Athlete')).toHaveCount(0);
            await expect(agIdFor.menuOption('Add Athlete to labels')).toHaveCount(0);
            await expect(agIdFor.menu()).toHaveCount(0);
        }
    );

    test.eachFramework(
        'unticking functionsReadOnly brings the grouping / pivot context menu items back',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);
            await expect(page.locator('#read-only')).toBeChecked();

            await untickReadOnly(page);
            await expect(athleteRowIn(page)).not.toHaveClass(/ag-column-select-column-readonly/);

            await athleteRowIn(page).click({ button: 'right' });
            await expect(agIdFor.menu()).toBeVisible();
            await expect(agIdFor.menuOption('Group by Athlete')).toBeVisible();
            await expect(agIdFor.menuOption('Add Athlete to labels')).toBeVisible();
        }
    );

    test.eachFramework(
        'functionsReadOnly makes selecting a grouped column in the Columns section a no-op',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);
            await expect(page.locator('#read-only')).toBeChecked();

            const rowGroups = agIdFor.columnDropArea('toolbar', 'Row Groups');
            await expect(rowGroups.locator('.ag-column-drop-cell')).toHaveCount(2); // country, sport
            await expect(rowGroups).toContainText('Country');

            // While read-only the checkbox itself is disabled, and the whole row is marked
            // 'ag-column-select-column-readonly' (pointer-events: none) so nothing in it is clickable.
            const countryRow = page.locator('.ag-column-select-column', { hasText: 'Country' });
            await expect(agIdFor.columnSelectListItemCheckbox('Country Column')).toBeDisabled();
            await expect(countryRow).toHaveClass(/ag-column-select-column-readonly/);

            // Clicking where the row is lands on the enclosing virtual list item, and dispatching a
            // click straight at the label hits the handler's read-only guard. Either way it is a
            // no-op, so 'Country' stays in the Row Groups section.
            await page.locator('.ag-column-select-virtual-list-item', { hasText: 'Country' }).click();
            await countryRow.locator('.ag-column-select-column-label').dispatchEvent('click');

            await expect(rowGroups.locator('.ag-column-drop-cell')).toHaveCount(2);
            await expect(rowGroups).toContainText('Country');
            await expect(agIdFor.columnSelectListItemCheckbox('Country Column')).toBeChecked();
        }
    );
});
