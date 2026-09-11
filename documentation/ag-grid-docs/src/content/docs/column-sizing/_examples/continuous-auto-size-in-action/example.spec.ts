import { expect, test, waitForGridContent, withGridEvent } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

const COLUMNS = ['athlete', 'age', 'country', 'text1', 'text2', 'text3'];

/** The page's first-row number in the paging summary, which changes as soon as the new page lands. */
function firstRowOnPage(page: Page) {
    return page.locator('.ag-paging-row-summary-panel-number').first();
}

/**
 * Re-samples until the value satisfies `predicate` or the timeout expires, then returns the last
 * sample for the caller to assert on. `expect` re-exported from the docs test utils is a bare
 * wrapper function, so Playwright's `expect.poll` is not available here.
 */
async function pollFor<T>(sample: () => Promise<T>, predicate: (value: T) => boolean, timeoutMs: number) {
    const deadline = Date.now() + timeoutMs;
    let value = await sample();
    while (!predicate(value) && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        value = await sample();
    }
    return value;
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

        // only the leftmost groups are rendered, so the visible prefix is asserted rather than the
        // full set of seven groups
        const groupLabels = page.locator('.ag-header-group-cell-label');
        await expect(groupLabels.nth(0)).toHaveText('Competitor');
        await expect(groupLabels.nth(1)).toHaveText('Profile');

        // Auto-size runs asynchronously after the rows render, so the narrow columns are polled to their
        // fitted state rather than sampled once: the narrow numeric columns must not be left padded out
        // to the default width.
        await expect(async () => {
            expect(Math.min(...(await columnWidths(page)))).toBeLessThan(150);
        }).toPass();

        const widths = await columnWidths(page);
        expect(widths.every((width) => width > 0)).toBe(true);
    });

    test.eachFramework('changing page re-fits the columns to the new page contents', async ({ page, remoteGrid }) => {
        // One proxy per test: creating it exposes the `logEvent` binding on the page.
        const remoteApi = remoteGrid(page, '1');
        await waitForGridContent(page);

        await remoteApi.logEvent('columnResized', ['finished', 'source']);
        const autoSizePasses = () =>
            remoteGrid.eventLog.filter(
                ([eventType, eventData]) =>
                    eventType === 'columnResized' && eventData.finished && eventData.source === 'autosizeColumns'
            ).length;

        /**
         * Whether a debounced auto-size pass landed for the page just shown. `columnResized` is only
         * dispatched when a column was actually re-sized, so a page whose content fits the current
         * widths legitimately produces no pass - hence the bounded wait, which decides only whether to
         * move on to the next page. The test's own gate is the width assertion below, and it is on
         * observed state, never on elapsed time.
         */
        const autoSizePassLanded = async (passesBeforePage: number): Promise<boolean> => {
            const passes = await pollFor(
                async () => autoSizePasses(),
                (count) => count > passesBeforePage,
                2000
            );
            return passes > passesBeforePage;
        };

        const initialWidths = await columnWidths(page);

        // the first page whose content is wide enough somewhere to move a column off its initial width
        let changed = false;
        let widths = initialWidths;
        for (let i = 0; i < 5 && !changed; i++) {
            // The event log is cumulative and never reset, so each page compares against its own
            // snapshot rather than an absolute count.
            const passesBeforePage = autoSizePasses();

            // the previous page's rows are still on screen right after the click, so wait on the page
            // number rather than on row content, which would match before the new page had rendered
            const previousFirstRow = await firstRowOnPage(page).textContent();
            await page.getByRole('button', { name: 'Next Page' }).click();
            await expect(firstRowOnPage(page)).not.toHaveText(previousFirstRow ?? '');
            await waitForGridContent(page);

            if (!(await autoSizePassLanded(passesBeforePage))) {
                // nothing was re-sized for this page: its content fits the widths already on screen
                continue;
            }

            widths = await columnWidths(page);
            changed = widths.some((width, index) => width !== initialWidths[index]);
        }

        // Reported with both width sets: a bare boolean says nothing about which column failed to move.
        expect(
            changed,
            `no column moved off its initial width over 5 pages.\n  columns: ${COLUMNS.join(', ')}` +
                `\n  initial: ${initialWidths.join(', ')}\n     last: ${widths.join(', ')}`
        ).toBe(true);
    });

    test.eachFramework('scrolling right fits the columns as they arrive', async ({ page }) => {
        await waitForGridContent(page);

        const goldHeader = page.locator('.ag-header-cell[col-id="gold"]').first();

        // The auto-size pass is debounced, so wait for the grid to report it.
        await withGridEvent(page, 'columnResized', { finished: true, source: 'autosizeColumns' }, async () => {
            await page
                .locator('.ag-body-horizontal-scroll-viewport')
                .first()
                .evaluate((element) => element.scrollTo({ left: element.scrollWidth }));
            await expect(goldHeader).toBeVisible();
        });

        const fitted = (await goldHeader.boundingBox())?.width ?? 0;
        expect(fitted, 'the "Gold" column was not fitted after scrolling it into view').toBeLessThan(150);
        expect(fitted).toBeGreaterThan(0);
    });
});
