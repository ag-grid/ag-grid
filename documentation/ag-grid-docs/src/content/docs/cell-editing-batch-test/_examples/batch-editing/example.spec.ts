import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const FIRST_NAME_GROUP = 'ag-Grid-AutoColumn-firstName';

test.agExample(import.meta, () => {
    test.eachFramework('Grouped and pinned rows render the expected data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // isRowPinning pins the Jane Wilson row to the top of the grid.
        const pinnedTop = agIdFor.rowNode('t-top-1');
        await expect(pinnedTop).toContainText('Jane');
        await expect(pinnedTop).toContainText('Wilson');

        // firstName is grouped; Bob has 8 leaf rows in the source data.
        await expect(agIdFor.cell('row-group-firstName-Bob', FIRST_NAME_GROUP)).toContainText('Bob (8)', {
            useInnerText: true,
        });
        // The gender sub-group under Bob (all Male).
        await expect(agIdFor.cell('row-group-firstName-Bob-gender-Male', 'ag-Grid-AutoColumn-gender')).toContainText(
            'Male (8)',
            { useInnerText: true }
        );
    });

    test.eachFramework('Collapsing a group hides its leaf rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Groups are expanded by default (groupDefaultExpanded: 2), so leaf row 0 is visible.
        await expect(agIdFor.cell('0', 'lastName')).toContainText('Harrison');

        // Collapse the Bob first-name group.
        await agIdFor.groupExpanded('row-group-firstName-Bob', FIRST_NAME_GROUP).click();
        await expect(agIdFor.cell('0', 'lastName')).not.toBeVisible();

        // Expand again and the leaf reappears.
        await agIdFor.groupContracted('row-group-firstName-Bob', FIRST_NAME_GROUP).click();
        await expect(agIdFor.cell('0', 'lastName')).toContainText('Harrison');
    });

    test.eachFramework('Double-clicking an editable cell opens an inline editor', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-cell-inline-editing')).toHaveCount(0);

        // lastName is editable via the defaultColDef.
        await agIdFor.cell('0', 'lastName').dblclick();

        await expect(page.locator('.ag-cell-inline-editing')).toBeVisible();
    });
});
