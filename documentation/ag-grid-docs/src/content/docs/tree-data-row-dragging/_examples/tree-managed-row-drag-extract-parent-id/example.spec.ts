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

type Task = { id: string; parentId?: string; title: string; assignee?: string };

/** Reads the JSON the example writes into the side panel after each drop. */
async function expectExtractedData(page: Page, check: (rows: Task[]) => void) {
    const output = page.locator('#extracted-data-content');
    await expect(async () => {
        check(JSON.parse((await output.textContent()) ?? ''));
    }).toPass();
}

/*
 * Initial order, all groups expanded, row ids from data.ts:
 *  0: 1 Launch Website  ...  8: 8 Testing   9: 15 SEO Optimization   12: 9 Mobile App   13: 10 UI Design
 */
test.agExample(import.meta, () => {
    test.eachFramework('the output panel is empty until a row is dropped', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await expect(page.locator('#extracted-data-content')).toHaveText('output');
        await expect(agIdFor.autoGroupCell('8')).toContainText('Testing', { useInnerText: true });
        await expect(agIdFor.rowNode('8')).toHaveClass(/ag-row-level-1/);
    });

    test.eachFramework('moving a row into a new parent updates its parentId', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('8', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('9'), 'inside');
        await expect(agIdFor.rowNode('10')).toHaveClass(/ag-row-highlight-above/);
        await dropRow(page);

        await expectRowIdAtIndex(page, 12, '8');
        await expectExtractedData(page, (rows) => {
            expect(rows).toHaveLength(20);
            expect(rows.find((r) => r.id === '8')).toEqual({
                id: '8',
                parentId: '9',
                title: 'Testing',
                assignee: 'Heidi',
            });
            // Rows that did not move keep their original parentId
            expect(rows.find((r) => r.id === '4')).toEqual({
                id: '4',
                parentId: '3',
                title: 'Set Up Database',
                assignee: 'David',
            });
        });
    });

    test.eachFramework('moving a row to the root level clears its parentId', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('8', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('9'), 'above');
        await expect(agIdFor.rowNode('9')).toHaveClass(/ag-row-highlight-above/);
        await dropRow(page);

        await expect(agIdFor.rowNode('8')).toHaveClass(/ag-row-level-0/);
        await expectExtractedData(page, (rows) => {
            expect(rows.find((r) => r.id === '8')).toEqual({ id: '8', title: 'Testing', assignee: 'Heidi' });
        });
    });
});
