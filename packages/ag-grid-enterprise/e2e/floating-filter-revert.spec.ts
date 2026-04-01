import { expect, test } from '@playwright/test';

/**
 * Regression test for https://github.com/ag-grid/ag-grid/issues/13176
 *
 * When using agMultiColumnFilter (text + set child filters) with floating
 * filters enabled, typing into the floating filter causes characters to
 * revert/disappear.
 *
 * Root cause: In v35.1.0, the SetFilterHandler was changed to wire
 * availableValuesChanged directly to onModelAsStringChange, which dispatches
 * a filterChanged column event. This event reaches the text floating filter
 * child via MultiFloatingFilterComp.onParentModelChanged without the
 * afterFloatingFilter flag, so the text input gets overwritten with the
 * stale model value.
 *
 * The full async chain:
 *   1. User types char -> debounce fires -> text filter model updates
 *   2. MultiFilter calls setFilter.handler.onAnyFilterChanged() [setTimeout(0)]
 *   3. Set filter refreshes available values [Promise + setTimeout(0)]
 *   4. availableValuesChanged -> onModelAsStringChange -> filterChanged
 *   5. Text floating filter input is overwritten with previous model value
 *
 * The bug is timing-dependent: it manifests when the async chain (steps 2-4)
 * completes AFTER the user types the next character. On fast machines this
 * chain resolves in microseconds, so we simulate slow execution by patching
 * window.setTimeout to add delay to zero-delay calls.
 */
test.describe('Issue #13176: Multi-filter floating filter input revert', () => {
    async function setupGrid(page: any, rowData: any[]) {
        await page.setContent(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />
                <style>html, body { margin: 0; } #myGrid { height: 400px; width: 600px; }</style>
            </head>
            <body>
                <div id="myGrid" class="ag-theme-alpine"></div>
            </body>
            </html>
        `);

        await page.addScriptTag({
            url: 'https://unpkg.com/ag-grid-enterprise@35.1.0/dist/ag-grid-enterprise.min.noStyle.js',
        });
        await page.addStyleTag({
            url: 'https://unpkg.com/ag-grid-community@35.1.0/styles/ag-grid.css',
        });
        await page.addStyleTag({
            url: 'https://unpkg.com/ag-grid-community@35.1.0/styles/ag-theme-alpine.css',
        });

        await page.evaluate((data: any[]) => {
            const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
            (window as any).agGrid.createGrid(gridDiv, {
                columnDefs: [
                    {
                        field: 'name',
                        filter: 'agMultiColumnFilter',
                        filterParams: {
                            filters: [
                                {
                                    filter: 'agTextColumnFilter',
                                    filterParams: {
                                        debounceMs: 50,
                                    },
                                },
                                { filter: 'agSetColumnFilter' },
                            ],
                        },
                    },
                    { field: 'value' },
                ],
                rowData: data,
                defaultColDef: {
                    flex: 1,
                    filter: true,
                    floatingFilter: true,
                },
            });
        }, rowData);

        await expect(page.locator('.ag-root-wrapper')).toBeVisible();
        await expect(page.locator('.ag-row')).not.toHaveCount(0);
    }

    test('typing into multi-filter floating filter should not lose characters', async ({ page }) => {
        const rowData = [
            { name: 'ALPHA', value: 1 },
            { name: 'BRAVO', value: 2 },
            { name: 'CHARLIE', value: 3 },
            { name: 'DELTA', value: 4 },
            { name: 'ECHO', value: 5 },
            { name: 'FOXTROT', value: 6 },
            { name: 'GOLF', value: 7 },
            { name: 'HOTEL', value: 8 },
            { name: 'INDIA', value: 9 },
            { name: 'JULIET', value: 10 },
        ];

        await setupGrid(page, rowData);

        // Simulate a slow machine by adding 200ms to all zero-delay setTimeouts.
        // AG Grid's set filter dispatches availableValuesChanged via setTimeout(fn, 0),
        // which in a fast headless browser resolves before the next keystroke. On a
        // slow machine (as reported in the issue), this delay is long enough to
        // interfere with typing.
        await page.evaluate(() => {
            const origSetTimeout = window.setTimeout.bind(window);
            (window as any).__origSetTimeout = origSetTimeout;
            (window as any).setTimeout = (fn: Function, delay?: number, ...args: any[]) => {
                if (delay === undefined || delay === 0) {
                    return origSetTimeout(fn, 200, ...args);
                }
                return origSetTimeout(fn, delay, ...args);
            };
        });

        const floatingFilterInput = page.locator(
            '.ag-header-cell[col-id="name"] .ag-floating-filter-input input[type="text"]:not([disabled])'
        );
        await expect(floatingFilterInput).toBeVisible();

        const textToType = 'GOLF';
        await floatingFilterInput.click();
        await floatingFilterInput.pressSequentially(textToType, { delay: 150 });

        // Wait for all pending async operations to settle
        await page.waitForTimeout(1500);

        // Restore original setTimeout
        await page.evaluate(() => {
            window.setTimeout = (window as any).__origSetTimeout;
        });

        const inputValue = await floatingFilterInput.inputValue();

        // With the bug (v35.1.0), the input reverts to a shorter string
        // because the set filter's async availableValuesChanged event
        // overwrites the text floating filter input.
        expect(inputValue).toBe(textToType);
    });
});
