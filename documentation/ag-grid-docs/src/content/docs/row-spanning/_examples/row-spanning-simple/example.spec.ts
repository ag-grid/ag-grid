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
    test.eachFramework('spanRows merges equal contiguous values into a single spanned cell', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Data is sorted country/year/sport asc. Alphabetically the top group is
        // Afghanistan (2 rows) followed by Algeria (8 rows).
        const countrySpans = page.locator('.ag-spanned-cell[col-id="country"]');
        await expect(countrySpans.first()).toBeVisible();

        // Afghanistan appears twice contiguously -> a single cell spanning 2 rows.
        const afghanistan = countrySpans.filter({ hasText: 'Afghanistan' });
        await expect(afghanistan).toHaveCount(1);
        await expect(afghanistan).toHaveAttribute('aria-rowspan', '2');

        // Algeria appears 8 times contiguously -> a single cell spanning 8 rows.
        const algeria = countrySpans.filter({ hasText: 'Algeria' });
        await expect(algeria).toHaveCount(1);
        await expect(algeria).toHaveAttribute('aria-rowspan', '8');

        // The spanned cell physically covers multiple row heights: it is far taller
        // than a normal single-row cell in a non-spanning column (athlete).
        const normalCell = page.locator('.ag-cell[col-id="athlete"]').first();
        const normalBox = await normalCell.boundingBox();
        const algeriaBox = await algeria.boundingBox();
        expect(normalBox).not.toBeNull();
        expect(algeriaBox).not.toBeNull();
        // 8 spanned rows -> at least ~6x a single row height (allow slack).
        expect(algeriaBox!.height).toBeGreaterThan(normalBox!.height * 6);

        // Covered leaf rows must NOT render a duplicate normal country cell.
        const normalAlgeria = page
            .locator('.ag-cell[col-id="country"]:not(.ag-spanned-cell)')
            .filter({ hasText: 'Algeria' });
        await expect(normalAlgeria).toHaveCount(0);

        // A non-spanning column (athlete) never produces spanned cells.
        await expect(page.locator('.ag-spanned-cell[col-id="athlete"]')).toHaveCount(0);

        // year and sport are also configured to span.
        await expect(page.locator('.ag-spanned-cell[col-id="year"]').first()).toBeVisible();
        await expect(page.locator('.ag-spanned-cell[col-id="sport"]').first()).toBeVisible();
    });

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
