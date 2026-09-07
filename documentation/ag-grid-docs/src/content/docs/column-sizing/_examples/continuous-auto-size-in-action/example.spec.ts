import { expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

const COLUMNS = ['athlete', 'age', 'country', 'sport', 'year', 'date', 'gold', 'silver', 'bronze', 'total'];

/** Settle the width animation so measurements are stable. */
async function waitForWidths(page: Page): Promise<void> {
    await expect(page.locator('.ag-animate-autosize')).toHaveCount(0);
}

/** The page's first-row number in the paging summary, which changes as soon as the new page lands. */
function firstRowOnPage(page: Page) {
    return page.locator('.ag-paging-row-summary-panel-number').first();
}

/**
 * Whether this page's content has moved any column off `initialWidths`. The re-size is asynchronous even
 * once the rows are rendered, so the widths are polled rather than sampled once — a page that leaves them
 * alone costs the settle window before it is ruled out, which is why that window is kept short.
 */
async function widthsChangedFrom(page: Page, initialWidths: number[]): Promise<boolean> {
    try {
        await expect
            .poll(async () => (await columnWidths(page)).some((width, index) => width !== initialWidths[index]), {
                timeout: 2000,
            })
            .toBe(true);
        return true;
    } catch {
        return false;
    }
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
        await waitForWidths(page);

        await expect(page.locator('.ag-header-group-cell-label')).toHaveText(['Competitor', 'Event', 'Medals']);

        const widths = await columnWidths(page);
        expect(widths.every((width) => width > 0)).toBe(true);
        // the narrow numeric columns must not be padded out to the default width
        expect(Math.min(...widths)).toBeLessThan(150);
    });

    test.eachFramework('changing page re-fits the columns to the new page contents', async ({ page }) => {
        await waitForGridContent(page);
        await waitForWidths(page);

        const initialWidths = await columnWidths(page);

        // the first page whose content is wide enough somewhere to move a column off its initial width
        let changed = false;
        for (let i = 0; i < 5 && !changed; i++) {
            // the previous page's rows are still on screen right after the click, so wait on the page
            // number rather than on row content, which would match before the new page had rendered
            const previousFirstRow = await firstRowOnPage(page).textContent();
            await page.getByRole('button', { name: 'Next Page' }).click();
            await expect(firstRowOnPage(page)).not.toHaveText(previousFirstRow ?? '');
            await waitForGridContent(page);
            await waitForWidths(page);

            changed = await widthsChangedFrom(page, initialWidths);
        }

        expect(changed).toBe(true);
    });
});
