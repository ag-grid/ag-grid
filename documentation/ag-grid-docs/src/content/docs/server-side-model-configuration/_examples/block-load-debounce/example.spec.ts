import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

// The example's datasource logs one line per block the grid asks it for. That log is the only
// observable this example offers of how many blocks a scroll actually fetched, and it is what
// `blockLoadDebounceMillis` changes.
const BLOCK_REQUEST_LOG = '[Datasource] - rows requested by grid';

// Scroll positions visited in quick succession, each in a different block. Without a debounce the
// grid fetches a block per position; the example's `blockLoadDebounceMillis: 1000` outlasts the
// whole burst, so the blocks scrolled past are skipped and only the resting one is fetched.
const BURST_POSITIONS = [0.3, 0.45, 0.6, 0.75, 0.9, 1];
const BURST_STEP_MS = 60;
// The block the burst comes to rest on, plus slack for one the grid had already committed to when
// the burst began. Six would mean nothing was skipped.
const MAX_DEBOUNCED_BLOCK_REQUESTS = 3;

test.agExample(import.meta, () => {
    test.eachFramework('blockLoadDebounceMillis skips blocks scrolled past then resolves to data', async ({ page }) => {
        const blockRequests: string[] = [];
        page.on('console', (msg) => {
            if (msg.text().includes(BLOCK_REQUEST_LOG)) {
                blockRequests.push(msg.text());
            }
        });

        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        // The first block loads (despite the debounce) with real olympic data.
        await expect(dataRow(0).locator('[col-id="athlete"]')).toContainText('Michael Phelps');
        await expect(dataRow(0).locator('[col-id="id"]')).toContainText('0');

        const viewport = page.locator('.ag-grid-viewport');
        const scrollTo = (fraction: number) =>
            viewport.evaluate((el, f) => {
                el.scrollTop = el.scrollHeight * f;
            }, fraction);

        // A scroll issued while the viewport is still sizing does not move it, and then no block
        // is ever fetched. Retry until it takes.
        await expect(async () => {
            await scrollTo(BURST_POSITIONS[0]);
            await expect(viewport).not.toHaveJSProperty('scrollTop', 0, { timeout: 1000 });
        }).toPass();

        // The transient `.ag-row-loading` placeholder is deliberately not asserted here: no
        // timeout value makes it reliable, since a longer one makes it likelier the state has
        // already resolved and a shorter one makes the poll likelier to miss it. Counting the
        // datasource's own block requests is the event-based signal that replaces it — it is
        // exactly what the debounce changes, and unlike a rendered placeholder it cannot be
        // missed by being read too late.
        const requestsBeforeBurst = blockRequests.length;

        for (const fraction of BURST_POSITIONS) {
            await scrollTo(fraction);
            await page.waitForTimeout(BURST_STEP_MS);
        }

        // Nothing scrolls from here on: each scroll restarts the debounce, so a retry loop that
        // re-scrolled would hold the resting block permanently unfetched.
        const restingIndex = await page.evaluate(() => {
            const indexes = Array.from(document.querySelectorAll('.ag-row'))
                .map((r) => Number(r.getAttribute('row-index')))
                .filter((i) => Number.isFinite(i));
            return Math.min(...indexes);
        });
        expect(restingIndex).toBeGreaterThanOrEqual(100);

        // End state: the debounce elapses and the block the scrolling came to rest on resolves
        // to real data, replacing its loading placeholders.
        await expect(dataRow(restingIndex).locator('[col-id="id"]')).toContainText(String(restingIndex));
        await expect(dataRow(restingIndex).locator('[col-id="athlete"]')).not.toBeEmpty();

        // ...and it got there having fetched far fewer blocks than the burst crossed.
        expect(blockRequests.length - requestsBeforeBurst).toBeLessThanOrEqual(MAX_DEBOUNCED_BLOCK_REQUESTS);
    });
});
