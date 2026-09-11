import { ensureGridReady, expect, test, waitForGridContent, withGridEvent } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

/** What the continuous `fitGridWidth` strategy dispatches once the new widths are on screen. */
const RE_DISTRIBUTED = { finished: true, source: 'sizeColumnsToFit' } as const;

/** The example sets `animateColumnResizing`, so a box read on the event lands mid-transition. */
async function widthTransitionsSettled(page: Page): Promise<void> {
    await page.waitForFunction(() =>
        [...document.querySelectorAll('.ag-header-cell[col-id]')].every((cell) =>
            cell.getAnimations().every((animation) => animation.playState !== 'running')
        )
    );
}

async function reDistributes(page: Page, action: () => Promise<unknown>): Promise<void> {
    await withGridEvent(page, 'columnResized', RE_DISTRIBUTED, action);
    await widthTransitionsSettled(page);
}

function scrollingContainer(page: Page) {
    return page.locator('.ag-grid-scrolling-container').first();
}

function headerCell(page: Page, colId: string) {
    return page.locator(`.ag-header-cell[col-id="${colId}"]`).first();
}

function headerCells(page: Page) {
    return page.locator('.ag-header-cell[col-id]');
}

async function columnWidth(page: Page, colId: string): Promise<number> {
    return (await headerCell(page, colId).boundingBox())?.width ?? 0;
}

async function totalColumnWidth(page: Page): Promise<number> {
    return page.evaluate(() =>
        [...document.querySelectorAll('.ag-header-cell[col-id]')].reduce(
            (sum, cell) => sum + cell.getBoundingClientRect().width,
            0
        )
    );
}

async function availableWidth(page: Page): Promise<number> {
    return scrollingContainer(page).evaluate((element) => element.clientWidth);
}

async function expectColumnsToFillGrid(page: Page): Promise<void> {
    await expect(async () => {
        const total = await totalColumnWidth(page);
        const available = await availableWidth(page);
        expect(Math.abs(total - available)).toBeLessThanOrEqual(2);
    }).toPass();

    const overflow = await scrollingContainer(page).evaluate((element) => element.scrollWidth - element.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
}

test.agExample(import.meta, () => {
    test.eachFramework('distributes the grid width across the columns on load', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(headerCells(page)).toHaveCount(5);
        await expectColumnsToFillGrid(page);
    });

    test.eachFramework(
        'each added column takes space from the others, and removing gives it back',
        async ({ page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);
            await expectColumnsToFillGrid(page);

            const firstColumnWidth = await columnWidth(page, 'column1');
            let previousWidth = firstColumnWidth;

            for (const expectedCount of [6, 7, 8]) {
                await reDistributes(page, () => page.locator('button.add-column-button').click());
                await expect(headerCells(page)).toHaveCount(expectedCount);

                const narrowed = await columnWidth(page, 'column1');
                expect(narrowed).toBeLessThan(previousWidth);
                await expectColumnsToFillGrid(page);
                previousWidth = narrowed;
            }

            for (const expectedCount of [7, 6, 5]) {
                await reDistributes(page, () => page.locator('button.remove-column-button').click());
                await expect(headerCells(page)).toHaveCount(expectedCount);

                const widened = await columnWidth(page, 'column1');
                expect(widened).toBeGreaterThan(previousWidth);
                await expectColumnsToFillGrid(page);
                previousWidth = widened;
            }

            expect(previousWidth).toBeCloseTo(firstColumnWidth, 0);
        }
    );

    test.eachFramework('adding and removing rows keeps the columns filling the grid', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await expectColumnsToFillGrid(page);

        // The rendered `.ag-row` count saturates once the grid virtualises; the extent does not.
        const rowExtent = () => scrollingContainer(page).evaluate((element) => element.scrollHeight);

        const clickAndExpect = async (button: string, direction: 'grows' | 'shrinks') => {
            const before = await rowExtent();
            await page.locator(button).click();
            await expect(async () => {
                const after = await rowExtent();
                if (direction === 'grows') {
                    expect(after).toBeGreaterThan(before);
                } else {
                    expect(after).toBeLessThan(before);
                }
            }).toPass();
        };

        const initialExtent = await rowExtent();

        await clickAndExpect('button.add-rows-button', 'grows');
        await expectColumnsToFillGrid(page);

        await clickAndExpect('button.add-rows-button', 'grows');
        await expectColumnsToFillGrid(page);

        await clickAndExpect('button.remove-rows-button', 'shrinks');
        await expectColumnsToFillGrid(page);

        await clickAndExpect('button.remove-rows-button', 'shrinks');
        await expectColumnsToFillGrid(page);

        expect(await rowExtent()).toBe(initialExtent);
    });

    test.eachFramework('resizing the grid re-distributes the width', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await expectColumnsToFillGrid(page);

        const wideTotal = await totalColumnWidth(page);

        await reDistributes(page, () => page.locator('button.narrower-button').click());
        const narrowTotal = await totalColumnWidth(page);
        expect(narrowTotal).toBeLessThan(wideTotal);
        await expectColumnsToFillGrid(page);

        await reDistributes(page, () => page.locator('button.wider-button').click());
        expect(await totalColumnWidth(page)).toBeCloseTo(wideTotal, 0);
        await expectColumnsToFillGrid(page);
    });
});
