import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { GridApi } from 'ag-grid-community';

import { mountGrid } from '../src/mountGrid';

interface HeaderFrame {
    width: number;
    handleOffset: number;
}

/** Runs `action` against the grid API, then records the header of `colId` on every frame for 400ms. */
function recordHeaderFrames(page: Page, colId: string, action: (api: GridApi) => void): Promise<HeaderFrame[]> {
    return page.evaluate(
        ({ colId, actionSource }) => {
            const header = () => document.querySelector<HTMLElement>(`.ag-header-cell[col-id="${colId}"]`)!;
            const read = (): HeaderFrame => {
                const headerRect = header().getBoundingClientRect();
                const handleRect = header().querySelector('.ag-header-cell-resize')!.getBoundingClientRect();
                return { width: headerRect.width, handleOffset: handleRect.right - headerRect.right };
            };
            const frames = [read()];
            new Function('api', `(${actionSource})(api)`)((window as any).gridApi);
            const start = performance.now();
            return new Promise<HeaderFrame[]>((resolve) => {
                const onFrame = () => {
                    frames.push(read());
                    if (performance.now() - start < 400) {
                        requestAnimationFrame(onFrame);
                    } else {
                        resolve(frames);
                    }
                };
                requestAnimationFrame(onFrame);
            });
        },
        { colId, actionSource: action.toString() }
    );
}

function expectAnimated(frames: HeaderFrame[]): void {
    const first = frames[0].width;
    const last = frames[frames.length - 1].width;
    expect(last).not.toBe(first);
    const [low, high] = first < last ? [first, last] : [last, first];
    expect(frames.some(({ width }) => width > low + 1 && width < high - 1)).toBe(true);
    expect(new Set(frames.map(({ handleOffset }) => Math.round(handleOffset))).size).toBe(1);
}

function expectNotAnimated(frames: HeaderFrame[]): void {
    const first = frames[0].width;
    const last = frames[frames.length - 1].width;
    expect(last).not.toBe(first);
    expect(frames.every(({ width }) => width === first || width === last)).toBe(true);
}

test.describe('animateColumnResizing in a real browser', () => {
    test('flex columns animate when a column group opens, with column move animation suppressed', async ({ page }) => {
        await mountGrid(page, {
            options: () => ({
                columnDefs: [
                    {
                        groupId: 'group1',
                        children: [{ field: 'a' }, { field: 'b' }, { field: 'c', columnGroupShow: 'closed' }],
                    },
                    { field: 'd' },
                ],
                rowData: [{}],
                defaultColDef: { flex: 1 },
                animateColumnResizing: true,
                suppressColumnMoveAnimation: true,
            }),
        });

        expectAnimated(await recordHeaderFrames(page, 'a', (api) => api.setColumnGroupOpened('group1', true)));
    });

    test('flex columns animate when columns are shown, hidden or replaced', async ({ page }) => {
        await mountGrid(page, {
            options: () => ({
                columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
                rowData: [{}],
                defaultColDef: { flex: 1 },
                animateColumnResizing: true,
            }),
        });

        expectAnimated(await recordHeaderFrames(page, 'a', (api) => api.setColumnsVisible(['c'], false)));
        expectAnimated(
            await recordHeaderFrames(page, 'a', (api) => api.applyColumnState({ state: [{ colId: 'c', hide: false }] }))
        );
        expectAnimated(
            await recordHeaderFrames(page, 'a', (api) =>
                api.setGridOption('columnDefs', [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }])
            )
        );
    });

    test('continuous fit-grid-width animates the width and resize handle of every column after a column is hidden', async ({
        page,
    }) => {
        await mountGrid(page, {
            options: () => ({
                columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }],
                rowData: [{}],
                autoSizeStrategy: { type: 'fitGridWidth', continuous: true },
                animateColumnResizing: true,
            }),
        });
        await expect(page.locator('.ag-animate-autosize')).toHaveCount(0);

        expectAnimated(await recordHeaderFrames(page, 'a', (api) => api.setColumnsVisible(['c'], false)));
    });

    test('column widths change without animation by default', async ({ page }) => {
        await mountGrid(page, {
            options: () => ({
                columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
                rowData: [{}],
                defaultColDef: { flex: 1 },
            }),
        });

        expectNotAnimated(await recordHeaderFrames(page, 'a', (api) => api.setColumnsVisible(['c'], false)));
    });
});
