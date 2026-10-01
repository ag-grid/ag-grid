import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

const ROW_HEIGHT = 42;

test.agExample(import.meta, () => {
    test.eachFramework('stops at the maximum and virtualises the rows', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await setControls(page, { rows: 50, minBodyHeight: 100, maxBodyHeight: 200 });

        await expectGridBodyHeight(page, 200);
        await expectViewportOverflows(page);

        // a few visible rows plus the row buffer, rather than all 50
        expect(await page.locator('.ag-grid-scrolling-container .ag-row').count()).toBeLessThan(25);
    });

    test.eachFramework('sizes to the rows between the minimum and the maximum', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await setControls(page, { rows: 3, minBodyHeight: 100, maxBodyHeight: 200 });

        await expectGridBodyHeight(page, 3 * ROW_HEIGHT);
        await expectViewportDoesNotOverflow(page);
    });

    test.eachFramework('falls back to the minimum when there are no rows', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await setControls(page, { rows: 0, minBodyHeight: 120, maxBodyHeight: 200 });

        await expectGridBodyHeight(page, 120);
        await expectViewportDoesNotOverflow(page);
    });

    test.eachFramework('renders every row when no maximum is set', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await setControls(page, { rows: 50, minBodyHeight: 100, maxBodyHeight: 'none' });

        await expectGridBodyHeight(page, 50 * ROW_HEIGHT);
        await expectViewportDoesNotOverflow(page);
        await expect(page.locator('.ag-grid-scrolling-container .ag-row')).toHaveCount(50);
    });

    test.eachFramework('caps the body at zero and still virtualises the rows', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await setControls(page, { rows: 50, minBodyHeight: 0, maxBodyHeight: 0 });

        await expectGridBodyHeight(page, 0);
        await expectViewportOverflows(page);
        expect(await page.locator('.ag-grid-scrolling-container .ag-row').count()).toBeLessThan(25);
    });
});

async function setControls(
    page: Page,
    { rows, minBodyHeight, maxBodyHeight }: { rows: number; minBodyHeight: number; maxBodyHeight: number | 'none' }
) {
    await page.getByLabel('Rows').fill(`${rows}`);
    await page.getByLabel('autoHeightMinBodyHeight').fill(`${minBodyHeight}`);
    // the control is left blank to mean no maximum
    await page.getByLabel('autoHeightMaxBodyHeight').fill(maxBodyHeight === 'none' ? '' : `${maxBodyHeight}`);
}

/** The rows section grows past the maximum so the viewport can scroll over it, so measure what the viewport shows of it. */
async function expectGridBodyHeight(page: Page, expected: number) {
    await expect(async () => {
        const viewport = await page.locator('.ag-grid-viewport').boundingBox();
        const header = await page.locator('.ag-header').boundingBox();
        expect(viewport!.height - header!.height).toBeCloseTo(expected, -1);
    }).toPass();
}

/** Scrollbar chrome is hidden at rest on overlay-scrollbar platforms, so assert the overflow it stands for. */
async function expectViewportOverflows(page: Page) {
    await expect(async () => {
        const { scrollHeight, clientHeight } = await measureViewport(page);
        expect(scrollHeight).toBeGreaterThan(clientHeight);
    }).toPass();
}

async function expectViewportDoesNotOverflow(page: Page) {
    await expect(async () => {
        const { scrollHeight, clientHeight } = await measureViewport(page);
        // both are integer-rounded, so a sub-pixel border must not read as overflow
        expect(scrollHeight).toBeLessThanOrEqual(clientHeight + 1);
    }).toPass();
}

function measureViewport(page: Page) {
    return page
        .locator('.ag-grid-viewport')
        .evaluate((element) => ({ scrollHeight: element.scrollHeight, clientHeight: element.clientHeight }));
}
