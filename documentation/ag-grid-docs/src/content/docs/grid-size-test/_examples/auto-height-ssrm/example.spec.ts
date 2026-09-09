import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { ConsoleMessage, Page } from 'playwright/test';

const HEADER_HEIGHT = 49;
const MAX_BODY_HEIGHT = 250;

test.agExample(import.meta, () => {
    test.eachFramework('caps the height and leaves most of the dataset unloaded', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // the maximum bounds the rows alone, so the header sits above it
        await expectGridViewportHeight(page, HEADER_HEIGHT + MAX_BODY_HEIGHT);
        await expect(page.locator('.ag-body-vertical-scroll')).toBeVisible();

        // the dataset is 500 rows, but the capped viewport shows only the first block
        expect(await page.locator('.ag-grid-scrolling-container .ag-row').count()).toBeLessThan(50);
        await expect(page.locator('.ag-cell', { hasText: 'D1499' })).toHaveCount(0);
    });

    test.eachFramework('requests only the blocks the capped viewport shows', async ({ page }) => {
        const blockRequests = collectBlockRequests(page);
        // the first block is requested during the fixture's navigation, before a listener can attach
        await page.reload();
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(async () => {
            expect(await blockRequests()).toEqual([{ startRow: 0, endRow: 100 }]);
        }).toPass();

        const viewport = page.locator('.ag-grid-viewport');
        // a scroll issued while the viewport is still sizing does not move it, so retry until it takes
        await expect(async () => {
            await viewport.evaluate((el) => {
                el.scrollTop = el.scrollHeight;
            });
            await expect(viewport).not.toHaveJSProperty('scrollTop', 0, { timeout: 1000 });
        }).toPass();

        await expect(page.locator('.ag-cell', { hasText: 'D1499' })).toBeVisible();

        // jumping to the end never brings the middle blocks into view, so they are never fetched
        await expect(async () => {
            expect(await blockRequests()).toEqual([
                { startRow: 0, endRow: 100 },
                { startRow: 400, endRow: 500 },
            ]);
        }).toPass();
    });
});

/** Retries, so that the assertion waits for the grid to resize rather than racing it. */
async function expectGridViewportHeight(page: Page, expected: number) {
    await expect(async () => {
        const box = await page.locator('.ag-grid-viewport').boundingBox();
        expect(box!.height).toBeCloseTo(expected, -1);
    }).toPass();
}

type BlockRequest = { startRow: number; endRow: number };

function isBlockRequest(value: unknown): value is BlockRequest {
    return typeof value === 'object' && value !== null && 'startRow' in value && 'endRow' in value;
}

/** Reads the logged request objects, which `message.text()` renders as a `JSHandle` placeholder. */
function collectBlockRequests(page: Page) {
    const pending: Promise<BlockRequest | undefined>[] = [];

    page.on('console', (message) => {
        if (message.text().includes('rows requested by grid')) {
            pending.push(readBlockRequest(message));
        }
    });

    return async () => (await Promise.all(pending)).filter((request) => request !== undefined);
}

async function readBlockRequest(message: ConsoleMessage): Promise<BlockRequest | undefined> {
    const values: unknown[] = await Promise.all(
        message.args().map((argument) => argument.jsonValue().catch(() => undefined))
    );
    const request = values.find(isBlockRequest);
    return request && { startRow: request.startRow, endRow: request.endRow };
}
