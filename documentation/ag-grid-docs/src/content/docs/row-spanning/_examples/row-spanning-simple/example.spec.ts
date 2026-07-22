import type { Page } from '@playwright/test';
import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

async function expectCellOwnsItsCentre(page: Page, selector: string, minimumHeight = 1): Promise<void> {
    await page.waitForFunction(
        ({ minimumHeight, selector }) => {
            const cells = Array.from(document.querySelectorAll<HTMLElement>(selector));
            const cell = cells.find((candidate) => {
                const bounds = candidate.getBoundingClientRect();
                return bounds.width > 0 && bounds.height >= minimumHeight;
            });
            if (!cell) {
                return false;
            }

            const bounds = cell.getBoundingClientRect();
            const hit = document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
            return hit?.closest('.ag-cell') === cell;
        },
        { minimumHeight, selector }
    );
}

async function scrollHorizontally(page: Page): Promise<void> {
    const viewport = page.locator('.ag-grid-viewport');
    await viewport.evaluate((element) => {
        element.scrollLeft = 300;
    });
    await expect.poll(() => viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
}

test.agExample(import.meta, () => {
    test.eachFramework('a pinned spanning column remains visible above centre spans', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const api = remoteGrid(page);
        await api.applyColumnState({
            defaultState: { flex: null, pinned: null, width: 250 },
            state: [{ colId: 'sport', pinned: 'left' }],
        });

        await expectCellOwnsItsCentre(
            page,
            '.ag-spanning-container .ag-grid-pinned-left-cells .ag-cell[col-id="sport"]',
            60
        );
        await scrollHorizontally(page);
        await expectCellOwnsItsCentre(
            page,
            '.ag-spanning-container .ag-grid-pinned-left-cells .ag-cell[col-id="sport"]',
            60
        );

        await api.applyColumnState({ state: [{ colId: 'sport', pinned: 'right' }] });
        await expectCellOwnsItsCentre(
            page,
            '.ag-spanning-container .ag-grid-pinned-right-cells .ag-cell[col-id="sport"]',
            60
        );
    });

    test.eachFramework('a pinned regular column remains visible beside centre spans', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const api = remoteGrid(page);
        await api.applyColumnState({
            defaultState: { flex: null, pinned: null, width: 250 },
            state: [{ colId: 'athlete', pinned: 'left' }],
        });

        const leftCell =
            '.ag-grid-scrolling-container > .ag-row[row-index="0"] .ag-grid-pinned-left-cells .ag-cell[col-id="athlete"]';
        await expectCellOwnsItsCentre(page, leftCell);
        await scrollHorizontally(page);
        await expectCellOwnsItsCentre(page, leftCell);

        await api.applyColumnState({ state: [{ colId: 'athlete', pinned: 'right' }] });
        await expectCellOwnsItsCentre(
            page,
            '.ag-grid-scrolling-container > .ag-row[row-index="0"] .ag-grid-pinned-right-cells .ag-cell[col-id="athlete"]'
        );
    });
});
