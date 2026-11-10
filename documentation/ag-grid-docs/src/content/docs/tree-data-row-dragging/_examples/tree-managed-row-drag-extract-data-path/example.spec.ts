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

type Task = { id: string; path: string[]; assignee?: string };

/** Reads the JSON the example writes into the side panel after each drop. */
async function expectExtractedData(page: Page, check: (rows: Task[]) => void) {
    const output = page.locator('#extracted-data-content');
    await expect(async () => {
        check(JSON.parse((await output.textContent()) ?? ''));
    }).toPass();
}

const pathOf = (rows: Task[], id: string) => rows.find((r) => r.id === id)?.path;

/*
 * Initial order, all groups expanded, row ids from data.ts:
 *  0: 1 Launch Website      4: 5   API Endpoints        8: 8  Testing           12: 9  Mobile App
 *  1: 2   Design Landing    5: 6     User Auth          9: 15 SEO Optimization  13: 10   UI Design
 *  2: 3   Implement Backend 6: 7     Payment Integr.
 *  3: 4     Set Up Database 7: 18  Server Deployment
 */
test.agExample(import.meta, () => {
    test.eachFramework('the output panel is empty until a row is dropped', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await expect(page.locator('#extracted-data-content')).toHaveText('output');
        await expect(agIdFor.autoGroupCell('8')).toContainText('Testing', { useInnerText: true });
        await expect(agIdFor.rowNode('8')).toHaveClass(/ag-row-level-1/);
    });

    test.eachFramework('moving a row rewrites its data path', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('8', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('9'), 'inside');
        await expect(agIdFor.rowNode('10')).toHaveClass(/ag-row-highlight-above/);
        await dropRow(page);

        await expectRowIdAtIndex(page, 12, '8');
        await expectExtractedData(page, (rows) => {
            expect(rows).toHaveLength(20);
            expect(pathOf(rows, '8')).toEqual(['Mobile App', 'Testing']);
            expect(pathOf(rows, '4')).toEqual(['Launch Website', 'Implement Backend', 'Set Up Database']);
        });
    });

    test.eachFramework('moving a parent rewrites the paths of its whole subtree', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('5', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('9'), 'inside');
        await expect(agIdFor.rowNode('10')).toHaveClass(/ag-row-highlight-above/);
        await dropRow(page);

        await expect(agIdFor.rowNode('6')).toHaveClass(/ag-row-level-2/);
        await expectExtractedData(page, (rows) => {
            expect(pathOf(rows, '5')).toEqual(['Mobile App', 'API Endpoints']);
            expect(pathOf(rows, '6')).toEqual(['Mobile App', 'API Endpoints', 'User Auth']);
            expect(pathOf(rows, '7')).toEqual(['Mobile App', 'API Endpoints', 'Payment Integration']);
        });
    });
});
