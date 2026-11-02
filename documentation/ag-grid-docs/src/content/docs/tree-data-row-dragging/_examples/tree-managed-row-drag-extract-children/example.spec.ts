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

type Task = { id: string; title: string; assignee?: string; children?: Task[] };

/** Reads the JSON the example writes into the side panel after each drop. */
async function expectExtractedData(page: Page, check: (rows: Task[]) => void) {
    const output = page.locator('#extracted-data-content');
    await expect(async () => {
        check(JSON.parse((await output.textContent()) ?? ''));
    }).toPass();
}

const childIds = (task: Task | undefined) => task?.children?.map((child) => child.id);

/*
 * Initial order, all groups expanded, row ids from data.ts (children arrays):
 *  0: 1 Launch Website  ...  8: 8 Testing   9: 15 SEO Optimization   12: 9 Mobile App   13: 10 UI Design
 */
test.agExample(import.meta, () => {
    test.eachFramework('the output panel is empty until a row is dropped', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await expect(page.locator('#extracted-data-content')).toHaveText('output');
        await expect(agIdFor.autoGroupCell('8')).toContainText('Testing', { useInnerText: true });
        await expect(agIdFor.rowNode('8')).toHaveClass(/ag-row-level-1/);
    });

    test.eachFramework('moving a row rebuilds the children arrays', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('8', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('9'), 'inside');
        await expect(agIdFor.rowNode('10')).toHaveClass(/ag-row-highlight-above/);
        await dropRow(page);

        await expectRowIdAtIndex(page, 12, '8');
        await expectExtractedData(page, (roots) => {
            expect(roots.map((r) => r.id)).toEqual(['1', '9', '12']);
            expect(childIds(roots[0])).toEqual(['2', '3', '15']);
            expect(childIds(roots[1])).toEqual(['8', '10', '11', '19']);
            expect(roots[1].children![0]).toEqual({ id: '8', title: 'Testing', assignee: 'Heidi' });
            // Unchanged subtrees are kept as they were
            expect(childIds(roots[0].children![1])).toEqual(['4', '5', '18']);
        });
    });

    test.eachFramework('reordering within a parent changes the children order', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('11', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('10'), 'above');
        await expect(agIdFor.rowNode('10')).toHaveClass(/ag-row-highlight-above/);
        await dropRow(page);

        await expectRowIdAtIndex(page, 13, '11');
        await expectExtractedData(page, (roots) => {
            expect(childIds(roots[1])).toEqual(['11', '10', '19']);
        });
    });
});
