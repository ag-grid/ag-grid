/**
 * Issue: with `detailRowAutoHeight` in React, a custom detail cell renderer that loads its data before rendering
 * is not resized to its content if its root element changes once the data arrives. `rowComp.tsx` only ever measures
 * the anchor's first child as it was when the row mounted: it polls for it a few render passes, then attaches a
 * resize observer to whatever it found. A renderer that returns `null` while loading is never measured at all, and
 * one that returns a loading placeholder is measured through the placeholder, which React then replaces.
 *
 * Setup: `<AgGridReact masterDetail detailRowAutoHeight detailCellRenderer={...} />` where the renderer fetches its
 * data in `useEffect` (a fake 50ms fetch) and then renders a 500px tall element. The first row is expanded. Two
 * common loading patterns are tested: `if (!data) return null;` and `if (!data) return <p>Loading...</p>;`. A
 * control renders the loading text inside the same root element it later fills with content.
 *
 * Expected: the Master / Detail docs say "set `detailRowAutoHeight: true` in the master-level gridOptions and
 * ensure the content nested inside the detail cell renderer component sets a height value", so once the content has
 * loaded the detail row height should be about 500px.
 *
 * Actual: the control passes. With `return null` the detail row stays at the height it starts at under auto
 * height, so it is effectively hidden; with a placeholder it stays at the placeholder's height.
 *
 * Reported on: AG Grid React 34.2 to 35.3, Vue 33.3.2 and 35.1.0, vanilla JS 35.1.0 and Angular 34.3.1. Only React is
 * exercised by this test.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665).
 * Eleven searches between April and September 2026 (React 34.2 to 35.3, Vue, vanilla JS and Angular) about custom
 * detail cell renderers with overflow, clipped content and the detail row height being wrong, e.g. "master detail
 * row height cut off not showing all rows".
 *
 * Runs real React (UMD builds from node_modules) against the enterprise bundle and the ag-grid-react UMD build in
 * `packages/ag-grid-react/dist/umd`, which `./grid-e2e.sh` does not rebuild.
 */
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import path from 'node:path';

const REPO_ROOT = path.join(__dirname, '../../..');
const CONTENT_HEIGHT = 500;

type LoadingPattern = 'stableRoot' | 'null' | 'placeholder';

async function expectDetailRowSizedToContent(page: Page, pattern: LoadingPattern): Promise<void> {
    await page.setContent(
        '<!DOCTYPE html><html><body><div id="root" style="width:600px;height:800px"></div></body></html>'
    );
    await page.addScriptTag({ path: path.join(REPO_ROOT, 'node_modules/react/umd/react.development.js') });
    await page.addScriptTag({ path: path.join(REPO_ROOT, 'node_modules/react-dom/umd/react-dom.development.js') });
    await page.addScriptTag({
        path: path.join(REPO_ROOT, 'packages/ag-grid-enterprise/dist/ag-grid-enterprise.js'),
    });
    await page.evaluate(() => {
        (window as any)['ag-grid-community'] = (window as any).agGrid;
    });
    await page.addScriptTag({ path: path.join(REPO_ROOT, 'packages/ag-grid-react/dist/umd/ag-grid-react.js') });

    await page.evaluate(
        ({ pattern, contentHeight }) => {
            const w = window as any;
            const React = w.React;
            const { AgGridReact } = w.AgGridReact;
            const h = React.createElement;

            const useDetailData = () => {
                const [data, setData] = React.useState(undefined);
                React.useEffect(() => {
                    const timer = setTimeout(() => setData('detail content'), 50);
                    return () => clearTimeout(timer);
                }, []);
                return data;
            };
            const content = (data: string) =>
                h('div', { className: 'test-detail-content', style: { height: contentHeight } }, data);

            const DetailRenderer = () => {
                const data = useDetailData();
                if (pattern === 'stableRoot') {
                    return h('div', { className: 'test-detail-root' }, data ? content(data) : 'Loading...');
                }
                if (!data) {
                    return pattern === 'null' ? null : h('p', { className: 'test-detail-loading' }, 'Loading...');
                }
                return content(data);
            };

            const grid = h(
                'div',
                { style: { height: 800, width: 600 } },
                h(AgGridReact, {
                    columnDefs: [{ field: 'k', cellRenderer: 'agGroupCellRenderer' }],
                    rowData: [{ k: '1' }],
                    masterDetail: true,
                    detailRowAutoHeight: true,
                    detailCellRenderer: DetailRenderer,
                    onGridReady: (e: any) => (w.gridApi = e.api),
                })
            );
            w.ReactDOM.createRoot(document.getElementById('root')).render(grid);
        },
        { pattern, contentHeight: CONTENT_HEIGHT }
    );

    await page.waitForFunction(() => (window as any).gridApi?.getDisplayedRowAtIndex(0));
    await page.evaluate(() => (window as any).gridApi.getDisplayedRowAtIndex(0).setExpanded(true));
    await expect(page.locator('.test-detail-content')).toBeVisible();

    await expect
        .poll(() => page.evaluate(() => (window as any).gridApi.getDisplayedRowAtIndex(1)?.rowHeight), {
            message: 'detail row height',
        })
        .toBeGreaterThanOrEqual(CONTENT_HEIGHT);
}

test.describe('React detailRowAutoHeight with a detail renderer that loads data first', () => {
    test('control: renderer that keeps the same root element while loading is auto-sized', async ({ page }) => {
        await expectDetailRowSizedToContent(page, 'stableRoot');
    });

    test('renderer that returns null while loading is auto-sized', async ({ page }) => {
        await expectDetailRowSizedToContent(page, 'null');
    });

    test('renderer that returns a loading placeholder while loading is auto-sized', async ({ page }) => {
        await expectDetailRowSizedToContent(page, 'placeholder');
    });
});
