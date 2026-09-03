import { expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

const COLUMNS = ['athlete', 'age', 'country', 'sport', 'year', 'date', 'gold', 'silver', 'bronze', 'total'];

/** Settle the width animation so measurements are stable. */
async function waitForWidths(page: Page): Promise<void> {
    await expect(page.locator('.ag-animate-autosize')).toHaveCount(0);
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

        let changed = false;
        for (let i = 0; i < 5 && !changed; i++) {
            await page.getByRole('button', { name: 'Next Page' }).click();
            await waitForGridContent(page);
            await waitForWidths(page);
            const widths = await columnWidths(page);
            changed = widths.some((width, index) => width !== initialWidths[index]);
        }

        expect(changed).toBe(true);
    });
});
