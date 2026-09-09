import { expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

const COLUMNS = ['athlete', 'age', 'country', 'sport', 'year', 'date', 'gold', 'silver', 'bronze', 'total'];

/** The page's first-row number in the paging summary, which changes as soon as the new page lands. */
function firstRowOnPage(page: Page) {
    return page.locator('.ag-paging-row-summary-panel-number').first();
}

async function columnWidths(page: Page): Promise<number[]> {
    const widths: number[] = [];
    for (const colId of COLUMNS) {
        const box = await page.locator(`.ag-header-cell[col-id="${colId}"]`).first().boundingBox();
        widths.push(box?.width ?? 0);
    }
    return widths;
}

test.agExample(import.meta, () => {
    test.eachFramework('renders every grouped column sized to its contents', async ({ page }) => {
        await waitForGridContent(page);

        await expect(page.locator('.ag-header-group-cell-label')).toHaveText(['Competitor', 'Event', 'Medals']);

        // Auto-size runs asynchronously after the rows render, so the narrow columns are polled to their
        // fitted state rather than sampled once: the narrow numeric columns must not be left padded out
        // to the default width.
        await expect.poll(async () => Math.min(...(await columnWidths(page)))).toBeLessThan(150);

        const widths = await columnWidths(page);
        expect(widths.every((width) => width > 0)).toBe(true);
    });

    test.eachFramework('changing page re-fits the columns to the new page contents', async ({ page }) => {
        await waitForGridContent(page);

        const initialWidths = await columnWidths(page);

        /**
         * Whether the columns have re-fitted for the page now on screen. Polled rather than sampled once:
         * a page change reaches continuous auto-size through the grid's own scheduler, so the re-fit lands
         * a frame or more after the new rows do and nothing in the DOM announces it. This waits on the
         * observed end state the test is about - the widths themselves - and never on an elapsed window;
         * the bound only decides whether to move on to the next page, and is not the assertion.
         */
        const refittedFromInitial = async (): Promise<boolean> => {
            try {
                await expect
                    .poll(async () => (await columnWidths(page)).some((width, i) => width !== initialWidths[i]), {
                        timeout: 5000,
                    })
                    .toBe(true);
                return true;
            } catch {
                return false;
            }
        };

        // the first page whose content is wide enough somewhere to move a column off its initial width
        let changed = false;
        let widths = initialWidths;
        for (let i = 0; i < 5 && !changed; i++) {
            // the previous page's rows are still on screen right after the click, so wait on the page
            // number rather than on row content, which would match before the new page had rendered
            const previousFirstRow = await firstRowOnPage(page).textContent();
            await page.getByRole('button', { name: 'Next Page' }).click();
            await expect(firstRowOnPage(page)).not.toHaveText(previousFirstRow ?? '');
            await waitForGridContent(page);

            changed = await refittedFromInitial();
            widths = await columnWidths(page);
        }

        // Reported with both width sets: a bare boolean says nothing about which column failed to move.
        expect(
            changed,
            `no column moved off its initial width over 5 pages.\n  columns: ${COLUMNS.join(', ')}` +
                `\n  initial: ${initialWidths.join(', ')}\n     last: ${widths.join(', ')}`
        ).toBe(true);
    });
});
