import { expect, test } from '@playwright/test';
import path from 'node:path';

// Needs a real browser: the picker only closes when native layout and scrolling are involved.

const enterpriseUmd = path.join(__dirname, '..', 'dist', 'ag-grid-enterprise.js');

const LANGUAGES = ['English', 'Spanish', 'French', 'Portuguese', '(other)'];

async function createGrid(page: import('@playwright/test').Page): Promise<void> {
    await page.setViewportSize({ width: 800, height: 600 });
    await page.setContent(
        '<!DOCTYPE html><html><head><style>*{margin:0}#myGrid{width:800px;height:500px}</style></head>' +
            '<body><div id="myGrid"></div></body></html>'
    );
    await page.addScriptTag({ path: enterpriseUmd });
    await page.evaluate((languages) => {
        const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
        (window as any).gridApi = (window as any).agGrid.createGrid(gridDiv, {
            defaultColDef: { width: 200, editable: true },
            columnDefs: [
                // Wide first column pushes the second column off-screen (as in the reported plnkr).
                {
                    headerName: 'Sync',
                    field: 'language',
                    cellEditor: 'agRichSelectCellEditor',
                    cellEditorParams: { values: languages },
                    width: 800,
                },
                // The reported column: filterList + allowTyping.
                {
                    field: 'language',
                    cellEditor: 'agRichSelectCellEditor',
                    cellEditorParams: { values: languages, filterList: true, allowTyping: true },
                },
            ],
            rowData: new Array(100).fill(null).map(() => ({ language: 'English' })),
        });
    }, LANGUAGES);
    await expect(page.locator('.ag-root-wrapper')).toBeVisible();
}

const pickerRows = (page: import('@playwright/test').Page) => page.locator('.ag-rich-select-row');

/** Screen rect of the row-0 cell in the given (rendered) column index. */
async function cellRect(page: import('@playwright/test').Page, colIndex: number) {
    return page.evaluate((idx) => {
        const cells = document.querySelectorAll<HTMLElement>('#myGrid [row-index="0"] [col-id]');
        const r = cells[idx].getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, height: r.height };
    }, colIndex);
}

test.describe('Rich Select picker on a barely-visible scrolled column (AG-16390)', () => {
    test.beforeEach(async ({ page }) => {
        await createGrid(page);
    });

    test('baseline: F2 opens the picker on a fully-visible column cell', async ({ page }) => {
        const rect = await cellRect(page, 0);
        await page.mouse.click(rect.left + 20, rect.top + rect.height / 2);
        await page.keyboard.press('F2');
        await expect(pickerRows(page).first()).toBeVisible();
    });

    test('F2 opens the picker on a barely-visible scrolled-in column cell', async ({ page }) => {
        // Slowly scroll right so the second column is only barely visible on the right edge.
        await page.mouse.move(400, 150);
        await page.mouse.wheel(40, 0);
        await page.waitForTimeout(150);

        // The second column's row-0 cell is now a thin visible sliver; click it, then F2.
        const rect = await cellRect(page, 1);
        await page.mouse.click(rect.left + 4, rect.top + rect.height / 2);
        await page.keyboard.press('F2');

        // Editing starts, but the values popup must also be shown (the bug: it is not).
        await expect(pickerRows(page).first()).toBeVisible();
    });
});

test.describe('Rich Select picker on a barely-visible scrolled row (AG-16390, vertical)', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 600, height: 400 });
        await page.setContent(
            '<!DOCTYPE html><html><head><style>*{margin:0}#myGrid{width:300px;height:300px}</style></head>' +
                '<body><div id="myGrid"></div></body></html>'
        );
        await page.addScriptTag({ path: enterpriseUmd });
        await page.evaluate((languages) => {
            (window as any).gridApi = (window as any).agGrid.createGrid(
                document.querySelector<HTMLElement>('#myGrid')!,
                {
                    defaultColDef: { width: 250, editable: true },
                    columnDefs: [
                        { field: 'a', cellEditor: 'agRichSelectCellEditor', cellEditorParams: { values: languages } },
                    ],
                    rowData: new Array(100).fill(null).map(() => ({ a: 'English' })),
                }
            );
        }, LANGUAGES);
        await expect(page.locator('.ag-root-wrapper')).toBeVisible();
    });

    test('F2 opens the picker on a barely-visible scrolled-in row cell', async ({ page }) => {
        // Scroll down a partial row so a cell sits as a thin sliver at the bottom edge.
        await page.mouse.move(150, 150);
        await page.mouse.wheel(0, 55);
        await page.waitForTimeout(150);

        const rect = await page.evaluate(() => {
            const gridBottom = document.querySelector<HTMLElement>('#myGrid')!.getBoundingClientRect().bottom;
            for (const c of Array.from(document.querySelectorAll<HTMLElement>('#myGrid [row-index] [col-id="a"]'))) {
                const r = c.getBoundingClientRect();
                if (r.top < gridBottom - 3 && r.bottom > gridBottom + 3) {
                    return { left: r.left, top: r.top };
                }
            }
            throw new Error('no bottom-straddling row cell found');
        });
        // Click the visible sliver near its top edge, then F2.
        await page.mouse.click(rect.left + 20, rect.top + 3);
        await page.keyboard.press('F2');

        await expect(pickerRows(page).first()).toBeVisible();
    });
});
