import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

const ROW_NUMBERS_COL = 'ag-Grid-RowNumbersColumn';

test.agExample(import.meta, () => {
    test.eachFramework('Renders sequential row numbers', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.rowNumber('0')).toContainText('1');
        await expect(agIdFor.rowNumber('1')).toContainText('2');
        await expect(agIdFor.rowNumber('2')).toContainText('3');
    });

    test.eachFramework('Row numbers stay positional after sorting', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.headerCell('athlete').click();
        await waitForRowAnimations(page);

        // Row numbers track display position, not the data, so they remain 1, 2, 3, ... after a sort.
        // A long-distance sort can briefly leave a zombie duplicate of a moved row sharing its
        // row-index in the DOM (see waitForRowAnimations above) - scope to the scrolling
        // container (as expectRowIdAtIndex does) and let each auto-retrying assertion ride out
        // the transient, rather than hand-scraping every row with a one-shot `.all()`.
        for (let index = 0; index < 3; ++index) {
            const cell = page.locator(
                `.ag-grid-scrolling-container .ag-row[row-index="${index}"] [col-id="${ROW_NUMBERS_COL}"]`
            );
            await expect(cell).toHaveText(String(index + 1));
        }
    });

    test.eachFramework('Row numbers are not truncated with proportional digits', async ({ agIdFor, page }) => {
        // macOS system fonts draw digits at proportional widths, which made the autosized row number
        // column too narrow (AG-16369). Lato with proportional-nums reproduces that on Linux. The digit
        // variant is set on body so a row-number-cell rule can override it, as on macOS.
        await page.addInitScript(() => {
            document.addEventListener('DOMContentLoaded', () => {
                const style = document.createElement('style');
                style.textContent =
                    'body { font-variant-numeric: proportional-nums; } .ag-root-wrapper, .ag-root-wrapper * { font-family: Lato !important; }';
                document.head.appendChild(style);
            });
        });
        // The column autosizes when data loads, so reload for the font to apply before that.
        await page.reload();
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Guard: without a font that honours proportional-nums, this test would pass on unfixed code.
        const digitWidthGap = await page.locator('.ag-root-wrapper').evaluate((root) => {
            const measure = (text: string) => {
                const span = document.createElement('span');
                span.style.position = 'absolute';
                span.textContent = text;
                root.appendChild(span);
                const width = span.getBoundingClientRect().width;
                span.remove();
                return width;
            };
            return measure('00000') - measure('11111');
        });
        expect(digitWidthGap, 'Lato with proportional digits must be available').toBeGreaterThan(5);

        // Scroll to the last of the 8,618 rows, where the widest numbers are.
        await page.locator('.ag-body-vertical-scroll-viewport').evaluate((el) => {
            el.scrollTop = el.scrollHeight;
        });
        await expect(agIdFor.rowNumber('8617')).toHaveText('8618');

        const truncated = await page
            .locator('.ag-grid-scrolling-container')
            .first()
            .evaluate(() =>
                Array.from(document.querySelectorAll<HTMLElement>('.ag-cell.ag-row-number-cell'))
                    .filter((cell) => {
                        const style = getComputedStyle(cell);
                        const contentWidth =
                            cell.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
                        const range = document.createRange();
                        range.selectNodeContents(cell);
                        return range.getBoundingClientRect().width > contentWidth + 0.01;
                    })
                    .map((cell) => cell.textContent)
            );
        expect(truncated).toEqual([]);
    });
});
