import type { Locator, Page } from '@playwright/test';
import { expect, expectRowIdAtIndex, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

const AUTO_COL = 'ag-Grid-AutoColumn';

type DropZone = 'above' | 'inside' | 'below';

/** Presses the mouse on a row drag handle and moves it a few pixels so the grid starts the drag. */
async function startRowDrag(page: Page, handle: Locator) {
    const box = (await handle.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 5, { steps: 5 });
}

/** Moves the dragged row over the upper quarter, the middle or the lower quarter of the target row. */
async function dragOverRow(page: Page, row: Locator, zone: DropZone) {
    const box = (await row.boundingBox())!;
    const ratio = zone === 'above' ? 0.1 : zone === 'inside' ? 0.5 : 0.9;
    await page.mouse.move(box.x + box.width / 3, box.y + box.height * ratio, { steps: 10 });
}

async function dropRow(page: Page) {
    await page.mouse.up();
    await waitForRowAnimations(page);
}

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
