import type { Page } from '@playwright/test';
import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const WIDE = { width: 1200, height: 600 };
const NARROW = { width: 400, height: 600 };

const DEFINITION_ORDER = ['athlete', 'age', 'country', 'year', 'date', 'sport', 'gold', 'silver', 'bronze', 'total'];

/**
 * The displayed columns, left to right. Header cells are absolutely positioned, so DOM order does
 * not track column order — they have to be sorted by their horizontal offset.
 */
function displayedColIds(page: Page) {
    return page.locator('.ag-header-row .ag-header-cell[col-id]').evaluateAll((cells) =>
        cells
            .map((cell) => ({ colId: cell.getAttribute('col-id')!, left: cell.getBoundingClientRect().left }))
            .sort((a, b) => a.left - b.left)
            .map(({ colId }) => colId)
    );
}

/**
 * The example hides whichever columns no longer fit, so the displayed columns must always be a
 * leading run of `expectedOrder` — never a subset drawn from further along it.
 */
async function expectDisplayedPrefixOf(page: Page, expectedOrder: string[], { allVisible }: { allVisible: boolean }) {
    await expect(async () => {
        const displayed = await displayedColIds(page);
        expect(displayed.length).toBeGreaterThan(0);
        if (allVisible) {
            expect(displayed.length).toBe(expectedOrder.length);
        } else {
            expect(displayed.length).toBeLessThan(expectedOrder.length);
        }
        expect(displayed).toEqual(expectedOrder.slice(0, displayed.length));
    }).toPass();
}

test.agExample(import.meta, () => {
    test.eachFramework('hides the columns that do not fit as the grid narrows', async ({ page }) => {
        await page.setViewportSize(WIDE);
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expectDisplayedPrefixOf(page, DEFINITION_ORDER, { allVisible: true });

        await page.setViewportSize(NARROW);

        await expectDisplayedPrefixOf(page, DEFINITION_ORDER, { allVisible: false });
    });

    test.eachFramework('shows the columns again as the grid widens', async ({ page }) => {
        await page.setViewportSize(NARROW);
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expectDisplayedPrefixOf(page, DEFINITION_ORDER, { allVisible: false });

        await page.setViewportSize(WIDE);

        await expectDisplayedPrefixOf(page, DEFINITION_ORDER, { allVisible: true });
    });

    test.eachFramework(
        'hides columns following the displayed order, not the column definition order',
        async ({ page, remoteGrid }) => {
            await page.setViewportSize(WIDE);
            await ensureGridReady(page);
            await waitForGridContent(page);

            // reorder Sport to the front, as a user would by dragging its header
            await remoteGrid(page).moveColumns(['sport'], 0);

            const displayedOrder = ['sport', ...DEFINITION_ORDER.filter((colId) => colId !== 'sport')];
            await expectDisplayedPrefixOf(page, displayedOrder, { allVisible: true });

            await page.setViewportSize(NARROW);

            // Sport is now the left-most column, so it survives the narrowing even though it is
            // declared after the columns that get hidden
            await expectDisplayedPrefixOf(page, displayedOrder, { allVisible: false });
        }
    );
});
