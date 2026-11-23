/**
 * Column moves animate through CSS transitions on `left`, which a header cell removed from the DOM and re-inserted
 * loses: header cells keep their DOM order when columns move within a pinned section, in vanilla JS and React.
 */
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import path from 'node:path';

import { mountGrid } from '../src/mountGrid';

const REPO_ROOT = path.join(__dirname, '../../..');
const COLUMN_WIDTH = 200;

interface MoveFrames {
    /** Left of the moved header before the move, `undefined` when it was not rendered. */
    before: number | undefined;
    /** Left the moved header has at the start, in an unscrolled grid. */
    from: number;
    /** Left the moved header has once the move is done. */
    to: number;
    /** Left of the moved header on each animation frame for 400ms after the move. */
    frames: number[];
}

async function mountVanillaGrid(page: Page): Promise<void> {
    await mountGrid(page, {
        options: () => ({
            columnDefs: Array.from({ length: 20 }, (_, i) => ({ colId: `c${i}`, field: `c${i}`, width: 200 })),
            rowData: [{}],
        }),
    });
}

async function mountReactGrid(page: Page): Promise<void> {
    await page.setContent(
        '<!DOCTYPE html><html><head><style>*{margin:0}#myGrid{width:800px;height:500px}</style></head>' +
            '<body><div id="myGrid"></div></body></html>'
    );
    await page.addScriptTag({ path: path.join(REPO_ROOT, 'node_modules/react/umd/react.development.js') });
    await page.addScriptTag({ path: path.join(REPO_ROOT, 'node_modules/react-dom/umd/react-dom.development.js') });
    await page.addScriptTag({ path: path.join(REPO_ROOT, 'packages/ag-grid-community/dist/ag-grid-community.js') });
    await page.evaluate(() => {
        (window as any)['ag-grid-community'] = window.agGrid;
    });
    await page.addScriptTag({ path: path.join(REPO_ROOT, 'packages/ag-grid-react/dist/umd/ag-grid-react.js') });
    await page.evaluate(() => {
        const w = window as any;
        const columnDefs = Array.from({ length: 20 }, (_, i) => ({ colId: `c${i}`, field: `c${i}`, width: 200 }));
        w.ReactDOM.createRoot(document.getElementById('myGrid')).render(
            w.React.createElement(w.AgGridReact.AgGridReact, {
                columnDefs,
                rowData: [{}],
                onGridReady: (e: { api: typeof window.gridApi }) => (window.gridApi = e.api),
            })
        );
    });
    await page.locator('.ag-header-cell[col-id="c0"]').waitFor();
}

/** Moves `colId` to `toIndex`, then samples its header's left on every animation frame for 400ms. */
function moveAndSample(page: Page, colId: string, toIndex: number): Promise<MoveFrames> {
    return page.evaluate(
        ({ colId, toIndex, width }) => {
            const left = () =>
                document.querySelector(`.ag-header-cell[col-id="${colId}"]`)?.getBoundingClientRect().left;
            const origin = document.querySelector('.ag-header-cell[col-id="c0"]')!.getBoundingClientRect().left;
            const before = left();
            const from = origin + Number(colId.slice(1)) * width;
            const to = origin + toIndex * width;
            window.gridApi.moveColumns([colId], toIndex);
            // no layout read until the first frame: a style flush after the move hides a cancelled transition
            const frames: number[] = [];
            const start = performance.now();
            return new Promise<MoveFrames>((resolve) => {
                const onFrame = () => {
                    const current = left();
                    if (current !== undefined) {
                        frames.push(current);
                    }
                    if (performance.now() - start < 400) {
                        requestAnimationFrame(onFrame);
                    } else {
                        resolve({ before, from, to, frames });
                    }
                };
                requestAnimationFrame(onFrame);
            });
        },
        { colId, toIndex, width: COLUMN_WIDTH }
    );
}

function expectSlid(move: MoveFrames): void {
    const from = move.from;
    const to = move.to;
    const frames = move.frames;
    const [low, high] = from < to ? [from, to] : [to, from];
    expect(Math.round(frames[frames.length - 1])).toBe(Math.round(to));
    expect(frames.some((left) => left > low + 1 && left < high - 1)).toBe(true);
}

const frameworks = [
    { name: 'vanilla', mount: mountVanillaGrid },
    { name: 'React', mount: mountReactGrid },
];

test.describe('column move animation in a real browser', () => {
    for (const framework of frameworks) {
        const name = framework.name;
        const mount = framework.mount;
        test(`${name}: a visible column slides to its new position when moved`, async ({ page }) => {
            await mount(page);

            const move = await moveAndSample(page, 'c0', 2);

            expect(move.before).toBe(move.from);
            expectSlid(move);
        });

        test(`${name}: a column moved into view from off screen slides in from its old position`, async ({ page }) => {
            await mount(page);

            const move = await moveAndSample(page, 'c19', 0);

            expect(move.before).toBeUndefined();
            expectSlid(move);
        });
    }
});
