import type { Page } from '@playwright/test';
import {
    dragOverRow,
    dropRow,
    expect,
    expectRowIdAtIndex,
    startRowDrag,
    test,
    waitForGridContent,
} from '@utils/grid/test-utils';

const AUTO_COL = 'ag-Grid-AutoColumn';

/** Filler nodes have generated row ids, so find them by their exact group text. */
const fillerRow = (page: Page, name: string) =>
    page.locator('.ag-row').filter({
        has: page.locator('.ag-group-value', { hasText: new RegExp(`^${name}$`) }),
    });

/*
 * Initial order, all groups expanded, row ids from data.ts (F = filler node, no data entry):
 *  0: 1  Launch Website          8: 5        User Auth
 *  1: 2    Design Landing Page   9: 6        Payment Integration
 *  2: F      Mobile             10: 11     Server Deployment
 *  3: 20       Wireframes       11: 7    Testing
 *  4: 21       Mockups          12: 8    SEO Optimization
 *  5: F    Implement Backend    13: 9      Keyword Research
 *  6: 3      Set Up Database    14: 10     On-Page SEO
 *  7: 4      API Endpoints      15: 12 Mobile App
 */
test.agExample(import.meta, () => {
    test.eachFramework('renders the getDataPath tree with filler nodes', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await expect(agIdFor.autoGroupCell('1')).toContainText('Launch Website', { useInnerText: true });
        await expect(fillerRow(page, 'Mobile')).toHaveClass(/ag-row-level-2/);
        await expect(fillerRow(page, 'Implement Backend')).toHaveClass(/ag-row-level-1/);
        await expectRowIdAtIndex(page, 3, '20');
        await expectRowIdAtIndex(page, 4, '21');
        await expect(agIdFor.cell('20', 'assignee')).toContainText('Fay');
    });

    test.eachFramework('dropping in the middle of a parent moves the row into it', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('7', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('8'), 'inside');
        // Over an expanded parent, the drop is shown as an insert above its first child
        await expect(agIdFor.rowNode('9')).toHaveClass(/ag-row-highlight-above/);
        await dropRow(page);

        // Testing becomes the first child of SEO Optimization
        await expectRowIdAtIndex(page, 11, '8');
        await expectRowIdAtIndex(page, 12, '7');
        await expectRowIdAtIndex(page, 13, '9');
        await expect(agIdFor.rowNode('7')).toHaveClass(/ag-row-level-2/);
    });

    test.eachFramework('dropping on the upper part of a row reorders above it', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('7', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('2'), 'above');
        await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-highlight-above/);
        await dropRow(page);

        await expectRowIdAtIndex(page, 1, '7');
        await expectRowIdAtIndex(page, 2, '2');
        await expect(agIdFor.rowNode('7')).toHaveClass(/ag-row-level-1/);
    });

    test.eachFramework('a filler node disappears once all its children are moved out', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await expect(fillerRow(page, 'Mobile')).toHaveCount(1);

        await startRowDrag(page, agIdFor.dragHandle('20', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('7'), 'above');
        await expect(agIdFor.rowNode('7')).toHaveClass(/ag-row-highlight-above/);
        await dropRow(page);

        // Mockups is still inside the filler, so it remains
        await expect(fillerRow(page, 'Mobile')).toHaveCount(1);
        await expect(agIdFor.rowNode('20')).toHaveClass(/ag-row-level-1/);

        await startRowDrag(page, agIdFor.dragHandle('21', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('7'), 'above');
        await expect(agIdFor.rowNode('7')).toHaveClass(/ag-row-highlight-above/);
        await dropRow(page);

        await expect(fillerRow(page, 'Mobile')).toHaveCount(0);
        await expect(agIdFor.rowNode('21')).toHaveClass(/ag-row-level-1/);
        // Design Landing Page has lost its only child and is a leaf again
        await expect(agIdFor.autoGroupExpanded('2')).not.toBeVisible();
    });
});
