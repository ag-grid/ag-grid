import { expect, test } from '@playwright/test';

import type { MountedGrid } from '../src/mountGrid';
import { mountGrid } from '../src/mountGrid';

/**
 * The ways an application gives every row one height, with the theme measured by a real browser: happy-dom cannot
 * measure CSS, so the behavioural tests only simulate a theme change. Each checks the rows the grid lays out and the
 * rows the browser draws.
 */

const ROW_COUNT = 3;

/** `top height` for each displayed row: as the grid positions it, then as the browser draws its row element. */
const rowLayout = async ({ grid, withApi }: MountedGrid) => ({
    model: await withApi((api) =>
        Array.from({ length: api.getDisplayedRowCount() }, (_, i) => {
            const node = api.getDisplayedRowAtIndex(i)!;
            return `${node.rowTop} ${node.rowHeight}`;
        })
    ),
    dom: await grid.evaluate((el) => {
        // the rows of one row container, measured from its top
        const container = el.querySelector('.ag-row')!.parentElement!;
        const containerTop = container.getBoundingClientRect().top;
        return Array.from(container.querySelectorAll<HTMLElement>(':scope > .ag-row'))
            .sort((a, b) => Number(a.getAttribute('row-index')) - Number(b.getAttribute('row-index')))
            .map((row) => {
                const box = row.getBoundingClientRect();
                return `${Math.round(box.top - containerTop)} ${Math.round(box.height)}`;
            });
    }),
});

/** Every row at `height`, tiled from the top without gap or overlap. */
const uniform = (height: number) => {
    const rows = Array.from({ length: ROW_COUNT }, (_, i) => `${i * height} ${height}`);
    return { model: rows, dom: rows };
};

test.describe('one height for every row, from each place an application sets it', () => {
    test('the rowHeight theme parameter', async ({ page }) => {
        const mounted = await mountGrid(page, {
            options: () => ({
                theme: window.agGrid.themeQuartz.withParams({ rowHeight: 30 }),
                columnDefs: [{ field: 'n' }],
                rowData: [{ n: 1 }, { n: 2 }, { n: 3 }],
            }),
        });
        await expect.poll(() => rowLayout(mounted)).toEqual(uniform(30));
    });

    test('the --ag-row-height CSS custom property', async ({ page }) => {
        const mounted = await mountGrid(page, {
            css: '#myGrid { --ag-row-height: 33px; }',
            options: () => ({
                theme: window.agGrid.themeQuartz,
                columnDefs: [{ field: 'n' }],
                rowData: [{ n: 1 }, { n: 2 }, { n: 3 }],
            }),
        });
        await expect.poll(() => rowLayout(mounted)).toEqual(uniform(33));
    });

    test('the rowHeight grid option, which wins over the theme parameter', async ({ page }) => {
        const mounted = await mountGrid(page, {
            options: () => ({
                theme: window.agGrid.themeQuartz.withParams({ rowHeight: 30 }),
                rowHeight: 45,
                columnDefs: [{ field: 'n' }],
                rowData: [{ n: 1 }, { n: 2 }, { n: 3 }],
            }),
        });
        await expect.poll(() => rowLayout(mounted)).toEqual(uniform(45));

        await mounted.withApi((api) => api.setGridOption('rowHeight', 50));
        await expect.poll(() => rowLayout(mounted)).toEqual(uniform(50));

        await mounted.withApi((api) => api.setGridOption('rowHeight', undefined));
        await expect.poll(() => rowLayout(mounted)).toEqual(uniform(30));
    });

    test('a theme swapped in after the grid is created', async ({ page }) => {
        const mounted = await mountGrid(page, {
            options: () => ({
                theme: window.agGrid.themeQuartz.withParams({ rowHeight: 30 }),
                columnDefs: [{ field: 'n' }],
                rowData: [{ n: 1 }, { n: 2 }, { n: 3 }],
            }),
        });
        await expect.poll(() => rowLayout(mounted)).toEqual(uniform(30));

        await mounted.withApi((api) =>
            api.setGridOption('theme', window.agGrid.themeQuartz.withParams({ rowHeight: 52 }))
        );
        await expect.poll(() => rowLayout(mounted)).toEqual(uniform(52));
    });

    test('a theme parameter the row height is derived from', async ({ page }) => {
        const mounted = await mountGrid(page, {
            options: () => ({
                theme: window.agGrid.themeQuartz.withParams({ rowHeight: { calc: 'spacing * 5' }, spacing: 7 }),
                columnDefs: [{ field: 'n' }],
                rowData: [{ n: 1 }, { n: 2 }, { n: 3 }],
            }),
        });
        await expect.poll(() => rowLayout(mounted)).toEqual(uniform(35));
    });
});
